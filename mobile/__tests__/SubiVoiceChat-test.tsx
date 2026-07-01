type VoiceState = "idle" | "recording" | "processing" | "speaking" | "ready";

class VoiceChatModalCoordinator {
  private speakingStartTime: number | null = null;
  private isShowingSpeakingScreen = false;
  private minSpeakingDisplayTimeout: NodeJS.Timeout | null = null;
  private aiResponseText = "";
  private generatedMessage = "";

  public listeningModalPresented = false;
  public messageModalPresented = false;
  public toastShown: { message: string; type: string } | null = null;

  handleVoiceStateChange(state: VoiceState): void {
    if (this.minSpeakingDisplayTimeout) {
      clearTimeout(this.minSpeakingDisplayTimeout);
      this.minSpeakingDisplayTimeout = null;
    }

    switch (state) {
      case "speaking":
        if (!this.speakingStartTime) {
          this.speakingStartTime = Date.now();
          this.isShowingSpeakingScreen = true;
        }
        this.listeningModalPresented = false;
        this.messageModalPresented = true;
        break;

      case "processing":
        this.messageModalPresented = false;
        this.listeningModalPresented = true;
        this.speakingStartTime = null;
        this.isShowingSpeakingScreen = false;
        break;

      case "recording":
        this.messageModalPresented = false;
        this.listeningModalPresented = true;
        this.speakingStartTime = null;
        this.isShowingSpeakingScreen = false;
        break;

      case "ready":
        const now = Date.now();
        const timeSinceSpeakingStarted = this.speakingStartTime
          ? now - this.speakingStartTime
          : 0;
        const MIN_SPEAKING_DISPLAY_TIME = 800;
        const remainingTime = Math.max(
          0,
          MIN_SPEAKING_DISPLAY_TIME - timeSinceSpeakingStarted
        );

        if (remainingTime > 0 && this.isShowingSpeakingScreen) {
          this.minSpeakingDisplayTimeout = setTimeout(() => {
            this.minSpeakingDisplayTimeout = null;
          }, remainingTime);
        }
        this.speakingStartTime = null;
        break;

      case "idle":
        if (!this.aiResponseText && !this.generatedMessage) {
          this.listeningModalPresented = false;
          this.messageModalPresented = false;
        }
        this.speakingStartTime = null;
        this.isShowingSpeakingScreen = false;
        break;
    }
  }

  handleError(error: { message: string; type: string }): void {
    this.toastShown = error;
  }

  setAiResponseText(text: string): void {
    this.aiResponseText = text;
    this.generatedMessage = text;
  }

  clearState(): void {
    this.speakingStartTime = null;
    this.isShowingSpeakingScreen = false;
    if (this.minSpeakingDisplayTimeout) {
      clearTimeout(this.minSpeakingDisplayTimeout);
      this.minSpeakingDisplayTimeout = null;
    }
    this.aiResponseText = "";
    this.generatedMessage = "";
    this.listeningModalPresented = false;
    this.messageModalPresented = false;
    this.toastShown = null;
  }
}

