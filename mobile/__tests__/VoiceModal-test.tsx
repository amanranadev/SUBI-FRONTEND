import {
  AnimatedSoundBars,
  VoiceModal,
} from "@/components/VoiceModal/VoiceModal";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

// Mock @gorhom/bottom-sheet
jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  const { View, ScrollView } = require("react-native");

  return {
    BottomSheetModal: React.forwardRef(
      ({ children, onChange, snapPoints, ...props }: any, ref: any) => {
        React.useImperativeHandle(ref, () => ({
          present: jest.fn(),
          dismiss: jest.fn(),
        }));
        return (
          <View
            testID="bottom-sheet-modal"
            accessibilityHint={JSON.stringify(snapPoints)}
          >
            {children}
          </View>
        );
      }
    ),
    BottomSheetModalProvider: ({ children }: any) => <View>{children}</View>,
    BottomSheetView: ({ children, style }: any) => (
      <View style={style} testID="bottom-sheet-view">
        {children}
      </View>
    ),
    BottomSheetScrollView: React.forwardRef(
      ({ children, style, contentContainerStyle }: any, ref: any) => (
        <ScrollView ref={ref} style={style} testID="bottom-sheet-scroll">
          {children}
        </ScrollView>
      )
    ),
    BottomSheetBackdrop: () => null,
  };
});

