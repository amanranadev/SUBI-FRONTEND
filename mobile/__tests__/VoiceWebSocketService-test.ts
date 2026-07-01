
type VoiceState = "idle" | "recording" | "processing" | "speaking" | "ready";

class TestableStateMachine {
  private voiceState: VoiceState = "idle";
  private voiceStateCallbacks: ((state: VoiceState) => void)[] = [];
  private recordingStateCallbacks: ((isRecording: boolean) => void)[] = [];
  private processingStateCallbacks: ((isProcessing: boolean) => void)[] = [];
  private speakingStateCallbacks: ((isSpeaking: boolean) => void)[] = [];
  private responseReadyCallbacks: ((isReady: boolean) => void)[] = [];
  private errorCallbacks: ((error: { message: string; type: string }) => void)[] = [];
  private messageComposedCallbacks: ((data: any) => void)[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];

  private isModalReady = false;
  private modalReadyResolver: (() => void) | null = null;
  private isConnected = false;

  private validTransitions: Record<VoiceState, VoiceState[]> = {
    idle: ["recording", "speaking", "ready", "processing"],
    recording: ["processing", "idle"],
    processing: ["speaking", "idle", "ready"],
    speaking: ["idle", "ready"],
    ready: ["recording", "idle", "speaking", "processing"],
  };

  transitionToState(newState: VoiceState, reason?: string): boolean {
    const oldState = this.voiceState;

    if (oldState !== newState && !this.validTransitions[oldState]?.includes(newState)) {
      if (newState === "speaking" && (oldState === "ready" || oldState === "idle")) {
      } else {
        return false;
      }
    }

    if (oldState === newState) {
      return false;
    }

    this.voiceState = newState;

    this.voiceStateCallbacks.forEach((cb) => cb(newState));
    this.recordingStateCallbacks.forEach((cb) => cb(newState === "recording"));
    this.speakingStateCallbacks.forEach((cb) => cb(newState === "speaking"));
    this.processingStateCallbacks.forEach((cb) => cb(newState === "processing"));
    this.responseReadyCallbacks.forEach((cb) => cb(newState === "ready" || newState === "idle"));

    return true;
  }

  getVoiceState(): VoiceState {
    return this.voiceState;
  }

  canStartRecording(): boolean {
    return this.voiceState === "idle" || this.voiceState === "ready";
  }

  getRecordingState(): boolean {
    return this.voiceState === "recording";
  }

  getSpeakingState(): boolean {
    return this.voiceState === "speaking";
  }

  getProcessingState(): boolean {
    return this.voiceState === "processing";
  }

