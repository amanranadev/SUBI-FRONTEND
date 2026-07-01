import { WEBSOCKET_URL } from "@/Config";
import { MessageComposedData } from "@/types/message";
import {
  AudioModule,
  AudioPlayer,
  AudioRecorder,
  createAudioPlayer,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { getToken } from "./authService";

export interface VoiceWebSocketMessage {
  type:
  | "connection_established"
  | "confirm_subscription"
  | "session_started"
  | "status_update"
  | "voice_processing_started"
  | "message_processing_started"
  | "voice_response"
  | "assistant_response"
  | "system_response"
  | "audio_output"
  | "output_audio_done"
  | "response_done"
  | "voice_error"
  | "job_started"
  | "job_completed"
  | "job_failed"
  | "error"
  | "command_result"
  | "voice_chunk_received"
  | "message_composed"
  | "transcription"
  | "output_transcription"
  | "ping"
  | "pong"
  | "unknown_message";
  data?: any;
  job_id?: string;
  status?: string;
  message?: string;
  content?: string;
  error?: string;
  audio?: string;
  response_id?: string;
  timestamp?: string;
}

/**
 * Voice Interaction State Machine
 * States are mutually exclusive to prevent UI mismatches
 */
export type VoiceState =
  | "idle"           // Ready for input
  | "recording"      // User is speaking
  | "processing"     // Audio is being sent/processed by server (no audio output yet)
  | "speaking"       // AI is speaking/playing audio response
  | "ready";         // Response complete, ready for next input

type SpeakingStateCallback = (isSpeaking: boolean) => void;
type ConnectionCallback = (isConnected: boolean) => void;
type MessageCallback = (message: VoiceWebSocketMessage) => void;
type AudioResponseCallback = (audio: {
  id: string;
  audio: string;
  format: string;
}) => void;
type RecordingStateCallback = (isRecording: boolean) => void;
type ResponseReadyCallback = (isReady: boolean) => void;
type ProcessingStateCallback = (isProcessing: boolean) => void;
type VoiceStateCallback = (state: VoiceState) => void;
type ErrorCallback = (error: { message: string; type: string }) => void;
type MessageComposedCallback = (message: MessageComposedData) => void;

class VoiceWebSocketService {
  private websocket: WebSocket | null = null;
  private isConnected = false;
  private subscribed = false;
  private sessionStarted = false;
  private sessionRequested = false;
  private sessionStartLock = false;

  // State Machine: Single source of truth for voice interaction state
  private voiceState: VoiceState = "idle";
  private voiceStateCallbacks: VoiceStateCallback[] = [];

  // State is managed through the state machine above
  // Legacy getters removed - use state machine methods instead
  private recordingStartTime: number | null = null;
  private recording: AudioRecorder | null = null;
  private player: AudioPlayer | null = null;
  private audioChunks: string[] = [];
  private currentResponseId: string | null = null;
  private streamComplete = false;
  private isAudioPlaying = false;
  private finalizedJobIds: Set<string> = new Set();
  private speakingStateCallbacks: SpeakingStateCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  private messageCallbacks: MessageCallback[] = [];
  private audioResponseCallbacks: AudioResponseCallback[] = [];
  private recordingStateCallbacks: RecordingStateCallback[] = [];
  private responseReadyCallbacks: ResponseReadyCallback[] = [];
  private processingStateCallbacks: ProcessingStateCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private messageComposedCallbacks: MessageComposedCallback[] = [];
  /**
   * State Machine Transition Method
   * Ensures clean, atomic state transitions and notifies all callbacks
   */
  private transitionToState(newState: VoiceState, reason?: string): void {
    const oldState = this.voiceState;

    // Validate state transition
    // Allow recovery transitions: ready/idle → speaking (for late-arriving or new responses)
    const validTransitions: Record<VoiceState, VoiceState[]> = {
      idle: ["recording", "speaking", "ready", "processing"],
      recording: ["processing", "idle"],
      processing: ["speaking", "idle", "ready"],
      speaking: ["idle", "ready"],
      ready: ["recording", "idle", "speaking", "processing"], // Allow speaking for new responses
    };

    if (oldState !== newState && !validTransitions[oldState]?.includes(newState)) {
      console.warn(
        `⚠️ [STATE] Invalid transition: ${oldState} → ${newState}${reason ? ` (${reason})` : ""}`
      );
      // Allow recovery: if we're trying to go to speaking from ready/idle, allow it (late response)
      if (newState === "speaking" && (oldState === "ready" || oldState === "idle")) {
        console.log(`✅ [STATE] Allowing recovery transition: ${oldState} → ${newState} (late/new response)`);
        // Continue with transition
      } else {
        return;
      }
    }

    if (oldState === newState) {
      return; // No change needed
    }

    this.voiceState = newState;
    console.log(`🔄 [STATE] ${oldState} → ${newState}${reason ? ` (${reason})` : ""}`);

    // Notify state machine callbacks
    this.voiceStateCallbacks.forEach((callback) => callback(newState));

    // Notify legacy boolean callbacks for backward compatibility
    this.recordingStateCallbacks.forEach((callback) => callback(newState === "recording"));
    this.speakingStateCallbacks.forEach((callback) => callback(newState === "speaking"));
    this.processingStateCallbacks.forEach((callback) => callback(newState === "processing"));
    this.responseReadyCallbacks.forEach((callback) =>
      callback(newState === "ready" || newState === "idle")
    );
  }



  // Queue System Properties
  private playbackQueue: string[] = []; // Queue of audio file paths
  private isPlayingQueue: boolean = false; // Flag if queue processor is running
  private playbackPollInterval: NodeJS.Timeout | null = null; // Polling interval for playback
  private BATCH_SIZE = 10; // Process every 10 chunks (~1s of audio)
  private isFirstAudioChunk: boolean = true; // Track if this is the first audio chunk (for modal sync)

  // Modal-Audio Synchronization (Industry Standard Event-Driven Approach)
  // Instead of hardcoded delays, we wait for the UI to signal modal readiness
  private modalReadyResolver: (() => void) | null = null;
  private isModalReady: boolean = false;
  private modalReadyPromise: Promise<void> | null = null;

  private readonly audioConfig = {
    extension: ".m4a",
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    android: {
      outputFormat: "mpeg4" as const,
      audioEncoder: "aac" as const,
    },
    ios: {
      audioQuality: RecordingPresets.HIGH_QUALITY.ios.audioQuality,
    },
  };

  constructor() {
    this.setupAudioMode();
  }

  private async setupAudioMode(forRecording: boolean = false) {
    try {
      await setAudioModeAsync({
        allowsRecording: forRecording, // Only enable for recording, false = speaker output on iOS
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: "duckOthers",
        interruptionModeAndroid: "duckOthers",
        ...(Platform.OS === "android" && { shouldRouteThroughEarpiece: false }),
      });
    } catch (error) { }
  }

  private validateToken(token: string): { valid: boolean; error?: string } {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return { valid: false, error: "Invalid JWT format" };
      }

      const payload = JSON.parse(atob(parts[1]));

      if (!payload.sub) {
        return { valid: false, error: "Missing 'sub' (User ID) in token" };
      }
      if (!payload.jti) {
        return { valid: false, error: "Missing 'jti' (Token ID) in token" };
      }
      if (!payload.exp) {
        return { valid: false, error: "Missing 'exp' (Expiration) in token" };
      }

      if (Date.now() >= payload.exp * 1000) {
        return { valid: false, error: "Token has expired" };
      }

      if (typeof payload.sub !== "number") {
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: `Token validation error: ${error}` };
    }
  }

  async connect(jwtToken?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (
        this.isConnected &&
        this.websocket &&
        this.websocket.readyState === WebSocket.OPEN
      ) {
        resolve();
        return;
      }

      if (this.websocket) {
        const oldWebsocket = this.websocket;
        this.websocket = null;
        this.isConnected = false;
        this.subscribed = false;
        try {
          if (
            oldWebsocket.readyState === WebSocket.OPEN ||
            oldWebsocket.readyState === WebSocket.CONNECTING
          ) {
            oldWebsocket.close();
          }
        } catch (error) { }
      }

      const token = jwtToken || getToken();
      if (!token) {
        reject(new Error("No JWT token available"));
        return;
      }

      const validation = this.validateToken(token);
      if (!validation.valid) {
        reject(new Error(`Token validation failed: ${validation.error}`));
        return;
      }

      const wsUrl = WEBSOCKET_URL || "ws://127.0.0.1:8080/cable";
      const fullUrl = `${wsUrl}?token=${token}`;

      try {
        this.websocket = new WebSocket(fullUrl);

        this.websocket.onopen = () => {
          this.isConnected = true;
          this.subscribeToVoiceChannel();
          this.sessionStarted = false;
          this.sessionRequested = false;
          this.sessionStartLock = false;
          this.transitionToState("idle", "connection opened");
          this.connectionCallbacks.forEach((callback) => callback(true));
          resolve();
        };

        this.websocket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('🎙️ [VoiceWS] Raw incoming:', JSON.stringify(message, null, 2));
            this.handleMessage(message);
          } catch (error) { }
        };

        this.websocket.onclose = (event) => {
          this.isConnected = false;
          this.subscribed = false;
          this.connectionCallbacks.forEach((callback) => callback(false));
        };

        this.websocket.onerror = (error) => {
          this.connectionCallbacks.forEach((callback) => callback(false));
          reject(error);
        };

        setTimeout(() => {
          if (!this.isConnected) {
            this.connectionCallbacks.forEach((callback) => callback(false));
            reject(new Error("Connection timeout"));
          }
        }, 15000);
      } catch (error) {
        reject(error);
      }
    });
  }

  private subscribeToVoiceChannel() {
    if (!this.websocket || !this.isConnected) {
      return;
    }

    const subscribeMessage = {
      command: "subscribe",
      identifier: JSON.stringify({ channel: "VoiceChannel" }),
    };

    this.websocket.send(JSON.stringify(subscribeMessage));
    this.subscribed = true;
  }

  startSession() {
    if (!this.isConnected || !this.websocket || !this.subscribed) {
      throw new Error(
        "Not connected to WebSocket or not subscribed to VoiceChannel"
      );
    }

    if (this.sessionStarted) {
      return;
    }

    if (this.sessionStartLock) {
      return;
    }

    if (this.sessionRequested) {
      return;
    }

    this.sessionStartLock = true;

    const startSessionMessage = {
      command: "message",
      identifier: JSON.stringify({ channel: "VoiceChannel" }),
      data: JSON.stringify({ action: "start_session" }),
    };

    this.websocket.send(JSON.stringify(startSessionMessage));
    this.sessionRequested = true;

    setTimeout(() => {
      this.sessionStartLock = false;
    }, 1000);
  }

  private handleMessage(data: any) {
    // Log ALL incoming messages for debugging
    console.log("📥 [MOBILE] Received message type:", data.message?.type || data.type || "unknown");

    if (data.type === "ping") {
      if (this.websocket && this.isConnected) {
        this.websocket.send(
          JSON.stringify({ type: "pong", message: data.message })
        );
      }
      return;
    }

    if (data.type === "disconnect" || data.reason === "unauthorized") {
      this.isConnected = false;
      this.subscribed = false;
      this.connectionCallbacks.forEach((callback) => callback(false));
      return;
    }

    let messageData = data;
    if (data.message && typeof data.message === "object") {
      messageData = data.message;
    }

    if (data.type === "confirm_subscription") {
      return;
    }

    const message: VoiceWebSocketMessage = {
      type: messageData.type || "unknown_message",
      data: messageData.data || messageData,
      job_id: messageData.job_id,
      status: messageData.status,
      message: messageData.message,
      content: messageData.content,
      error: messageData.error,
      audio: messageData.audio || (messageData.data && messageData.data.audio),
      response_id:
        messageData.response_id ||
        (messageData.data && messageData.data.response_id),
      timestamp: messageData.timestamp || new Date().toISOString(),
    };

    this.messageCallbacks.forEach((callback) => callback(message));

    switch (message.type) {
      case "connection_established":
        break;

      case "confirm_subscription":
        break;

      case "session_started":
        this.sessionStarted = true;
        this.sessionRequested = false;
        this.sessionStartLock = false;
        break;

      case "voice_chunk_received":
        break;

      case "status_update":
        if (
          message.status === "connected" ||
          message.status === "session_created"
        ) {
          this.sessionStarted = true;
          this.sessionRequested = false;
          this.sessionStartLock = false;
        } else if (message.status === "disconnected") {
          this.sessionStarted = false;
          this.sessionRequested = false;
          this.sessionStartLock = false;
        }
        break;

      case "job_started":
        break;

      case "voice_processing_started":
      case "message_processing_started":
        // Transition to processing from any non-processing state
        // This handles new requests starting while in ready/idle/speaking
        if (this.voiceState !== "processing") {
          // If we're speaking, that means a previous response is still playing
          // In this case, we should allow processing to start (new request)
          // But typically we shouldn't start new processing while speaking
          // For now, allow it but log a warning
          if (this.voiceState === "speaking") {
            console.warn("⚠️ [STATE] New processing started while speaking - allowing transition");
          }
          this.transitionToState("processing", "server started processing");
        }
        break;

      case "audio_output":
        // Handle audio output - transition to speaking if not already
        const previousState = this.voiceState;
        const wasReadyOrIdle = previousState === "ready" || previousState === "idle";
        const wasProcessing = previousState === "processing";

        if (wasProcessing || wasReadyOrIdle) {
          // Transition to speaking: processing → speaking, or ready/idle → speaking (late/new response)
          const reason = wasProcessing
            ? "first audio chunk received"
            : "audio received (new/late response)";

          // Mark this as the first audio chunk for the new response
          // Reset modal ready state BEFORE state transition so UI can set up listeners
          this.isFirstAudioChunk = true;
          this.resetModalReadyState();

          // Now transition to speaking - this notifies UI to show the modal
          this.transitionToState("speaking", reason);

          // Reset stream state for new response (if coming from ready/idle)
          if (wasReadyOrIdle) {
            this.streamComplete = false;
            this.isAudioPlaying = false;
            // Clear any existing audio chunks and queue for new response
            this.audioChunks = [];
            this.playbackQueue = [];
            this.isPlayingQueue = false;
            // Clear any playback polling interval
            if (this.playbackPollInterval) {
              clearInterval(this.playbackPollInterval);
              this.playbackPollInterval = null;
            }
          }
        }
        // If already speaking, stay in speaking state

        if (message.audio) {
          this.handleAudioChunk(message.audio, message.response_id);
          if (this.streamComplete) {
            // If stream marked complete during chunk handling, finalize
            this.finalizeStream();
          }
        }
        break;

      case "output_audio_done":
        // Clear fallback timeout (if any) and flush remaining chunks
        if (this.audioStreamTimeoutId) {
          clearTimeout(this.audioStreamTimeoutId);
          this.audioStreamTimeoutId = null;
        }
        this.streamComplete = true;

        // Flush any remaining partial batch
        this.flushToQueue();

        // Note: Don't transition state here - wait for finalizeAudioResponse() 
        // which is called after playback completes

        // Finalize stream (cleanup after queue finishes)
        this.finalizeStream();
        break;

      case "response_done":
        // Clear fallback timeout since we received proper done signal
        if (this.audioStreamTimeoutId) {
          clearTimeout(this.audioStreamTimeoutId);
          this.audioStreamTimeoutId = null;
        }
        const responseJobId = message.job_id || null;
        if (responseJobId) {
          this.finalizedJobIds.add(responseJobId);
        }
        this.streamComplete = true;

        // Flush any remaining partial batch
        this.flushToQueue();

        // Note: Don't transition state here - wait for finalizeAudioResponse() 
        // which is called after playback completes

        // Finalize stream
        this.finalizeStream();
        break;

      case "voice_error":
      case "job_failed":
      case "error":
        const errorMessage = message.error || message.message || "";
        console.log("🚨 [MOBILE] ERROR RECEIVED:", errorMessage);
        const jobId = message.job_id || null;

        // Ignore errors for already finalized jobs
        if (jobId && this.finalizedJobIds.has(jobId)) {
          break;
        }

        if (jobId) {
          this.finalizedJobIds.add(jobId);
        }

        // Handle errors based on current state
        const currentState = this.voiceState;

        // If we're in processing, error means processing failed - go to idle
        if (currentState === "processing") {
          console.log("⚠️ [STATE] Error during processing, resetting to idle");

          // Only notify error callbacks for connection-related errors (show toast)
          if (this.isConnectionError(errorMessage)) {
            const userFriendlyMessage = this.getUserFriendlyErrorMessage(errorMessage);
            this.errorCallbacks.forEach((callback) =>
              callback({
                message: userFriendlyMessage,
                type: message.type,
              })
            );
          }

          this.transitionToState("idle", "processing error");
          // Don't finalize audio response - there's no audio to finalize
        }
        // If we're speaking, error might be non-fatal - wait for stream completion
        // Don't transition immediately, let the stream complete naturally
        else if (currentState === "speaking") {
          console.log("⚠️ [STATE] Error during speaking, continuing playback");
          // Don't transition - audio might still be valid, let finalizeStream handle it
        }
        // If we're in other states, reset to idle
        else {
          this.transitionToState("idle", "error occurred");
        }
        break;

      case "job_completed":
        break;

      case "assistant_response":
      case "system_response":
      case "voice_response":
        break;

      case "message_composed":
        try {
          // Extract MessageComposedData from message.data
          const composedData = message.data;

          if (!composedData) {
            console.warn("⚠️ [MOBILE] message_composed received but no data found");
            break;
          }

          // Validate required fields
          if (!composedData.message_id) {
            console.warn("⚠️ [MOBILE] message_composed missing message_id");
            break;
          }

          if (!composedData.contact || !composedData.contact.id) {
            console.warn("⚠️ [MOBILE] message_composed missing contact information");
            break;
          }

          // Construct MessageComposedData with proper type safety and fallbacks
          const messageComposedData: MessageComposedData = {
            message_id: composedData.message_id,
            message_type: composedData.message_type || "email",
            contact: {
              id: composedData.contact.id,
              name: composedData.contact.name ?? "",
              email: composedData.contact.email ?? "",
              phone: composedData.contact.phone ?? null,
            },
            subject: composedData.subject ?? "",
            body: composedData.body ?? "",
            requires_confirmation: composedData.requires_confirmation ?? true,
          };

          // Notify all registered callbacks
          this.messageComposedCallbacks.forEach((callback) => {
            try {
              callback(messageComposedData);
            } catch (callbackError) {
              console.error("❌ [MOBILE] Error in message_composed callback:", callbackError);
            }
          });
        } catch (error) {
          console.error("❌ [MOBILE] Error processing message_composed:", error);
        }
        break;

      default:
    }
  }

  // Timeout ID for audio stream completion fallback
  private audioStreamTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private handleAudioChunk(base64Chunk: string, responseId?: string) {
    if (!base64Chunk || typeof base64Chunk !== "string") {
      return;
    }

    const cleanedChunk = base64Chunk.replace(/\s/g, "");
    if (cleanedChunk.length === 0) {
      return;
    }

    // Reset state for new response (server handles deduplication)
    if (responseId && responseId !== this.currentResponseId) {
      this.audioChunks = [];
      this.currentResponseId = responseId;
      this.playbackQueue = [];
      this.isPlayingQueue = false;
    }

    this.audioChunks.push(cleanedChunk);

    // Clear any existing timeout
    if (this.audioStreamTimeoutId) {
      clearTimeout(this.audioStreamTimeoutId);
    }

    // 🚀 BATCH PROCESSING: If we reached batch size, flush to queue
    if (this.audioChunks.length >= this.BATCH_SIZE) {
      this.flushToQueue();
    }

    // Set a timeout - if no new chunks or done signal in 2 seconds, assume stream is complete
    this.audioStreamTimeoutId = setTimeout(() => {
      if (this.audioChunks.length > 0 && !this.streamComplete) {
        this.streamComplete = true;
        this.flushToQueue();
        this.finalizeStream();
      }
    }, 2000);
  }

  // Write current chunks to a temp file and add to queue
  private async flushToQueue() {
    if (this.audioChunks.length === 0) return;

    try {
      const chunkCount = this.audioChunks.length;
      const combinedAudio = this.audioChunks.join("");
      this.audioChunks = []; // Clear buffer immediately

      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substring(7);
      const tempPath = `${FileSystem.cacheDirectory}voice_batch_${timestamp}_${uniqueId}.wav`;

      const wavData = this.base64PCMToWAV(combinedAudio);

      await FileSystem.writeAsStringAsync(tempPath, wavData, {
        encoding: "base64" as any,
      });

      this.playbackQueue.push(tempPath);

      // Trigger processing if not already running
      if (!this.isPlayingQueue) {
        this.processQueue();
      }
    } catch (error) {
      console.error("Error flushing batch:", error);
    }
  }

  // Call this when the speaking modal becomes visible (from onChange callback with index >= 0)
  // This releases the audio playback queue to start playing
  signalModalReady(): void {
    console.log("🔔 [SYNC] Modal signaled ready");
    this.isModalReady = true;
    if (this.modalReadyResolver) {
      this.modalReadyResolver();
      this.modalReadyResolver = null;
    }
  }

  // Reset modal ready state when starting a new response
  // Creates a new promise that audio playback will wait for
  private resetModalReadyState(): void {
    this.isModalReady = false;
    this.modalReadyPromise = new Promise<void>((resolve) => {
      this.modalReadyResolver = resolve;
    });
    console.log("🔄 [SYNC] Modal ready state reset - audio will wait for signal");
  }

  // Wait for modal to be ready with a timeout fallback
  // Returns immediately if modal is already ready
  private async waitForModalReady(): Promise<void> {
    if (this.isModalReady) {
      console.log("✅ [SYNC] Modal already ready, proceeding immediately");
      return;
    }

    if (!this.modalReadyPromise) {
      // No promise exists, use fallback delay
      console.log("⚠️ [SYNC] No modal promise, using fallback delay");
      await new Promise((resolve) => setTimeout(resolve, 300));
      return;
    }

    console.log("⏳ [SYNC] Waiting for modal ready signal...");

    // Race between modal ready signal and timeout
    // Timeout ensures we don't wait forever if something goes wrong
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log("⏱️ [SYNC] Timeout reached, proceeding with playback");
        resolve();
      }, 500); // 500ms max wait - generous but prevents indefinite blocking
    });

    await Promise.race([this.modalReadyPromise, timeoutPromise]);
    console.log("✅ [SYNC] Modal wait complete, starting audio playback");
  }

  // Process the playback queue sequentially
  private async processQueue() {
    // Prevent concurrent processing
    if (this.isPlayingQueue) {
      return;
    }

    if (this.playbackQueue.length === 0) {
      this.isPlayingQueue = false;
      this.finalizeStream();
      return;
    }

    // Set flag immediately before any async operations
    this.isPlayingQueue = true;
    const audioPath = this.playbackQueue.shift();

    if (!audioPath) {
      this.isPlayingQueue = false;
      return;
    }

    try {
      // If this is the first audio chunk of a new response, wait for modal to be visible
      // This is the industry-standard event-driven approach vs hardcoded delays
      if (this.isFirstAudioChunk) {
        this.isFirstAudioChunk = false;
        // Switch to playback mode (speaker output on iOS) - only once per response
        await this.setupAudioMode(false);
        await this.waitForModalReady();
      }

      // Properly cleanup previous player to prevent audio overlap/mixing
      if (this.player) {
        try {
          this.player.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        this.player = null;
      }

      // Clear any existing poll interval before creating new player
      if (this.playbackPollInterval) {
        clearInterval(this.playbackPollInterval);
        this.playbackPollInterval = null;
      }

      this.player = createAudioPlayer({ uri: audioPath });

      try {
        this.player.volume = 1.0;
      } catch (e) { }

      // Track playback start time for timeout fallback
      const playbackStartTime = Date.now();
      const MAX_PLAYBACK_TIME = 30000; // 30 second max per chunk (fallback)
      let hasCompleted = false;

      const completePlayback = () => {
        if (hasCompleted) return;
        hasCompleted = true;

        // Remove listener and cleanup
        if (this.playbackPollInterval) {
          clearInterval(this.playbackPollInterval);
          this.playbackPollInterval = null;
        }

        // Cleanup current player before next
        if (this.player) {
          try {
            this.player.remove();
          } catch (e) { }
          this.player = null;
        }

        // Cleanup temp file
        FileSystem.deleteAsync(audioPath, { idempotent: true }).catch(() => { });

        // Release lock before processing next item
        this.isPlayingQueue = false;

        // Process next item in queue
        this.processQueue();
      };

      // Playback status polling with timeout fallback
      const handlePlaybackStatus = () => {
        if (hasCompleted) return;

        // Timeout fallback - if playback takes too long, move on
        if (Date.now() - playbackStartTime > MAX_PLAYBACK_TIME) {
          console.warn("⏱️ [AUDIO] Playback timeout - forcing completion");
          completePlayback();
          return;
        }

        if (!this.player) {
          // Player was removed externally, complete playback
          console.warn("⚠️ [AUDIO] Player missing - completing playback");
          completePlayback();
          return;
        }

        try {
          const status = this.player.currentStatus;

          // Check for completion
          if (status.didJustFinish) {
            completePlayback();
            return;
          }

          // Check if loaded and near end
          if (status.isLoaded && status.duration > 0 && status.currentTime >= status.duration - 0.05) {
            completePlayback();
            return;
          }

          // Check for playback error or stall (not playing after 2 seconds)
          if (Date.now() - playbackStartTime > 2000 && status.isLoaded && !status.playing && status.currentTime === 0) {
            console.warn("⚠️ [AUDIO] Playback stalled - forcing completion");
            completePlayback();
            return;
          }
        } catch (e) {
          // If status check fails, complete playback
          console.error("Error checking playback status:", e);
          completePlayback();
        }
      };

      this.player.play();
      this.isAudioPlaying = true;

      // Use polling with proper cleanup for completion detection
      this.playbackPollInterval = setInterval(handlePlaybackStatus, 50);

    } catch (error) {
      console.error("Error playing audio chunk:", error);

      // Cleanup on error to prevent audio mixing
      if (this.playbackPollInterval) {
        clearInterval(this.playbackPollInterval);
        this.playbackPollInterval = null;
      }
      if (this.player) {
        try {
          this.player.remove();
        } catch (e) { }
        this.player = null;
      }

      // Cleanup failed temp file
      FileSystem.deleteAsync(audioPath, { idempotent: true }).catch(() => { });

      // Release lock before trying next
      this.isPlayingQueue = false;
      this.processQueue(); // Try next
    }
  }

  private finalizeStream() {
    // Only finalize if everything is done: stream complete, queue empty, buffer empty
    if (
      this.streamComplete &&
      this.audioChunks.length === 0 &&
      this.playbackQueue.length === 0 &&
      !this.isPlayingQueue
    ) {
      // Clear poll interval
      if (this.playbackPollInterval) {
        clearInterval(this.playbackPollInterval);
        this.playbackPollInterval = null;
      }

      // Cleanup player to prevent any lingering audio
      if (this.player) {
        try {
          this.player.remove();
        } catch (e) { }
        this.player = null;
      }

      this.isAudioPlaying = false;
      this.streamComplete = false;
      this.finalizeAudioResponse();
    }
  }

  private async finalizeAudioResponse() {
    // Only transition to ready if we're currently speaking or processing
    // Don't transition if we're already in idle (error occurred) or ready (already finalized)
    if (this.voiceState === "speaking") {
      this.transitionToState("ready", "audio response complete");
    } else if (this.voiceState === "processing") {
      // If we're still in processing but finalizing, something went wrong
      // Transition to idle instead of ready since there's no response
      this.transitionToState("idle", "processing complete without response");
    }
    // If already in ready or idle, do nothing (avoid duplicate transitions)
  }



  canStartRecording(): boolean {
    // Can only start recording from idle or ready states
    return this.voiceState === "idle" || this.voiceState === "ready";
  }

  async startRecording(): Promise<void> {
    if (this.voiceState === "recording") {
      return;
    }

    if (!this.canStartRecording()) {
      const reason =
        this.voiceState === "speaking"
          ? "AI is still speaking"
          : "Recording is not available";
      throw new Error(`Cannot start recording: ${reason}`);
    }

    // Reset stream state for new recording
    this.streamComplete = false;
    this.isAudioPlaying = false;
    this.audioChunks = [];
    this.currentResponseId = null;
    this.isFirstAudioChunk = true; // Reset for upcoming response
    this.isModalReady = false; // Reset modal sync state
    this.modalReadyResolver = null;
    this.modalReadyPromise = null;

    try {
      const { status } = await requestRecordingPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Microphone permission denied");
      }

      // Enable recording mode (switches to earpiece on iOS, but needed for mic access)
      await this.setupAudioMode(true);

      this.recording = new AudioModule.AudioRecorder(this.audioConfig);
      await this.recording.prepareToRecordAsync();
      this.recording.record();

      this.recordingStartTime = Date.now();
      this.transitionToState("recording", "recording started");
    } catch (error) {
      // On error, ensure we're back to idle state
      // Clean up recording reference if it exists
      if (this.recording) {
        try {
          this.recording.release();
        } catch (e) {
          // Ignore release errors
        }
        this.recording = null;
      }
      this.recordingStartTime = null;
      // Reset to idle if we're in any non-idle state (handles edge cases)
      if (this.voiceState !== "idle") {
        this.transitionToState("idle", "recording failed");
      }
      throw error;
    }
  }

  async stopRecording(): Promise<void> {
    if (this.voiceState !== "recording" || !this.recording) {
      return;
    }

    // Capture recording reference before state transition
    const recordingRef = this.recording;
    const recordingStartTimeRef = this.recordingStartTime;

    // Clear recording references
    this.recordingStartTime = null;
    this.recording = null;

    // Immediately transition to processing state for responsive UI
    this.transitionToState("processing", "recording stopped - processing audio");

    // Process audio in background without blocking UI
    this.processAndSendRecording(recordingRef, recordingStartTimeRef).catch((error) => {
      console.error("❌ [MOBILE] Background audio processing failed:", error);
      // On error, transition back to idle
      if (this.voiceState === "processing") {
        this.transitionToState("idle", "processing failed");
      }
    });
  }

  /**
   * Process and send the recorded audio in the background.
   * This is separated from stopRecording() to enable optimistic UI updates.
   */
  private async processAndSendRecording(
    recordingRef: AudioRecorder,
    recordingStartTimeRef: number | null
  ): Promise<void> {
    let uri: string | null = null;

    try {
      await recordingRef.stop();

      uri = recordingRef.uri;

      if (!uri) {
        throw new Error("No recording URI available");
      }

      const recordingDuration = recordingStartTimeRef
        ? Date.now() - recordingStartTimeRef
        : 0;
      const minimumDuration = 100;

      if (recordingDuration < minimumDuration) {
        recordingRef.release();
        await FileSystem.deleteAsync(uri, { idempotent: true });
        throw new Error(
          `Recording too short. Please record for at least ${minimumDuration}ms.`
        );
      }

      const fileInfo = await FileSystem.getInfoAsync(uri);

      if (!fileInfo.exists) {
        recordingRef.release();
        throw new Error("Recording file does not exist");
      }

      if ("size" in fileInfo && fileInfo.size !== undefined) {
        if (fileInfo.size === 0 || fileInfo.size < 100) {
          recordingRef.release();
          await FileSystem.deleteAsync(uri, { idempotent: true });
          throw new Error("Recording file is too small or empty");
        }
      }

      // Read the actual recorded audio file
      const audioBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64" as any,
      });
      console.log("🎤 [MOBILE] Recorded audio size:", audioBase64.length, "bytes (base64)");

      if (!this.isConnected || !this.subscribed) {
        const token = getToken();
        if (token) {
          try {
            await this.connect(token);
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (reconnectError) {
            throw new Error("Failed to reconnect to WebSocket");
          }
        } else {
          throw new Error("No token available for reconnection");
        }
      }

      if (
        !this.sessionStarted &&
        !this.sessionRequested &&
        !this.sessionStartLock
      ) {
        try {
          this.startSession();
        } catch (sessionError) {
          throw new Error("Failed to start session before sending audio");
        }

        let sessionConfirmed = false;
        for (let i = 0; i < 30; i++) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          if (this.sessionStarted) {
            sessionConfirmed = true;
            break;
          }
        }
      } else if (this.sessionRequested || this.sessionStartLock) {
        let sessionConfirmed = false;
        for (let i = 0; i < 30; i++) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          if (this.sessionStarted) {
            sessionConfirmed = true;
            break;
          }
        }
      }

      await this.sendVoiceData(audioBase64);

      recordingRef.release();
      if (uri) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch (error) {
      // Clean up recording reference on error
      try {
        recordingRef.release();
      } catch (e) {
        // Ignore release errors
      }
      if (uri) {
        await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => { });
      }
      // Note: State is already updated at the start of stopRecording() 
      // so no need to update it again here
      throw error; // Re-throw for logging in the caller
    }
  }

  async sendVoiceData(audioData: string): Promise<boolean> {
    console.log("📤 [MOBILE] sendVoiceData called");

    if (!this.isConnected || !this.websocket || !this.subscribed) {
      console.log("❌ [MOBILE] Not connected/subscribed");
      return false;
    }

    if (this.websocket.readyState !== WebSocket.OPEN) {
      console.log("❌ [MOBILE] WebSocket not open");
      return false;
    }

    try {
      const MAX_CHUNK_SIZE = 8 * 1024;
      const timestamp = new Date().toISOString();
      const audioId = `audio_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const cleanBase64 = audioData.replace(/\s/g, "");

      // console.log("📦 [MOBILE] Audio data size:", cleanBase64.length, "bytes");
      // console.log("📦 [MOBILE] Audio ID:", audioId);
      // console.log("📦 [MOBILE] Format: m4a, MimeType: audio/mp4");

      if (cleanBase64.length <= MAX_CHUNK_SIZE) {
        console.log("📤 [MOBILE] Sending as single chunk");
        const voiceMessage = {
          command: "message",
          identifier: JSON.stringify({ channel: "VoiceChannel" }),
          data: JSON.stringify({
            action: "process_voice",
            audio: cleanBase64,
            format: "m4a",
            mimeType: "audio/m4a",
            timestamp: timestamp,
            audio_id: audioId,
            chunk_index: 0,
            total_chunks: 1,
          }),
        };

        this.websocket.send(JSON.stringify(voiceMessage));
      } else {
        const chunks: string[] = [];
        const base64ChunkSize = Math.floor(MAX_CHUNK_SIZE / 4) * 4;

        for (let i = 0; i < cleanBase64.length; i += base64ChunkSize) {
          chunks.push(cleanBase64.slice(i, i + base64ChunkSize));
        }

        const startMessage = {
          command: "message",
          identifier: JSON.stringify({ channel: "VoiceChannel" }),
          data: JSON.stringify({
            action: "process_voice_start",
            audio: chunks[0],
            format: "m4a",
            mimeType: "audio/m4a",
            timestamp: timestamp,
            audio_id: audioId,
            chunk_index: 0,
            total_chunks: chunks.length,
          }),
        };
        this.websocket.send(JSON.stringify(startMessage));

        for (let chunkIndex = 1; chunkIndex < chunks.length; chunkIndex++) {
          const chunkMessage = {
            command: "message",
            identifier: JSON.stringify({ channel: "VoiceChannel" }),
            data: JSON.stringify({
              action: "process_voice_chunk",
              audio: chunks[chunkIndex],
              format: "m4a",
              mimeType: "audio/m4a",
              timestamp: timestamp,
              audio_id: audioId,
              chunk_index: chunkIndex,
              total_chunks: chunks.length,
            }),
          };
          this.websocket.send(JSON.stringify(chunkMessage));
        }

        const endMessage = {
          command: "message",
          identifier: JSON.stringify({ channel: "VoiceChannel" }),
          data: JSON.stringify({
            action: "process_voice_end",
            audio_id: audioId,
            timestamp: timestamp,
          }),
        };
        this.websocket.send(JSON.stringify(endMessage));
      }

      return true;
    } catch (error) {
      return false;
    }
  }


  private base64PCMToWAV(base64Pcm: string): string {
    const binaryString = atob(base64Pcm);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // No gain amplification - OpenAI audio is already at proper volume
    // Amplification was causing distortion and clipping artifacts
    const sampleRate = 24000;
    const channels = 1;
    const bitsPerSample = 16;
    const dataSize = bytes.length;
    const fileSize = 36 + dataSize;

    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    view.setUint32(0, 0x46464952, true);
    view.setUint32(4, fileSize, true);
    view.setUint32(8, 0x45564157, true);

    view.setUint32(12, 0x20746d66, true);
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, (sampleRate * channels * bitsPerSample) / 8, true);
    view.setUint16(32, (channels * bitsPerSample) / 8, true);
    view.setUint16(34, bitsPerSample, true);

    view.setUint32(36, 0x61746164, true);
    view.setUint32(40, dataSize, true);

    const wavArray = new Uint8Array(44 + dataSize);
    wavArray.set(new Uint8Array(header), 0);
    wavArray.set(bytes, 44);

    let binary = "";
    for (let i = 0; i < wavArray.length; i++) {
      binary += String.fromCharCode(wavArray[i]);
    }
    return btoa(binary);
  }

  sendTextMessage(message: string): boolean {
    if (!this.isConnected || !this.websocket || !this.subscribed) {
      return false;
    }

    const textMessage = {
      command: "message",
      identifier: JSON.stringify({ channel: "VoiceChannel" }),
      data: JSON.stringify({
        action: "send_message",
        message: message.trim(),
        timestamp: new Date().toISOString(),
      }),
    };

    this.websocket.send(JSON.stringify(textMessage));
    return true;
  }

  disconnect() {
    if (this.voiceState === "recording" && this.recording) {
      this.stopRecording().catch(() => { });
    }

    if (this.player) {
      this.player.remove();
      this.player = null;
    }

    if (this.websocket && this.isConnected) {
      try {
        if (this.sessionStarted && this.subscribed) {
          const endSessionMessage = {
            command: "message",
            identifier: JSON.stringify({ channel: "VoiceChannel" }),
            data: JSON.stringify({ action: "end_session" }),
          };
          this.websocket.send(JSON.stringify(endSessionMessage));
        }

        if (this.subscribed) {
          const unsubscribeMessage = {
            command: "unsubscribe",
            identifier: JSON.stringify({ channel: "VoiceChannel" }),
          };
          this.websocket.send(JSON.stringify(unsubscribeMessage));
        }

        setTimeout(() => {
          if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
          }
        }, 100);
      } catch (error) {
        if (this.websocket) {
          this.websocket.close();
          this.websocket = null;
        }
      }
    } else if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    this.sessionStarted = false;
    this.sessionRequested = false;
    this.sessionStartLock = false;
    this.streamComplete = false;
    this.isAudioPlaying = false;
    this.audioChunks = [];
    this.currentResponseId = null;
    this.finalizedJobIds.clear();
    this.isFirstAudioChunk = true;
    // Reset modal sync state
    this.isModalReady = false;
    this.modalReadyResolver = null;
    this.modalReadyPromise = null;
    this.transitionToState("idle", "disconnected");
    this.connectionCallbacks.forEach((callback) => callback(false));
  }

  onConnection(callback: ConnectionCallback) {
    this.connectionCallbacks.push(callback);
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  onMessage(callback: MessageCallback) {
    this.messageCallbacks.push(callback);
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
      }
    };
  }

  onSpeakingState(callback: SpeakingStateCallback) {
    this.speakingStateCallbacks.push(callback);
    return () => {
      const index = this.speakingStateCallbacks.indexOf(callback);
      if (index > -1) {
        this.speakingStateCallbacks.splice(index, 1);
      }
    };
  }

  onAudioResponse(callback: AudioResponseCallback) {
    this.audioResponseCallbacks.push(callback);
    return () => {
      const index = this.audioResponseCallbacks.indexOf(callback);
      if (index > -1) {
        this.audioResponseCallbacks.splice(index, 1);
      }
    };
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getSpeakingState(): boolean {
    return this.voiceState === "speaking";
  }

  getRecordingState(): boolean {
    return this.voiceState === "recording";
  }

  getSessionState(): boolean {
    return this.sessionStarted;
  }

  isSessionRequested(): boolean {
    return this.sessionRequested;
  }

  onRecordingState(callback: RecordingStateCallback) {
    this.recordingStateCallbacks.push(callback);
    callback(this.voiceState === "recording");
    return () => {
      const index = this.recordingStateCallbacks.indexOf(callback);
      if (index > -1) {
        this.recordingStateCallbacks.splice(index, 1);
      }
    };
  }

  onResponseReady(callback: ResponseReadyCallback) {
    this.responseReadyCallbacks.push(callback);
    callback(this.voiceState === "ready" || this.voiceState === "idle");
    return () => {
      const index = this.responseReadyCallbacks.indexOf(callback);
      if (index > -1) {
        this.responseReadyCallbacks.splice(index, 1);
      }
    };
  }

  getResponseReadyState(): boolean {
    return this.voiceState === "ready" || this.voiceState === "idle";
  }

  onProcessingState(callback: ProcessingStateCallback) {
    this.processingStateCallbacks.push(callback);
    callback(this.voiceState === "processing");
    return () => {
      const index = this.processingStateCallbacks.indexOf(callback);
      if (index > -1) {
        this.processingStateCallbacks.splice(index, 1);
      }
    };
  }

  getProcessingState(): boolean {
    return this.voiceState === "processing";
  }

  /**
   * Get current voice state (state machine)
   */
  getVoiceState(): VoiceState {
    return this.voiceState;
  }

  /**
   * Reset voice state to idle (used for timeout/error recovery)
   */
  resetToIdle(reason: string = "manual reset"): void {
    this.transitionToState("idle", reason);
  }

  /**
   * Subscribe to voice state changes (state machine)
   */
  onVoiceState(callback: VoiceStateCallback) {
    this.voiceStateCallbacks.push(callback);
    // Immediately call with current state
    callback(this.voiceState);
    return () => {
      const index = this.voiceStateCallbacks.indexOf(callback);
      if (index > -1) {
        this.voiceStateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to error events
   */
  onError(callback: ErrorCallback) {
    this.errorCallbacks.push(callback);
    return () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };
  }

  onMessageComposed(callback: MessageComposedCallback) {
    this.messageComposedCallbacks.push(callback);
    return () => {
      const index = this.messageComposedCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageComposedCallbacks.splice(index, 1);
      }
    };
  }


  // Check if an error is connection-related (should show toast to user)
  private isConnectionError(serverError: string): boolean {
    const lowerError = serverError.toLowerCase();

    // Check for connection-related error patterns
    return (
      lowerError.includes("connection lost") ||
      lowerError.includes("connection") ||
      lowerError.includes("disconnect") ||
      lowerError.includes("unable to connect")
    );
  }

  // Convert server error messages to user-friendly messages
  private getUserFriendlyErrorMessage(serverError: string): string {
    const lowerError = serverError.toLowerCase();

    // Connection-related errors
    if (lowerError.includes("connection lost") || lowerError.includes("connection") || lowerError.includes("disconnect")) {
      return "Unable to connect with AI. Please try again.";
    }

    // Network/timeout errors
    if (lowerError.includes("timeout") || lowerError.includes("network")) {
      return "Connection timeout. Please check your network and try again.";
    }

    // Audio-related errors
    if (lowerError.includes("audio") || lowerError.includes("recording") || lowerError.includes("too short")) {
      return "Audio processing failed. Please try recording again.";
    }

    // Generic fallback
    return "Unable to connect with AI. Please try again.";
  }
}

const voiceWebSocketService = new VoiceWebSocketService();
export default voiceWebSocketService;
