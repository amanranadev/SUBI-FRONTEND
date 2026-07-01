import {
  AnimatedSoundBars,
  VoiceListeningModal,
} from "@/components/VoiceListeningModal/VoiceListeningModal";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

// Mock @gorhom/bottom-sheet
jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");

  return {
    BottomSheetModal: React.forwardRef(
      ({ children, ...props }: any, ref: any) => {
        React.useImperativeHandle(ref, () => ({
          present: jest.fn(),
          dismiss: jest.fn(),
        }));
        return <View testID="bottom-sheet-modal">{children}</View>;
      }
    ),
    BottomSheetModalProvider: ({ children }: any) => <View>{children}</View>,
    BottomSheetView: ({ children, style }: any) => (
      <View style={style} testID="bottom-sheet-view">
        {children}
      </View>
    ),
    BottomSheetBackdrop: () => null,
  };
});

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
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

describe("VoiceListeningModal", () => {
  const mockOnStopRecording = jest.fn();
  const modalRef = React.createRef<any>();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Recording State (isRecording=true, isProcessing=false)", () => {
    test("shows 'Listening…' text when recording", () => {
      const { getByText } = renderWithProvider(
        <VoiceListeningModal
          ref={modalRef}
          onStopRecording={mockOnStopRecording}
          isRecording={true}
          isProcessing={false}
        />
      );

      expect(getByText("Listening…")).toBeTruthy();
    });

    test("shows Stop Recording button when recording", () => {
      const { getByText } = renderWithProvider(
        <VoiceListeningModal
          ref={modalRef}
          onStopRecording={mockOnStopRecording}
          isRecording={true}
          isProcessing={false}
        />
      );

      expect(getByText("Stop Recording")).toBeTruthy();
    });

    test("calls onStopRecording when stop button pressed", () => {
      const { getByText } = renderWithProvider(
        <VoiceListeningModal
          ref={modalRef}
          onStopRecording={mockOnStopRecording}
          isRecording={true}
          isProcessing={false}
        />
      );

      fireEvent.press(getByText("Stop Recording"));

      expect(mockOnStopRecording).toHaveBeenCalledTimes(1);
    });
  });

  describe("Processing State (isProcessing=true)", () => {
    test("shows 'Processing…' text when processing", () => {
      const { getByText } = renderWithProvider(
        <VoiceListeningModal
          ref={modalRef}
          onStopRecording={mockOnStopRecording}
          isRecording={false}
          isProcessing={true}
        />
      );

      expect(getByText("Processing…")).toBeTruthy();
    });

    test("hides Stop Recording button when processing", () => {
      const { queryByText } = renderWithProvider(
        <VoiceListeningModal
          ref={modalRef}
          onStopRecording={mockOnStopRecording}
          isRecording={false}
          isProcessing={true}
        />
      );

      expect(queryByText("Stop Recording")).toBeNull();
    });

    test("does not show 'Listening…' when processing", () => {
      const { queryByText } = renderWithProvider(
        <VoiceListeningModal
          ref={modalRef}
          onStopRecording={mockOnStopRecording}
          isRecording={false}
          isProcessing={true}
        />
      );

      expect(queryByText("Listening…")).toBeNull();
    });
  });

  describe("Default Props", () => {
    test("isRecording defaults to true", () => {
      const { getByText } = renderWithProvider(
        <VoiceListeningModal
          ref={modalRef}
          onStopRecording={mockOnStopRecording}
        />
      );

      // Default isRecording=true should show "Listening…"
      expect(getByText("Listening…")).toBeTruthy();
    });

    test("isProcessing defaults to false", () => {
      const { getByText, queryByText } = renderWithProvider(
        <VoiceListeningModal
          ref={modalRef}
          onStopRecording={mockOnStopRecording}
        />
      );

      // Default isProcessing=false should not show "Processing…"
      expect(queryByText("Processing…")).toBeNull();
      expect(getByText("Listening…")).toBeTruthy();
    });
  });
});

describe("AnimatedSoundBars", () => {
  test("renders without crashing", () => {
    const { getByTestId } = render(
      <BottomSheetModalProvider>
        <VoiceListeningModal
          ref={React.createRef()}
          onStopRecording={jest.fn()}
          isRecording={true}
        />
      </BottomSheetModalProvider>
    );

    // Sound bars should be rendered within the modal
    expect(getByTestId("bottom-sheet-view")).toBeTruthy();
  });

  test("AnimatedSoundBars component renders", () => {
    // Direct render of AnimatedSoundBars
    const { toJSON } = render(<AnimatedSoundBars />);

    // Should render a view with animated bars
    expect(toJSON()).toBeTruthy();
  });
});