  getResponseReadyState(): boolean {
    return this.voiceState === "ready" || this.voiceState === "idle";
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  setConnected(connected: boolean): void {
    this.isConnected = connected;
    this.connectionCallbacks.forEach((cb) => cb(connected));
  }

  onVoiceState(callback: (state: VoiceState) => void): () => void {
    this.voiceStateCallbacks.push(callback);
    callback(this.voiceState);
    return () => {
      this.voiceStateCallbacks = this.voiceStateCallbacks.filter((cb) => cb !== callback);
    };
  }

  onRecordingState(callback: (isRecording: boolean) => void): () => void {
    this.recordingStateCallbacks.push(callback);
    callback(this.voiceState === "recording");
    return () => {
      this.recordingStateCallbacks = this.recordingStateCallbacks.filter((cb) => cb !== callback);
    };
  }

  onProcessingState(callback: (isProcessing: boolean) => void): () => void {
    this.processingStateCallbacks.push(callback);
    callback(this.voiceState === "processing");
    return () => {
      this.processingStateCallbacks = this.processingStateCallbacks.filter((cb) => cb !== callback);
    };
  }

  onSpeakingState(callback: (isSpeaking: boolean) => void): () => void {
    this.speakingStateCallbacks.push(callback);
    callback(this.voiceState === "speaking");
    return () => {
      this.speakingStateCallbacks = this.speakingStateCallbacks.filter((cb) => cb !== callback);
    };
  }

  onResponseReady(callback: (isReady: boolean) => void): () => void {
    this.responseReadyCallbacks.push(callback);
    callback(this.voiceState === "ready" || this.voiceState === "idle");
    return () => {
      this.responseReadyCallbacks = this.responseReadyCallbacks.filter((cb) => cb !== callback);
    };
  }

  onError(callback: (error: { message: string; type: string }) => void): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter((cb) => cb !== callback);
    };
  }

  onMessageComposed(callback: (data: any) => void): () => void {
    this.messageComposedCallbacks.push(callback);
    return () => {
      this.messageComposedCallbacks = this.messageComposedCallbacks.filter((cb) => cb !== callback);
    };
  }

  onConnection(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter((cb) => cb !== callback);
    };
  }

  notifyError(error: { message: string; type: string }): void {
    this.errorCallbacks.forEach((cb) => cb(error));
  }

  notifyMessageComposed(data: any): void {
    this.messageComposedCallbacks.forEach((cb) => cb(data));
  }

  signalModalReady(): void {
    this.isModalReady = true;
    if (this.modalReadyResolver) {
      this.modalReadyResolver();
      this.modalReadyResolver = null;
    }
  }

  resetModalReadyState(): void {
    this.isModalReady = false;
  }

  isModalReadyNow(): boolean {
    return this.isModalReady;
  }

  reset(): void {
    this.voiceState = "idle";
    this.isConnected = false;
    this.isModalReady = false;
    this.voiceStateCallbacks.forEach((cb) => cb("idle"));
    this.connectionCallbacks.forEach((cb) => cb(false));
  }

  isConnectionError(errorMessage: string): boolean {
    const lowerError = errorMessage.toLowerCase();
    return (
      lowerError.includes("connection lost") ||
      lowerError.includes("connection") ||
      lowerError.includes("disconnect") ||
      lowerError.includes("unable to connect")
    );
  }

  getUserFriendlyErrorMessage(serverError: string): string {
    const lowerError = serverError.toLowerCase();

    if (
      lowerError.includes("connection lost") ||
      lowerError.includes("connection") ||
      lowerError.includes("disconnect")
    ) {
      return "Unable to connect with AI. Please try again.";
    }

    if (lowerError.includes("timeout") || lowerError.includes("network")) {
      return "Connection timeout. Please check your network and try again.";
    }

    if (
      lowerError.includes("audio") ||
      lowerError.includes("recording") ||
      lowerError.includes("too short")
    ) {
      return "Audio processing failed. Please try recording again.";
    }

    return "Unable to connect with AI. Please try again.";
  }
}