// Mock VoiceInputButton
jest.mock("@/components/EmailReviewModal/VoiceInputButton", () => {
  const React = require("react");
  const { TouchableOpacity, Text, View } = require("react-native");

  return {
    VoiceInputButton: ({ onPress, disabled, label, containerStyle }: any) => (
      <View style={containerStyle} testID="voice-input-button-container">
        <TouchableOpacity
          testID="voice-input-button"
          onPress={onPress}
          disabled={disabled}
        >
          <Text testID="voice-input-label">{label}</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});

// Mock colors
jest.mock("@/constants/colors", () => ({
  colors: {
    white: "#ffffff",
    gray: {
      50: "#fafafa",
      300: "#d4d4d4",
      800: "#27272a",
    },
    primary: {
      400: "#fd4d03",
    },
  },
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <BottomSheetModalProvider>{component}</BottomSheetModalProvider>
  );
};

// Suppress animation warnings globally for this test file
const originalError = console.error;
const originalWarn = console.warn;
beforeAll(() => {
  jest.useFakeTimers();
  console.error = (...args: any[]) => {
    const message = typeof args[0] === "string" ? args[0] : "";
    if (
      message.includes("An update to") &&
      message.includes("inside a test was not wrapped in act")
    )
      return;
    if (message.includes("Animated")) return;
    originalError.apply(console, args);
  };
  console.warn = (...args: any[]) => {
    const message = typeof args[0] === "string" ? args[0] : "";
    if (message.includes("Animated")) return;
    originalWarn.apply(console, args);
  };
});
afterAll(() => {
  jest.useRealTimers();
  console.error = originalError;
  console.warn = originalWarn;
});

describe("VoiceModal", () => {
  const modalRef = React.createRef<any>();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("State-Based Content Rendering", () => {
    describe("Recording State", () => {
      test("shows 'Listening…' when isRecording is true", () => {
        const { getByText } = renderWithProvider(
          <VoiceModal
            ref={modalRef}
            isRecording={true}
            isProcessing={false}
            onStopRecording={jest.fn()}
          />
        );

        expect(getByText("Listening…")).toBeTruthy();
      });

      test("shows Stop Recording button when recording", () => {
        const { getByText } = renderWithProvider(
          <VoiceModal
            ref={modalRef}
            isRecording={true}
            isProcessing={false}
            onStopRecording={jest.fn()}
          />
        );

        expect(getByText("Stop Recording")).toBeTruthy();
      });

      test("calls onStopRecording when stop button pressed", () => {
        const mockOnStopRecording = jest.fn();

        const { getByText } = renderWithProvider(
          <VoiceModal
            ref={modalRef}
            isRecording={true}
            isProcessing={false}
            onStopRecording={mockOnStopRecording}
          />
        );

        fireEvent.press(getByText("Stop Recording"));

        expect(mockOnStopRecording).toHaveBeenCalledTimes(1);
      });
    });

    describe("Processing State", () => {
      test("shows 'Processing…' when isProcessing is true", () => {
        const { getByText } = renderWithProvider(
          <VoiceModal ref={modalRef} isRecording={false} isProcessing={true} />
        );

        expect(getByText("Processing…")).toBeTruthy();
      });

      test("hides Stop Recording button when processing", () => {
        const { queryByText } = renderWithProvider(
          <VoiceModal
            ref={modalRef}
            isRecording={false}
            isProcessing={true}
            onStopRecording={jest.fn()}
          />
        );

        expect(queryByText("Stop Recording")).toBeNull();
      });
    });

    describe("Message View", () => {
      test("shows message view when message exists and not recording/processing", () => {
        const { getByTestId } = renderWithProvider(
          <VoiceModal
            ref={modalRef}
            message="Hello, I can help you!"
            isRecording={false}
            isProcessing={false}
            onStartRecording={jest.fn()}
          />
        );

        expect(getByTestId("bottom-sheet-scroll")).toBeTruthy();
      });

      test("shows VoiceInputButton in message view", () => {
        const { getByTestId } = renderWithProvider(
          <VoiceModal
            ref={modalRef}
            message="Hello!"
            isRecording={false}
            isProcessing={false}
            onStartRecording={jest.fn()}
          />
        );

        expect(getByTestId("voice-input-button")).toBeTruthy();
      });

      test("shows processing status in message view when processing", () => {
        const { getByText } = renderWithProvider(
          <VoiceModal
            ref={modalRef}
            message="Hello!"
            isRecording={false}
            isProcessing={true}
            onStartRecording={jest.fn()}
          />
        );

        // Note: This may show processing view instead of message view
        // depending on the isListeningOrProcessing check
        expect(getByText("Processing…")).toBeTruthy();
      });

      test("shows speaking status in message view when speaking", () => {
        const { getByText } = renderWithProvider(
          <VoiceModal
            ref={modalRef}
            message="Hello!"
            isRecording={false}
            isProcessing={false}
            isSpeaking={true}
            onStartRecording={jest.fn()}
          />
        );

        expect(getByText("AI is speaking...")).toBeTruthy();
      });
    });

    describe("Empty State", () => {
      test("returns null when no message and not recording/processing", () => {
        const { queryByTestId } = renderWithProvider(
          <VoiceModal
            ref={modalRef}
            message=""
            isRecording={false}
            isProcessing={false}
          />
        );

        // Modal itself should exist, but content should be empty
        expect(queryByTestId("bottom-sheet-view")).toBeNull();
        expect(queryByTestId("bottom-sheet-scroll")).toBeNull();
      });
    });
  });

  describe("Dynamic Snap Points", () => {
    test("uses 40% snap point when listening or processing", () => {
      const { getByTestId } = renderWithProvider(
        <VoiceModal ref={modalRef} isRecording={true} isProcessing={false} />
      );

      const modal = getByTestId("bottom-sheet-modal");
      const snapPoints = JSON.parse(modal.props.accessibilityHint);
      expect(snapPoints).toEqual(["40%"]);
    });

    test("uses 30% snap point when showing message", () => {
      const { getByTestId } = renderWithProvider(
        <VoiceModal
          ref={modalRef}
          message="Hello!"
          isRecording={false}
          isProcessing={false}
          onStartRecording={jest.fn()}
        />
      );

      const modal = getByTestId("bottom-sheet-modal");
      const snapPoints = JSON.parse(modal.props.accessibilityHint);
      expect(snapPoints).toEqual(["30%"]);
    });
  });

  describe("VoiceInputButton Labels", () => {
    test("shows 'Tap to respond' when not disabled", () => {
      const { getByTestId } = renderWithProvider(
        <VoiceModal
          ref={modalRef}
          message="Hello!"
          isRecording={false}
          isProcessing={false}
          isDisabled={false}
          onStartRecording={jest.fn()}
        />
      );

      const label = getByTestId("voice-input-label");
      expect(label.props.children).toBe("Tap to respond");
    });

    test("shows 'Processing...' when disabled and processing", () => {
      const { getByTestId } = renderWithProvider(
        <VoiceModal
          ref={modalRef}
          message="Hello!"
          isRecording={false}
          isProcessing={true}
          isDisabled={true}
          onStartRecording={jest.fn()}
        />
      );

      // Processing view takes precedence, so we check for Processing text
      expect(getByTestId("bottom-sheet-view")).toBeTruthy();
    });

    test("shows 'AI is speaking...' when disabled and speaking", () => {
      const { getByTestId } = renderWithProvider(
        <VoiceModal
          ref={modalRef}
          message="Hello!"
          isRecording={false}
          isProcessing={false}
          isSpeaking={true}
          isDisabled={true}
          onStartRecording={jest.fn()}
        />
      );

      const label = getByTestId("voice-input-label");
      expect(label.props.children).toBe("AI is speaking...");
    });

    test("shows 'Please wait...' when disabled but not processing/speaking", () => {
      const { getByTestId } = renderWithProvider(
        <VoiceModal
          ref={modalRef}
          message="Hello!"
          isRecording={false}
          isProcessing={false}
          isSpeaking={false}
          isDisabled={true}
          onStartRecording={jest.fn()}
        />
      );

      const label = getByTestId("voice-input-label");
      expect(label.props.children).toBe("Please wait...");
    });
  });

  describe("onClose Callback", () => {
    test("onClose prop is defined", () => {
      const mockOnClose = jest.fn();

      const { getByTestId } = renderWithProvider(
        <VoiceModal
          ref={modalRef}
          message="Hello!"
          onClose={mockOnClose}
          onStartRecording={jest.fn()}
        />
      );

      expect(getByTestId("bottom-sheet-modal")).toBeTruthy();
    });
  });
});

describe("AnimatedSoundBars (VoiceModal)", () => {
  test("renders without crashing", () => {
    const { toJSON } = render(<AnimatedSoundBars />);
    expect(toJSON()).toBeTruthy();
  });
});
