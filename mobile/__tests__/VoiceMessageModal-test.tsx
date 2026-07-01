import { VoiceMessageModal } from "@/components/VoiceMessageModal/VoiceMessageModal";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";

// Track onChange callbacks for testing
let mockOnChangeCallback: ((index: number) => void) | null = null;

// Mock @gorhom/bottom-sheet
jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  const { View, ScrollView } = require("react-native");

  return {
    BottomSheetModal: React.forwardRef(
      ({ children, onChange, ...props }: any, ref: any) => {
        // Store the onChange callback for testing
        mockOnChangeCallback = onChange;

        React.useImperativeHandle(ref, () => ({
          present: jest.fn(() => {
            // Simulate modal becoming visible (index 0)
            if (onChange) {
              setTimeout(() => onChange(0), 0);
            }
          }),
          dismiss: jest.fn(() => {
            // Simulate modal closing (index -1)
            if (onChange) {
              setTimeout(() => onChange(-1), 0);
            }
          }),
        }));
        return <View testID="bottom-sheet-modal">{children}</View>;
      }
    ),
    BottomSheetModalProvider: ({ children }: any) => <View>{children}</View>,
    BottomSheetScrollView: React.forwardRef(
      ({ children, style, contentContainerStyle }: any, ref: any) => (
        <ScrollView
          ref={ref}
          style={style}
          contentContainerStyle={contentContainerStyle}
          testID="bottom-sheet-scroll"
        >
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
          accessibilityState={{ disabled }}
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

describe("VoiceMessageModal", () => {
  const modalRef = React.createRef<any>();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnChangeCallback = null;
  });

  describe("Modal Ready Callback (Audio-Visual Sync)", () => {
    test("calls onModalReady when modal becomes visible (index >= 0)", () => {
      const mockOnModalReady = jest.fn();

      renderWithProvider(
        <VoiceMessageModal
          ref={modalRef}
          onModalReady={mockOnModalReady}
          onStartRecording={jest.fn()}
        />
      );

      // Simulate modal becoming visible
      act(() => {
        if (mockOnChangeCallback) {
          mockOnChangeCallback(0);
        }
      });

      expect(mockOnModalReady).toHaveBeenCalledTimes(1);
    });

    test("does not call onModalReady when modal is dismissed (index === -1)", () => {
      const mockOnModalReady = jest.fn();
      const mockOnClose = jest.fn();

      renderWithProvider(
        <VoiceMessageModal
          ref={modalRef}
          onModalReady={mockOnModalReady}
          onClose={mockOnClose}
          onStartRecording={jest.fn()}
        />
      );

      // Simulate modal being dismissed
      act(() => {
        if (mockOnChangeCallback) {
          mockOnChangeCallback(-1);
        }
      });

      expect(mockOnModalReady).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("onModalReady is optional and handles undefined gracefully", () => {
      expect(() => {
        renderWithProvider(
          <VoiceMessageModal
            ref={modalRef}
            onStartRecording={jest.fn()}
            // onModalReady is intentionally not provided
          />
        );

        act(() => {
          if (mockOnChangeCallback) {
            mockOnChangeCallback(0);
          }
        });
      }).not.toThrow();
    });
  });

  describe("VoiceInputButton Integration", () => {
    test("renders VoiceInputButton when onStartRecording is provided", () => {
      const { getByTestId } = renderWithProvider(
        <VoiceMessageModal ref={modalRef} onStartRecording={jest.fn()} />
      );

      expect(getByTestId("voice-input-button")).toBeTruthy();
    });

    test("does not render VoiceInputButton when onStartRecording is not provided", () => {
      const { queryByTestId } = renderWithProvider(
        <VoiceMessageModal ref={modalRef} />
      );

      expect(queryByTestId("voice-input-button")).toBeNull();
    });

    test("shows correct label when not disabled", () => {
      const { getByTestId } = renderWithProvider(
        <VoiceMessageModal
          ref={modalRef}
          onStartRecording={jest.fn()}
          isDisabled={false}
        />
      );

      const label = getByTestId("voice-input-label");
      expect(label.props.children).toBe("Tap to respond");
    });

    test("shows 'Processing...' label when processing", () => {
      const { getByTestId } = renderWithProvider(
        <VoiceMessageModal
          ref={modalRef}
          onStartRecording={jest.fn()}
          isDisabled={true}
          isProcessing={true}
        />
      );

      const label = getByTestId("voice-input-label");
      expect(label.props.children).toBe("Processing...");
    });

    test("shows 'AI is speaking...' label when speaking", () => {
      const { getByTestId } = renderWithProvider(
        <VoiceMessageModal
          ref={modalRef}
          onStartRecording={jest.fn()}
          isDisabled={true}
          isSpeaking={true}
          isProcessing={false}
        />
      );

      const label = getByTestId("voice-input-label");
      expect(label.props.children).toBe("AI is speaking...");
    });

    test("shows 'Please wait...' label when disabled but not processing/speaking", () => {
      const { getByTestId } = renderWithProvider(
        <VoiceMessageModal
          ref={modalRef}
          onStartRecording={jest.fn()}
          isDisabled={true}
          isProcessing={false}
          isSpeaking={false}
        />
      );

      const label = getByTestId("voice-input-label");
      expect(label.props.children).toBe("Please wait...");
    });

    test("VoiceInputButton is disabled when isDisabled is true", () => {
      const { getByTestId } = renderWithProvider(
        <VoiceMessageModal
          ref={modalRef}
          onStartRecording={jest.fn()}
          isDisabled={true}
        />
      );

      const button = getByTestId("voice-input-button");
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    test("VoiceInputButton is enabled when isDisabled is false", () => {
      const { getByTestId } = renderWithProvider(
        <VoiceMessageModal
          ref={modalRef}
          onStartRecording={jest.fn()}
          isDisabled={false}
        />
      );

      const button = getByTestId("voice-input-button");
      expect(button.props.accessibilityState.disabled).toBe(false);
    });
  });

  describe("Status Display", () => {
    test("shows processing status when isProcessing is true", () => {
      const { getByText } = renderWithProvider(
        <VoiceMessageModal
          ref={modalRef}
          isProcessing={true}
          onStartRecording={jest.fn()}
        />
      );

      expect(getByText("AI is processing your request...")).toBeTruthy();
    });

    test("shows speaking status when isSpeaking is true", () => {
      const { getByText } = renderWithProvider(
        <VoiceMessageModal
          ref={modalRef}
          isSpeaking={true}
          isProcessing={false}
          onStartRecording={jest.fn()}
        />
      );

      expect(getByText("AI is speaking...")).toBeTruthy();
    });

    test("does not show status when neither processing nor speaking", () => {
      const { queryByText } = renderWithProvider(
        <VoiceMessageModal
          ref={modalRef}
          isProcessing={false}
          isSpeaking={false}
          onStartRecording={jest.fn()}
        />
      );

      expect(queryByText("AI is processing your request...")).toBeNull();
      expect(queryByText("AI is speaking...")).toBeNull();
    });
  });

  describe("onClose Callback", () => {
    test("calls onClose when modal is dismissed", () => {
      const mockOnClose = jest.fn();

      renderWithProvider(
        <VoiceMessageModal
          ref={modalRef}
          onClose={mockOnClose}
          onStartRecording={jest.fn()}
        />
      );

      // Simulate modal closing
      act(() => {
        if (mockOnChangeCallback) {
          mockOnChangeCallback(-1);
        }
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("onStartRecording Callback", () => {
    test("calls onStartRecording when button pressed and not disabled", () => {
      jest.useFakeTimers();
      const mockOnStartRecording = jest.fn();

      const { getByTestId } = renderWithProvider(
        <VoiceMessageModal
          ref={modalRef}
          onStartRecording={mockOnStartRecording}
          isDisabled={false}
        />
      );

      fireEvent.press(getByTestId("voice-input-button"));

      // The callback is wrapped in setTimeout(300)
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnStartRecording).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    test("does not call onStartRecording when button pressed but disabled", () => {
      jest.useFakeTimers();
      const mockOnStartRecording = jest.fn();

      const { getByTestId } = renderWithProvider(
        <VoiceMessageModal
          ref={modalRef}
          onStartRecording={mockOnStartRecording}
          isDisabled={true}
        />
      );

      fireEvent.press(getByTestId("voice-input-button"));

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should not be called because isDisabled is true
      expect(mockOnStartRecording).not.toHaveBeenCalled();

      jest.useRealTimers();
    });
  });
});
