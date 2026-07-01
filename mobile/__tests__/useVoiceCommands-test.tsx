import { act, renderHook } from "@testing-library/react-native";

// Mock callbacks store - must be defined before jest.mock
type BoolCallback = (val: boolean) => void;
type MsgCallback = (msg: any) => void;

const createMockCallbacks = () => ({
  connection: [] as BoolCallback[],
  speaking: [] as BoolCallback[],
  recording: [] as BoolCallback[],
  processing: [] as BoolCallback[],
  responseReady: [] as BoolCallback[],
  message: [] as MsgCallback[],
});

let mockCallbacks = createMockCallbacks();

// Mock service state
let mockConnectionStatus = false;
let mockSessionState = false;
let mockRecordingState = false;
let mockSpeakingState = false;
let mockProcessingState = false;

// Mock functions
const mockConnectFn = jest.fn();
const mockDisconnectFn = jest.fn();
const mockStartRecordingFn = jest.fn();
const mockStopRecordingFn = jest.fn();

jest.mock("@/services/voiceWebSocketService", () => ({
  __esModule: true,
  default: {
    connect: (...args: any[]) => mockConnectFn(...args),
    disconnect: (...args: any[]) => mockDisconnectFn(...args),
    startRecording: (...args: any[]) => mockStartRecordingFn(...args),
    stopRecording: (...args: any[]) => mockStopRecordingFn(...args),
    getConnectionStatus: () => mockConnectionStatus,
    getSessionState: () => mockSessionState,
    getRecordingState: () => mockRecordingState,
    getSpeakingState: () => mockSpeakingState,
    getProcessingState: () => mockProcessingState,
    onConnection: (cb: BoolCallback) => {
      mockCallbacks.connection.push(cb);
      return () => {
        mockCallbacks.connection = mockCallbacks.connection.filter(
          (c) => c !== cb
        );
      };
    },
    onSpeakingState: (cb: BoolCallback) => {
      mockCallbacks.speaking.push(cb);
      return () => {
        mockCallbacks.speaking = mockCallbacks.speaking.filter((c) => c !== cb);
      };
    },
    onRecordingState: (cb: BoolCallback) => {
      mockCallbacks.recording.push(cb);
      return () => {
        mockCallbacks.recording = mockCallbacks.recording.filter(
          (c) => c !== cb
        );
      };
    },
    onProcessingState: (cb: BoolCallback) => {
      mockCallbacks.processing.push(cb);
      return () => {
        mockCallbacks.processing = mockCallbacks.processing.filter(
          (c) => c !== cb
        );
      };
    },
    onResponseReady: (cb: BoolCallback) => {
      mockCallbacks.responseReady.push(cb);
      return () => {
        mockCallbacks.responseReady = mockCallbacks.responseReady.filter(
          (c) => c !== cb
        );
      };
    },
    onMessage: (cb: MsgCallback) => {
      mockCallbacks.message.push(cb);
      return () => {
        mockCallbacks.message = mockCallbacks.message.filter((c) => c !== cb);
      };
    },
  },
}));

jest.mock("@/services/authService", () => ({
  getToken: jest.fn().mockReturnValue("mock.jwt.token"),
}));

// Import after mocks
import { useVoiceCommands } from "@/hooks/useVoiceCommands";

