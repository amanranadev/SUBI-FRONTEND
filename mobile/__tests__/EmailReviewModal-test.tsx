import { EmailReviewModal } from "@/components/EmailReviewModal/EmailReviewModal";
import { MessageComposedData, MessageComposedResponse } from "@/types";
import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { View } from "react-native";

// Mock BottomSheetModal
jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  const { View } = require("react-native");
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
    BottomSheetView: ({ children }: { children: React.ReactNode }) => (
      <View testID="bottom-sheet-view">{children}</View>
    ),
    BottomSheetBackdrop: () => <View testID="bottom-sheet-backdrop" />,
  };
});

// Mock EmailReviewCard
let emailReviewCardProps: any = null;
jest.mock("@/components/EmailReviewCard/EmailReviewCard", () => {
  const React = require("react");
  const { View } = require("react-native");
  const EmailReviewCard = ({ data }: any) => {
    emailReviewCardProps = { data };
    return <View testID="email-review-card" />;
  };
  return {
    EmailReviewCard,
  };
});

// Mock Button
jest.mock("@/components/Button/Button", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ text, onPress, testID }: any) => (
      <TouchableOpacity testID={testID || `button-${text}`} onPress={onPress}>
        <Text>{text}</Text>
      </TouchableOpacity>
    ),
  };
});

// Mock VoiceInputButton
let voiceInputButtonProps: any = null;
jest.mock("@/components/EmailReviewModal/VoiceInputButton", () => {
  const React = require("react");
  const { TouchableOpacity } = require("react-native");
  const VoiceInputButton = ({ onPress }: any) => {
    voiceInputButtonProps = { onPress };
    return (
      <TouchableOpacity testID="voice-input-button" onPress={onPress} />
    );
  };
  return {
    VoiceInputButton,
  };
});

describe("<EmailReviewModal />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    emailReviewCardProps = null;
    voiceInputButtonProps = null;
  });

  const mockMessageComposedData: MessageComposedData = {
    message_id: "msg-123",
    contact: {
      id: "contact-1",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1234567890",
    },
    message_type: "email",
    subject: "Meeting Tomorrow",
    body: "Let's meet at 2 PM tomorrow.",
    requires_confirmation: true,
  };

  const mockMessageComposedResponse: MessageComposedResponse = {
    type: "message_composed",
    content: "I've composed an email...",
    data: mockMessageComposedData,
    timestamp: "2025-01-15T10:00:00Z",
  };

  test("renders EmailReviewCard when messageData is provided", () => {
    const ref = React.createRef<any>();
    render(
      <EmailReviewModal ref={ref} messageData={mockMessageComposedData} />
    );

    expect(emailReviewCardProps).not.toBeNull();
    expect(emailReviewCardProps.data).toEqual(mockMessageComposedData);
  });

  test("works for both MessageComposedData and MessageComposedResponse", () => {
    const ref1 = React.createRef<any>();
    const { rerender } = render(
      <EmailReviewModal ref={ref1} messageData={mockMessageComposedData} />
    );

    expect(emailReviewCardProps.data).toEqual(mockMessageComposedData);

    const ref2 = React.createRef<any>();
    rerender(
      <EmailReviewModal ref={ref2} messageData={mockMessageComposedResponse} />
    );

    expect(emailReviewCardProps.data).toEqual(mockMessageComposedData);
  });

  test("extracts and passes correct data to EmailReviewCard", () => {
    const ref = React.createRef<any>();
    render(
      <EmailReviewModal ref={ref} messageData={mockMessageComposedData} />
    );

    expect(emailReviewCardProps.data).toEqual(mockMessageComposedData);
    expect(emailReviewCardProps.data.contact.name).toBe("Jane Smith");
    expect(emailReviewCardProps.data.subject).toBe("Meeting Tomorrow");
    expect(emailReviewCardProps.data.body).toBe("Let's meet at 2 PM tomorrow.");
  });

  test("uses .data when present (MessageComposedResponse)", () => {
    const ref = React.createRef<any>();
    render(
      <EmailReviewModal ref={ref} messageData={mockMessageComposedResponse} />
    );

    expect(emailReviewCardProps.data).toEqual(mockMessageComposedData);
    expect(emailReviewCardProps.data).not.toHaveProperty("type");
    expect(emailReviewCardProps.data).not.toHaveProperty("content");
    expect(emailReviewCardProps.data).not.toHaveProperty("timestamp");
  });

  test("uses object directly otherwise (MessageComposedData)", () => {
    const ref = React.createRef<any>();
    render(
      <EmailReviewModal ref={ref} messageData={mockMessageComposedData} />
    );

    expect(emailReviewCardProps.data).toEqual(mockMessageComposedData);
    expect(emailReviewCardProps.data.message_id).toBe("msg-123");
    expect(emailReviewCardProps.data.contact.id).toBe("contact-1");
  });

  test("does not render EmailReviewCard when messageData is missing", () => {
    const ref = React.createRef<any>();
    render(<EmailReviewModal ref={ref} />);

    expect(emailReviewCardProps).toBeNull();
  });

  test('"Make Changes" button calls onMakeChanges', () => {
    const mockOnMakeChanges = jest.fn();
    const ref = React.createRef<any>();
    const { getByTestId } = render(
      <EmailReviewModal
        ref={ref}
        messageData={mockMessageComposedData}
        onMakeChanges={mockOnMakeChanges}
      />
    );

    const makeChangesButton = getByTestId("button-Make Changes");
    act(() => {
      fireEvent.press(makeChangesButton);
    });

    expect(mockOnMakeChanges).toHaveBeenCalledTimes(1);
  });

  test('"Send It" button calls onSend', () => {
    const mockOnSend = jest.fn();
    const ref = React.createRef<any>();
    const { getByTestId } = render(
      <EmailReviewModal
        ref={ref}
        messageData={mockMessageComposedData}
        onSend={mockOnSend}
      />
    );

    const sendItButton = getByTestId("button-Send It");
    act(() => {
      fireEvent.press(sendItButton);
    });

    expect(mockOnSend).toHaveBeenCalledTimes(1);
  });

  test("voice input button calls onVoiceInput", () => {
    const mockOnVoiceInput = jest.fn();
    const ref = React.createRef<any>();
    render(
      <EmailReviewModal
        ref={ref}
        messageData={mockMessageComposedData}
        onVoiceInput={mockOnVoiceInput}
      />
    );

    expect(voiceInputButtonProps).not.toBeNull();
    expect(voiceInputButtonProps.onPress).toBeDefined();

    act(() => {
      voiceInputButtonProps.onPress();
    });

    expect(mockOnVoiceInput).toHaveBeenCalledTimes(1);
  });
});