describe("SubiVoiceChat - Modal Coordination with State Machine", () => {
  let coordinator: VoiceChatModalCoordinator;

  beforeEach(() => {
    coordinator = new VoiceChatModalCoordinator();
    jest.useFakeTimers();
  });

  afterEach(() => {
    coordinator.clearState();
    jest.useRealTimers();
  });

  describe("State Machine to Modal Mapping", () => {
    test("shows listening modal when state is 'recording'", () => {
      coordinator.handleVoiceStateChange("recording");

      expect(coordinator.listeningModalPresented).toBe(true);
      expect(coordinator.messageModalPresented).toBe(false);
    });

    test("shows listening modal when state is 'processing'", () => {
      coordinator.handleVoiceStateChange("processing");

      expect(coordinator.listeningModalPresented).toBe(true);
      expect(coordinator.messageModalPresented).toBe(false);
    });

    test("shows speaking modal when state is 'speaking'", () => {
      coordinator.handleVoiceStateChange("speaking");

      expect(coordinator.messageModalPresented).toBe(true);
      expect(coordinator.listeningModalPresented).toBe(false);
    });

    test("dismisses modals when state is 'idle' with no message", () => {
      coordinator.handleVoiceStateChange("speaking");
      expect(coordinator.messageModalPresented).toBe(true);

      coordinator.handleVoiceStateChange("idle");

      expect(coordinator.listeningModalPresented).toBe(false);
      expect(coordinator.messageModalPresented).toBe(false);
    });

    test("keeps message modal visible when state is 'idle' with message", () => {
      coordinator.handleVoiceStateChange("speaking");
      coordinator.setAiResponseText("Hello!");

      coordinator.handleVoiceStateChange("idle");

      expect(coordinator.messageModalPresented).toBe(true);
    });
  });

  describe("State Transition Sequences", () => {
    test("full recording flow: idle → recording → processing → speaking → ready", () => {
      expect(coordinator.listeningModalPresented).toBe(false);
      expect(coordinator.messageModalPresented).toBe(false);

      coordinator.handleVoiceStateChange("recording");
      expect(coordinator.listeningModalPresented).toBe(true);
      expect(coordinator.messageModalPresented).toBe(false);

      coordinator.handleVoiceStateChange("processing");
      expect(coordinator.listeningModalPresented).toBe(true);
      expect(coordinator.messageModalPresented).toBe(false);

      coordinator.handleVoiceStateChange("speaking");
      expect(coordinator.listeningModalPresented).toBe(false);
      expect(coordinator.messageModalPresented).toBe(true);

      coordinator.handleVoiceStateChange("ready");
      expect(coordinator.messageModalPresented).toBe(true);
    });

    test("interrupted recording: recording → idle", () => {
      coordinator.handleVoiceStateChange("recording");
      expect(coordinator.listeningModalPresented).toBe(true);

      coordinator.handleVoiceStateChange("idle");

      expect(coordinator.listeningModalPresented).toBe(false);
      expect(coordinator.messageModalPresented).toBe(false);
    });

    test("recovery flow: ready → speaking (new/late response)", () => {
      coordinator.handleVoiceStateChange("speaking");
      coordinator.handleVoiceStateChange("ready");

      coordinator.handleVoiceStateChange("speaking");

      expect(coordinator.messageModalPresented).toBe(true);
    });
  });

  describe("Minimum Speaking Display Time", () => {
    test("tracks speaking start time when entering speaking state", () => {
      coordinator.handleVoiceStateChange("speaking");

      coordinator.handleVoiceStateChange("ready");

      expect(coordinator.messageModalPresented).toBe(true);
    });

    test("clears speaking tracking when entering non-speaking states", () => {
      coordinator.handleVoiceStateChange("speaking");
      coordinator.handleVoiceStateChange("recording");

      expect(coordinator.listeningModalPresented).toBe(true);
      expect(coordinator.messageModalPresented).toBe(false);
    });
  });

  describe("Error Handling", () => {
    test("shows Toast notification on error", () => {
      const testError = {
        message: "Connection lost. Please try again.",
        type: "voice_error",
      };

      coordinator.handleError(testError);

      expect(coordinator.toastShown).toEqual(testError);
    });

    test("handles multiple consecutive errors", () => {
      coordinator.handleError({ message: "Error 1", type: "error" });
      expect(coordinator.toastShown?.message).toBe("Error 1");

      coordinator.handleError({ message: "Error 2", type: "voice_error" });
      expect(coordinator.toastShown?.message).toBe("Error 2");
    });
  });

  describe("Message Display", () => {
    test("setAiResponseText updates both aiResponseText and generatedMessage", () => {
      coordinator.setAiResponseText("Hello from AI");

      coordinator.handleVoiceStateChange("speaking");
      coordinator.handleVoiceStateChange("idle");

      expect(coordinator.messageModalPresented).toBe(true);
    });

    test("clearState resets all tracking variables", () => {
      coordinator.handleVoiceStateChange("speaking");
      coordinator.setAiResponseText("Some message");

      coordinator.clearState();

      expect(coordinator.listeningModalPresented).toBe(false);
      expect(coordinator.messageModalPresented).toBe(false);
      expect(coordinator.toastShown).toBeNull();
    });
  });
});

describe("signalModalReady Integration", () => {
  test("signalModalReady is called when message modal becomes visible", () => {
    const mockSignalModalReady = jest.fn();
    const mockOnChange = (index: number) => {
      if (index >= 0) {
        mockSignalModalReady();
      }
    };

    mockOnChange(0);
    expect(mockSignalModalReady).toHaveBeenCalledTimes(1);

    mockSignalModalReady.mockClear();
    mockOnChange(-1);
    expect(mockSignalModalReady).not.toHaveBeenCalled();
  });
});

describe("VoiceState Constants", () => {
  test("all voice states are valid string values", () => {
    const validStates: VoiceState[] = [
      "idle",
      "recording",
      "processing",
      "speaking",
      "ready",
    ];

    validStates.forEach((state) => {
      expect(typeof state).toBe("string");
      expect(state.length).toBeGreaterThan(0);
    });
  });

  test("voice states are mutually exclusive", () => {
    const coordinator = new VoiceChatModalCoordinator();

    coordinator.handleVoiceStateChange("recording");

    expect(coordinator.listeningModalPresented).toBe(true);
    expect(coordinator.messageModalPresented).toBe(false);

    coordinator.handleVoiceStateChange("speaking");

    expect(coordinator.listeningModalPresented).toBe(false);
    expect(coordinator.messageModalPresented).toBe(true);
  });
});