describe("useVoiceCommands", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCallbacks = createMockCallbacks();

    // Reset mock states
    mockConnectionStatus = false;
    mockSessionState = false;
    mockRecordingState = false;
    mockSpeakingState = false;
    mockProcessingState = false;

    // Setup default implementations
    mockConnectFn.mockResolvedValue(undefined);
    mockStartRecordingFn.mockResolvedValue(undefined);
    mockStopRecordingFn.mockResolvedValue(undefined);
  });

  describe("Initial State", () => {
    test("returns initial state values", () => {
      const { result } = renderHook(() => useVoiceCommands());

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isListening).toBe(false);
      expect(result.current.isSpeaking).toBe(false);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.aiResponseText).toBe("");
    });

    test("subscribes to all service callbacks on mount", () => {
      renderHook(() => useVoiceCommands());

      // Verify callbacks were registered
      expect(mockCallbacks.connection.length).toBeGreaterThan(0);
      expect(mockCallbacks.speaking.length).toBeGreaterThan(0);
      expect(mockCallbacks.recording.length).toBeGreaterThan(0);
      expect(mockCallbacks.processing.length).toBeGreaterThan(0);
      expect(mockCallbacks.responseReady.length).toBeGreaterThan(0);
      expect(mockCallbacks.message.length).toBeGreaterThan(0);
    });
  });

  describe("Connection", () => {
    test("connect() calls service connect with token", async () => {
      const { result } = renderHook(() => useVoiceCommands());

      await act(async () => {
        await result.current.connect();
      });

      expect(mockConnectFn).toHaveBeenCalled();
    });

    test("connect() returns true on success", async () => {
      mockConnectFn.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useVoiceCommands());

      let connected: boolean = false;
      await act(async () => {
        connected = await result.current.connect();
      });

      expect(connected).toBe(true);
    });

    test("connect() returns false on error", async () => {
      mockConnectFn.mockRejectedValueOnce(new Error("Connection failed"));

      const { result } = renderHook(() => useVoiceCommands());

      let connected: boolean = true;
      await act(async () => {
        connected = await result.current.connect();
      });

      expect(connected).toBe(false);
    });

    test("does not reconnect if already connected", async () => {
      mockConnectionStatus = true;

      const { result } = renderHook(() => useVoiceCommands());

      await act(async () => {
        await result.current.connect();
      });

      expect(mockConnectFn).not.toHaveBeenCalled();
    });
  });

  describe("Recording", () => {
    test("startListening() calls service startRecording", async () => {
      mockConnectionStatus = true;

      const { result } = renderHook(() => useVoiceCommands());

      // Simulate connected state
      act(() => {
        mockCallbacks.connection.forEach((cb) => cb(true));
      });

      await act(async () => {
        await result.current.startListening();
      });

      expect(mockStartRecordingFn).toHaveBeenCalled();
    });

    test("startListening() connects first if not connected", async () => {
      mockConnectionStatus = false;

      const { result } = renderHook(() => useVoiceCommands());

      await act(async () => {
        await result.current.startListening();
      });

      expect(mockConnectFn).toHaveBeenCalled();
    });

    test("startListening() returns false if connect fails", async () => {
      mockConnectionStatus = false;
      mockConnectFn.mockRejectedValueOnce(new Error("Failed"));

      const { result } = renderHook(() => useVoiceCommands());

      let started: boolean = true;
      await act(async () => {
        started = await result.current.startListening();
      });

      expect(started).toBe(false);
    });

    test("startListening() blocks when AI is speaking", async () => {
      const { result } = renderHook(() => useVoiceCommands());

      // Simulate speaking state
      act(() => {
        mockCallbacks.speaking.forEach((cb) => cb(true));
      });

      let started: boolean = true;
      await act(async () => {
        started = await result.current.startListening();
      });

      expect(started).toBe(false);
      expect(mockStartRecordingFn).not.toHaveBeenCalled();
    });

    test("startListening() blocks when AI is processing", async () => {
      const { result } = renderHook(() => useVoiceCommands());

      // Simulate processing state
      act(() => {
        mockCallbacks.processing.forEach((cb) => cb(true));
      });

      let started: boolean = true;
      await act(async () => {
        started = await result.current.startListening();
      });

      expect(started).toBe(false);
      expect(mockStartRecordingFn).not.toHaveBeenCalled();
    });

    test("stopListening() calls service stopRecording", async () => {
      const { result } = renderHook(() => useVoiceCommands());

      await act(async () => {
        await result.current.stopListening();
      });

      expect(mockStopRecordingFn).toHaveBeenCalled();
    });
  });

  describe("State Updates from Service", () => {
    test("isConnected updates when connection callback fires", async () => {
      const { result } = renderHook(() => useVoiceCommands());

      expect(result.current.isConnected).toBe(false);

      act(() => {
        mockCallbacks.connection.forEach((cb) => cb(true));
      });

      expect(result.current.isConnected).toBe(true);
    });

    test("isListening updates when recording callback fires", async () => {
      const { result } = renderHook(() => useVoiceCommands());

      expect(result.current.isListening).toBe(false);

      act(() => {
        mockCallbacks.recording.forEach((cb) => cb(true));
      });

      expect(result.current.isListening).toBe(true);
    });

    test("isSpeaking updates when speaking callback fires", async () => {
      const { result } = renderHook(() => useVoiceCommands());

      expect(result.current.isSpeaking).toBe(false);

      act(() => {
        mockCallbacks.speaking.forEach((cb) => cb(true));
      });

      expect(result.current.isSpeaking).toBe(true);
    });

    test("isProcessing updates when processing callback fires", async () => {
      const { result } = renderHook(() => useVoiceCommands());

      expect(result.current.isProcessing).toBe(false);

      act(() => {
        mockCallbacks.processing.forEach((cb) => cb(true));
      });

      expect(result.current.isProcessing).toBe(true);
    });

    test("isResponseReady updates when responseReady callback fires", async () => {
      const { result } = renderHook(() => useVoiceCommands());

      act(() => {
        mockCallbacks.responseReady.forEach((cb) => cb(true));
      });

      expect(result.current.isResponseReady).toBe(true);
    });
  });

  describe("AI Response Text", () => {
    test("aiResponseText updates from response_done message", async () => {
      const { result } = renderHook(() => useVoiceCommands());

      act(() => {
        mockCallbacks.message.forEach((cb) =>
          cb({
            type: "response_done",
            data: { transcript: "Hello, how can I help?" },
          })
        );
      });

      expect(result.current.aiResponseText).toBe("Hello, how can I help?");
    });

    test("aiResponseText updates from assistant_response message", async () => {
      const { result } = renderHook(() => useVoiceCommands());

      act(() => {
        mockCallbacks.message.forEach((cb) =>
          cb({
            type: "assistant_response",
            content: "I'm here to help!",
          })
        );
      });

      expect(result.current.aiResponseText).toBe("I'm here to help!");
    });

    test("aiResponseText updates from voice_response message", async () => {
      const { result } = renderHook(() => useVoiceCommands());

      act(() => {
        mockCallbacks.message.forEach((cb) =>
          cb({
            type: "voice_response",
            message: "Voice response text",
          })
        );
      });

      expect(result.current.aiResponseText).toBe("Voice response text");
    });

    test("aiResponseText clears when starting new recording", async () => {
      mockConnectionStatus = true;

      const { result } = renderHook(() => useVoiceCommands());

      // Simulate connected state
      act(() => {
        mockCallbacks.connection.forEach((cb) => cb(true));
      });

      // Set some text first
      act(() => {
        mockCallbacks.message.forEach((cb) =>
          cb({
            type: "response_done",
            data: { transcript: "Previous response" },
          })
        );
      });

      expect(result.current.aiResponseText).toBe("Previous response");

      // Start new recording - should clear text
      await act(async () => {
        await result.current.startListening();
      });

      expect(result.current.aiResponseText).toBe("");
    });
  });

  describe("Cleanup", () => {
    test("unsubscribes from all callbacks on unmount", () => {
      const { unmount } = renderHook(() => useVoiceCommands());

      // Verify callbacks were registered
      expect(mockCallbacks.connection.length).toBeGreaterThan(0);

      unmount();

      // After unmount, callbacks should be removed
      expect(mockCallbacks.connection.length).toBe(0);
      expect(mockCallbacks.speaking.length).toBe(0);
      expect(mockCallbacks.recording.length).toBe(0);
      expect(mockCallbacks.processing.length).toBe(0);
      expect(mockCallbacks.responseReady.length).toBe(0);
      expect(mockCallbacks.message.length).toBe(0);
    });
  });
});
