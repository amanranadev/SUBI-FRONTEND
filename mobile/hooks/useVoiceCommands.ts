import { getToken } from "@/services/authService";
import voiceWebSocketService, {
  VoiceWebSocketMessage,
} from "@/services/voiceWebSocketService";
import { useCallback, useEffect, useState } from "react";

export function useVoiceCommands() {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResponseReady, setIsResponseReady] = useState(false);
  const [aiResponseText, setAiResponseText] = useState<string>("");

  const connect = useCallback(async () => {
    if (isConnected || voiceWebSocketService.getConnectionStatus()) {
      console.log("✅ Already connected, reusing existing connection");
      return true;
    }

    const token = getToken();
    if (!token) {
      console.error("❌ No JWT token available");
      return false;
    }

    try {
      await voiceWebSocketService.connect(token);

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (voiceWebSocketService.getSessionState()) {
        console.log("✅ Existing session detected from server, will reuse");
      } else {
        console.log("📡 No active session detected, will start when needed");
      }
      return true;
    } catch (error) {
      console.error("❌ Error connecting to voice WebSocket:", error);
      return false;
    }
  }, [isConnected]);

  const startListening = useCallback(async () => {
    if (isSpeaking || isProcessing) {
      console.warn("⚠️ Cannot start recording: AI is still responding");
      return false;
    }

    try {
      if (!isConnected) {
        const connected = await connect();
        if (!connected) {
          return false;
        }
      }

      setAiResponseText("");
      // State will be updated via service callbacks

      await voiceWebSocketService.startRecording();
      // isListening will be set via recordingState callback
      return true;
    } catch (error: any) {
      console.error("❌ Error starting audio recording:", error);

      if (
        error?.message?.includes("AI is responding") ||
        error?.message?.includes("still speaking")
      ) {
        console.warn("⚠️ Recording blocked: AI is still responding");
      }
      return false;
    }
  }, [isConnected, connect, isSpeaking, isProcessing]);

  const stopListening = useCallback(async () => {
    try {
      await voiceWebSocketService.stopRecording();
      // State will be updated via callbacks - no need to set manually
    } catch (error: any) {
      console.error("❌ Error stopping recording:", error);
      // State will be reset via service callbacks on error
      if (
        error?.message?.includes("too short") ||
        error?.message?.includes("too small")
      ) {
        console.warn("⚠️ Recording was too short, please try again");
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribeConnection = voiceWebSocketService.onConnection(
      (connected) => {
        console.log("🔌 Connected to voice WebSocket:", connected);
        setIsConnected(connected);
      }
    );

    const unsubscribeSpeaking = voiceWebSocketService.onSpeakingState(
      (speaking) => {
        setIsSpeaking(speaking);
        // When AI starts speaking, processing is done (handled by state machine)
      }
    );

    const unsubscribeRecording = voiceWebSocketService.onRecordingState(
      (recording) => {
        console.log("🎤 Recording state changed:", recording);
        setIsListening(recording);
      }
    );

    const unsubscribeProcessing = voiceWebSocketService.onProcessingState(
      (processing) => {
        console.log("⚙️ Processing state changed:", processing);
        setIsProcessing(processing);
      }
    );

    const unsubscribeResponseReady = voiceWebSocketService.onResponseReady(
      (ready) => {
        console.log("✅ Response ready state changed:", ready);
        setIsResponseReady(ready);
      }
    );

    const unsubscribeMessage = voiceWebSocketService.onMessage(
      (message: VoiceWebSocketMessage) => {
        let textToSet: string | null = null;

        // Only extract text from actual response messages, not status updates
        const textMessageTypes = ["response_done", "assistant_response", "voice_response", "audio_output"];

        if (message.type === "response_done") {
          if (message.data?.transcript) {
            textToSet = message.data.transcript;
          } else if (message.data?.text) {
            textToSet = message.data.text;
          } else if (message.data?.message) {
            textToSet = message.data.message;
          }
        } else if (
          message.type === "assistant_response" ||
          message.type === "voice_response"
        ) {
          if (message.content && typeof message.content === "string") {
            textToSet = message.content;
          } else if (message.message && typeof message.message === "string") {
            textToSet = message.message;
          } else if (message.data?.text) {
            textToSet = message.data.text;
          } else if (message.data?.transcript) {
            textToSet = message.data.transcript;
          }
        }
        // Only try to extract text from known text-bearing message types
        // Don't extract from job_started, job_completed, voice_chunk_received, etc.

        if (textToSet) {
          console.log("📝 [HOOK] Setting AI response text from:", message.type);
          setAiResponseText((prev) => {
            if (
              message.type === "response_done" ||
              (textToSet && textToSet.length > prev.length)
            ) {
              return textToSet;
            }

            if (textToSet && !prev.includes(textToSet)) {
              return prev + textToSet;
            }
            return prev;
          });
          // Don't manually set isProcessing - state machine handles this
        }

        // State transitions are handled by the service's state machine
        // No need to manually update processing state here
      }
    );

    return () => {
      unsubscribeConnection();
      unsubscribeSpeaking();
      unsubscribeRecording();
      unsubscribeProcessing();
      unsubscribeMessage();
      unsubscribeResponseReady();
    };
  }, []);

  return {
    isConnected,
    isListening,
    isSpeaking,
    isProcessing,
    isResponseReady,
    aiResponseText,
    connect,
    startListening,
    stopListening,
  };
}