describe("VoiceWebSocketService State Machine", () => {
  let stateMachine: TestableStateMachine;

  beforeEach(() => {
    stateMachine = new TestableStateMachine();
  });

  describe("Initial State", () => {
    test("starts in idle state", () => {
      expect(stateMachine.getVoiceState()).toBe("idle");
    });

    test("canStartRecording returns true in idle state", () => {
      expect(stateMachine.canStartRecording()).toBe(true);
    });

    test("getRecordingState returns false initially", () => {
      expect(stateMachine.getRecordingState()).toBe(false);
    });

    test("getSpeakingState returns false initially", () => {
      expect(stateMachine.getSpeakingState()).toBe(false);
    });

    test("getProcessingState returns false initially", () => {
      expect(stateMachine.getProcessingState()).toBe(false);
    });

    test("getResponseReadyState returns true in idle state", () => {
      expect(stateMachine.getResponseReadyState()).toBe(true);
    });
  });

  describe("State Transitions", () => {
    test("transitions idle → recording", () => {
      const result = stateMachine.transitionToState("recording", "start recording");
      expect(result).toBe(true);
      expect(stateMachine.getVoiceState()).toBe("recording");
    });

    test("transitions recording → processing", () => {
      stateMachine.transitionToState("recording");
      const result = stateMachine.transitionToState("processing", "stop recording");
      expect(result).toBe(true);
      expect(stateMachine.getVoiceState()).toBe("processing");
    });

    test("transitions processing → speaking", () => {
      stateMachine.transitionToState("recording");
      stateMachine.transitionToState("processing");
      const result = stateMachine.transitionToState("speaking", "audio received");
      expect(result).toBe(true);
      expect(stateMachine.getVoiceState()).toBe("speaking");
    });

    test("transitions speaking → ready", () => {
      stateMachine.transitionToState("recording");
      stateMachine.transitionToState("processing");
      stateMachine.transitionToState("speaking");
      const result = stateMachine.transitionToState("ready", "playback complete");
      expect(result).toBe(true);
      expect(stateMachine.getVoiceState()).toBe("ready");
    });

    test("transitions ready → recording", () => {
      stateMachine.transitionToState("recording");
      stateMachine.transitionToState("processing");
      stateMachine.transitionToState("speaking");
      stateMachine.transitionToState("ready");
      const result = stateMachine.transitionToState("recording", "new recording");
      expect(result).toBe(true);
      expect(stateMachine.getVoiceState()).toBe("recording");
    });

    test("blocks invalid transition recording → speaking", () => {
      stateMachine.transitionToState("recording");
      const result = stateMachine.transitionToState("speaking", "invalid");
      expect(result).toBe(false);
      expect(stateMachine.getVoiceState()).toBe("recording");
    });

    test("allows recovery transition idle → speaking (late response)", () => {
      const result = stateMachine.transitionToState("speaking", "late response");
      expect(result).toBe(true);
      expect(stateMachine.getVoiceState()).toBe("speaking");
    });

    test("allows recovery transition ready → speaking (new response)", () => {
      stateMachine.transitionToState("recording");
      stateMachine.transitionToState("processing");
      stateMachine.transitionToState("speaking");
      stateMachine.transitionToState("ready");

      const result = stateMachine.transitionToState("speaking", "new response");
      expect(result).toBe(true);
      expect(stateMachine.getVoiceState()).toBe("speaking");
    });

    test("same state transition returns false (no change)", () => {
      const result = stateMachine.transitionToState("idle");
      expect(result).toBe(false);
    });
  });

  describe("canStartRecording Validation", () => {
    test("returns true in idle state", () => {
      expect(stateMachine.canStartRecording()).toBe(true);
    });

    test("returns true in ready state", () => {
      stateMachine.transitionToState("recording");
      stateMachine.transitionToState("processing");
      stateMachine.transitionToState("speaking");
      stateMachine.transitionToState("ready");
      expect(stateMachine.canStartRecording()).toBe(true);
    });

    test("returns false during recording", () => {
      stateMachine.transitionToState("recording");
      expect(stateMachine.canStartRecording()).toBe(false);
    });

    test("returns false during processing", () => {
      stateMachine.transitionToState("recording");
      stateMachine.transitionToState("processing");
      expect(stateMachine.canStartRecording()).toBe(false);
    });

    test("returns false during speaking", () => {
      stateMachine.transitionToState("recording");
      stateMachine.transitionToState("processing");
      stateMachine.transitionToState("speaking");
      expect(stateMachine.canStartRecording()).toBe(false);
    });
  });

  describe("State Callback Notifications", () => {
    test("immediately calls callback with current state on subscription", () => {
      const callback = jest.fn();
      stateMachine.onVoiceState(callback);
      expect(callback).toHaveBeenCalledWith("idle");
    });

    test("notifies callbacks on state change", () => {
      const callback = jest.fn();
      stateMachine.onVoiceState(callback);
      callback.mockClear();

      stateMachine.transitionToState("recording");
      expect(callback).toHaveBeenCalledWith("recording");
    });

    test("notifies multiple callbacks", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      stateMachine.onVoiceState(callback1);
      stateMachine.onVoiceState(callback2);

      callback1.mockClear();
      callback2.mockClear();

      stateMachine.transitionToState("recording");

      expect(callback1).toHaveBeenCalledWith("recording");
      expect(callback2).toHaveBeenCalledWith("recording");
    });

    test("unsubscribe removes callback from notifications", () => {
      const callback = jest.fn();
      const unsubscribe = stateMachine.onVoiceState(callback);

      callback.mockClear();
      unsubscribe();

      stateMachine.transitionToState("recording");
      expect(callback).not.toHaveBeenCalled();
    });

    test("notifies legacy recordingState callback", () => {
      const callback = jest.fn();
      stateMachine.onRecordingState(callback);
      callback.mockClear();

      stateMachine.transitionToState("recording");
      expect(callback).toHaveBeenCalledWith(true);

      callback.mockClear();
      stateMachine.transitionToState("processing");
      expect(callback).toHaveBeenCalledWith(false);
    });

    test("notifies legacy processingState callback", () => {
      const callback = jest.fn();
      stateMachine.onProcessingState(callback);
      callback.mockClear();

      stateMachine.transitionToState("recording");
      stateMachine.transitionToState("processing");
      expect(callback).toHaveBeenCalledWith(true);
    });

    test("notifies legacy speakingState callback", () => {
      const callback = jest.fn();
      stateMachine.onSpeakingState(callback);
      callback.mockClear();

      stateMachine.transitionToState("recording");
      stateMachine.transitionToState("processing");
      stateMachine.transitionToState("speaking");
      expect(callback).toHaveBeenCalledWith(true);
    });

    test("notifies responseReady callback", () => {
      const callback = jest.fn();
      stateMachine.onResponseReady(callback);
      callback.mockClear();

      stateMachine.transitionToState("recording");
      expect(callback).toHaveBeenCalledWith(false);

      callback.mockClear();
      stateMachine.transitionToState("processing");
      stateMachine.transitionToState("speaking");
      stateMachine.transitionToState("ready");
      expect(callback).toHaveBeenCalledWith(true);
    });
  });

  describe("Modal-Audio Synchronization", () => {
    test("signalModalReady sets modal as ready", () => {
      expect(stateMachine.isModalReadyNow()).toBe(false);
      stateMachine.signalModalReady();
      expect(stateMachine.isModalReadyNow()).toBe(true);
    });

    test("resetModalReadyState clears ready state", () => {
      stateMachine.signalModalReady();
      expect(stateMachine.isModalReadyNow()).toBe(true);

      stateMachine.resetModalReadyState();
      expect(stateMachine.isModalReadyNow()).toBe(false);
    });

    test("multiple signalModalReady calls are safe", () => {
      expect(() => {
        stateMachine.signalModalReady();
        stateMachine.signalModalReady();
        stateMachine.signalModalReady();
      }).not.toThrow();
    });
  });

  describe("Error Handling", () => {
    test("onError subscribes to error events", () => {
      const callback = jest.fn();
      const unsubscribe = stateMachine.onError(callback);
      expect(typeof unsubscribe).toBe("function");
    });

    test("notifyError calls all error callbacks", () => {
      const callback = jest.fn();
      stateMachine.onError(callback);

      const error = { message: "Test error", type: "voice_error" };
      stateMachine.notifyError(error);

      expect(callback).toHaveBeenCalledWith(error);
    });

    test("unsubscribing from errors works correctly", () => {
      const callback = jest.fn();
      const unsubscribe = stateMachine.onError(callback);
      unsubscribe();

      stateMachine.notifyError({ message: "Test", type: "error" });
      expect(callback).not.toHaveBeenCalled();
    });

    test("isConnectionError identifies connection-related errors", () => {
      expect(stateMachine.isConnectionError("Connection lost")).toBe(true);
      expect(stateMachine.isConnectionError("disconnect")).toBe(true);
      expect(stateMachine.isConnectionError("Unable to connect")).toBe(true);
      expect(stateMachine.isConnectionError("Processing failed")).toBe(false);
    });

    test("getUserFriendlyErrorMessage converts connection errors", () => {
      const message = stateMachine.getUserFriendlyErrorMessage("Connection lost");
      expect(message).toBe("Unable to connect with AI. Please try again.");
    });

    test("getUserFriendlyErrorMessage converts timeout errors", () => {
      const message = stateMachine.getUserFriendlyErrorMessage("Request timeout");
      expect(message).toBe("Connection timeout. Please check your network and try again.");
    });

    test("getUserFriendlyErrorMessage converts audio errors", () => {
      const message = stateMachine.getUserFriendlyErrorMessage("Recording too short");
      expect(message).toBe("Audio processing failed. Please try recording again.");
    });

    test("getUserFriendlyErrorMessage returns default for unknown errors", () => {
      const message = stateMachine.getUserFriendlyErrorMessage("Unknown server error xyz");
      expect(message).toBe("Unable to connect with AI. Please try again.");
    });
  });

  describe("message_composed Callback", () => {
    test("onMessageComposed subscribes to events", () => {
      const callback = jest.fn();
      const unsubscribe = stateMachine.onMessageComposed(callback);
      expect(typeof unsubscribe).toBe("function");
    });

    test("notifyMessageComposed calls all callbacks", () => {
      const callback = jest.fn();
      stateMachine.onMessageComposed(callback);

      const data = {
        message_id: "123",
        contact: { id: 1, name: "John", email: "john@test.com", phone: null },
        message_type: "email",
        subject: "Test",
        body: "Hello",
        requires_confirmation: true,
      };

      stateMachine.notifyMessageComposed(data);
      expect(callback).toHaveBeenCalledWith(data);
    });

    test("unsubscribing from messageComposed works correctly", () => {
      const callback = jest.fn();
      const unsubscribe = stateMachine.onMessageComposed(callback);
      unsubscribe();

      stateMachine.notifyMessageComposed({ message_id: "123" });
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("Connection Management", () => {
    test("getConnectionStatus returns false initially", () => {
      expect(stateMachine.getConnectionStatus()).toBe(false);
    });

    test("setConnected updates connection status", () => {
      stateMachine.setConnected(true);
      expect(stateMachine.getConnectionStatus()).toBe(true);

      stateMachine.setConnected(false);
      expect(stateMachine.getConnectionStatus()).toBe(false);
    });

    test("onConnection subscribes to connection events", () => {
      const callback = jest.fn();
      const unsubscribe = stateMachine.onConnection(callback);
      expect(typeof unsubscribe).toBe("function");
    });

    test("setConnected notifies connection callbacks", () => {
      const callback = jest.fn();
      stateMachine.onConnection(callback);

      stateMachine.setConnected(true);
      expect(callback).toHaveBeenCalledWith(true);
    });

    test("reset clears state and notifies callbacks", () => {
      stateMachine.setConnected(true);
      stateMachine.transitionToState("recording");
      stateMachine.signalModalReady();

      const voiceCallback = jest.fn();
      const connectionCallback = jest.fn();
      stateMachine.onVoiceState(voiceCallback);
      stateMachine.onConnection(connectionCallback);

      voiceCallback.mockClear();
      connectionCallback.mockClear();

      stateMachine.reset();

      expect(stateMachine.getVoiceState()).toBe("idle");
      expect(stateMachine.getConnectionStatus()).toBe(false);
      expect(stateMachine.isModalReadyNow()).toBe(false);
      expect(voiceCallback).toHaveBeenCalledWith("idle");
      expect(connectionCallback).toHaveBeenCalledWith(false);
    });
  });

  describe("Boolean State Getters", () => {
    test("getRecordingState returns true only when recording", () => {
      expect(stateMachine.getRecordingState()).toBe(false);

      stateMachine.transitionToState("recording");
      expect(stateMachine.getRecordingState()).toBe(true);

      stateMachine.transitionToState("processing");
      expect(stateMachine.getRecordingState()).toBe(false);
    });

    test("getProcessingState returns true only when processing", () => {
      expect(stateMachine.getProcessingState()).toBe(false);

      stateMachine.transitionToState("recording");
      expect(stateMachine.getProcessingState()).toBe(false);

      stateMachine.transitionToState("processing");
      expect(stateMachine.getProcessingState()).toBe(true);

      stateMachine.transitionToState("speaking");
      expect(stateMachine.getProcessingState()).toBe(false);
    });

    test("getSpeakingState returns true only when speaking", () => {
      expect(stateMachine.getSpeakingState()).toBe(false);

      stateMachine.transitionToState("recording");
      stateMachine.transitionToState("processing");
      expect(stateMachine.getSpeakingState()).toBe(false);

      stateMachine.transitionToState("speaking");
      expect(stateMachine.getSpeakingState()).toBe(true);

      stateMachine.transitionToState("ready");
      expect(stateMachine.getSpeakingState()).toBe(false);
    });

    test("getResponseReadyState returns true in idle or ready", () => {
      expect(stateMachine.getResponseReadyState()).toBe(true);

      stateMachine.transitionToState("recording");
      expect(stateMachine.getResponseReadyState()).toBe(false);

      stateMachine.transitionToState("processing");
      expect(stateMachine.getResponseReadyState()).toBe(false);

      stateMachine.transitionToState("speaking");
      expect(stateMachine.getResponseReadyState()).toBe(false);

      stateMachine.transitionToState("ready");
      expect(stateMachine.getResponseReadyState()).toBe(true);
    });
  });
});

describe("VoiceState Type", () => {
  test("VoiceState values are correctly defined", () => {
    const validStates: VoiceState[] = ["idle", "recording", "processing", "speaking", "ready"];
    validStates.forEach((state) => {
      expect(typeof state).toBe("string");
    });
  });
});
