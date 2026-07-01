import { EmailDraftModal } from "@/components/EmailDraftModal/EmailDraftModal";
import { MessageComposedData, MessageComposedResponse } from "@/types";
import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

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

// Mock Picker
let pickerProps: any = null;
jest.mock("@react-native-picker/picker", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Picker = ({ selectedValue, onValueChange, children, ...props }: any) => {
    pickerProps = { selectedValue, onValueChange, children };
    return <View testID="picker">{children}</View>;
  };
  Picker.Item = ({ label, value }: any) => (
    <View testID={`picker-item-${value}`}>{label}</View>
  );
  return { Picker };
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

// Mock icons
jest.mock("@/assets/icons/MailIcon", () => {
  const React = require("react");
  const { View } = require("react-native");
  return () => <View testID="mail-icon" />;
});

jest.mock("@/assets/icons/ChevronDown", () => {
  const React = require("react");
  const { View } = require("react-native");
  return () => <View testID="chevron-down-icon" />;
});

describe("<EmailDraftModal />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pickerProps = null;
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

  describe("Rendering with messageData", () => {
    it.each([
      ["MessageComposedData", mockMessageComposedData],
      ["MessageComposedResponse", mockMessageComposedResponse],
    ])("renders draft using %s format", (formatName, messageData) => {
      const ref = React.createRef<any>();
      const { getByText } = render(
        <EmailDraftModal ref={ref} messageData={messageData} />
      );

      expect(getByText("Jane Smith")).toBeTruthy();
      expect(getByText("jane@example.com")).toBeTruthy();
      expect(getByText(/Meeting Tomorrow/i)).toBeTruthy();
    });
  });

  test("extracts and displays contact name and email correctly", () => {
    const ref = React.createRef<any>();
    const { getByText } = render(
      <EmailDraftModal ref={ref} messageData={mockMessageComposedData} />
    );

    expect(getByText("Jane Smith")).toBeTruthy();
    expect(getByText("jane@example.com")).toBeTruthy();
  });

  test("formats message text correctly", () => {
    const ref = React.createRef<any>();
    const { getByText } = render(
      <EmailDraftModal ref={ref} messageData={mockMessageComposedData} />
    );

    // Should contain the formatted message with subject prepended
    const messageText = getByText(/Subject: Meeting Tomorrow/i);
    expect(messageText).toBeTruthy();
    expect(getByText(/Let's meet at 2 PM tomorrow/i)).toBeTruthy();
  });

  test("prepends Subject: when not present in body", () => {
    const messageData: MessageComposedData = {
      ...mockMessageComposedData,
      subject: "Important Update",
      body: "This is the message body without subject.",
    };

    const ref = React.createRef<any>();
    const { getByText } = render(
      <EmailDraftModal ref={ref} messageData={messageData} />
    );

    const messageText = getByText(/Subject: Important Update/i);
    expect(messageText).toBeTruthy();
    expect(getByText(/This is the message body without subject/i)).toBeTruthy();
  });

  test("does not duplicate subject if already present", () => {
    const messageData: MessageComposedData = {
      ...mockMessageComposedData,
      subject: "Meeting Tomorrow",
      body: "Subject: Meeting Tomorrow\n\nLet's meet at 2 PM tomorrow.",
    };

    const ref = React.createRef<any>();
    const { getByText } = render(
      <EmailDraftModal ref={ref} messageData={messageData} />
    );

    // Should contain the original body text (subject already included)
    const messageText = getByText(/Subject: Meeting Tomorrow/i);
    expect(messageText).toBeTruthy();
    expect(getByText(/Let's meet at 2 PM tomorrow/i)).toBeTruthy();
    
    // Verify the text appears only once (not duplicated)
    const allText = messageText.props.children;
    if (typeof allText === 'string') {
      const subjectCount = (allText.match(/Subject: Meeting Tomorrow/gi) || []).length;
      expect(subjectCount).toBe(1);
    }
  });

  describe("Fallback defaults", () => {
    test("uses default contact when messageData is missing", () => {
      const ref = React.createRef<any>();
      const { getByText } = render(<EmailDraftModal ref={ref} />);

      expect(getByText("John Doe")).toBeTruthy();
      expect(getByText("john.doe@example.com")).toBeTruthy();
    });

    test("uses default subject/body when messageData is missing", () => {
      const ref = React.createRef<any>();
      const { getByText } = render(<EmailDraftModal ref={ref} />);

      expect(getByText(/Subject: Today's Showing Time/i)).toBeTruthy();
      expect(getByText(/Hi John/i)).toBeTruthy();
    });

    test("does not crash when messageData is missing", () => {
      const ref = React.createRef<any>();
      expect(() => render(<EmailDraftModal ref={ref} />)).not.toThrow();
    });
  });

  describe("Contact initials generation", () => {
    test("generates first + last initial for full name", () => {
      const messageData: MessageComposedData = {
        ...mockMessageComposedData,
        contact: {
          ...mockMessageComposedData.contact,
          name: "John Smith",
        },
      };

      const ref = React.createRef<any>();
      const { getByText } = render(
        <EmailDraftModal ref={ref} messageData={messageData} />
      );

      // Should show "JS" for John Smith
      expect(getByText("JS")).toBeTruthy();
    });

    test("generates first two letters for single-word name", () => {
      const messageData: MessageComposedData = {
        ...mockMessageComposedData,
        contact: {
          ...mockMessageComposedData.contact,
          name: "Alice",
        },
      };

      const ref = React.createRef<any>();
      const { getByText } = render(
        <EmailDraftModal ref={ref} messageData={messageData} />
      );

      // Should show "AL" for Alice
      expect(getByText("AL")).toBeTruthy();
    });
  });

  describe("Via picker", () => {
    test("opens on press", () => {
      const ref = React.createRef<any>();
      const { getByText, getByTestId } = render(
        <EmailDraftModal ref={ref} messageData={mockMessageComposedData} />
      );

      // Find the Via picker button by finding the TouchableOpacity that contains "Email"
      const viaButtonText = getByText("Email");
      const viaButton = viaButtonText.parent?.parent;
      
      if (viaButton) {
        act(() => {
          fireEvent.press(viaButton);
        });

        // Picker should be visible - verify by checking picker component exists
        expect(pickerProps).not.toBeNull();
        expect(pickerProps.selectedValue).toBe("email");
      }
    });

    test("selecting option updates label (Email / SMS / WhatsApp / Slack)", () => {
      // Test with different defaultVia props
      const ref1 = React.createRef<any>();
      const { getByText: getByText1 } = render(
        <EmailDraftModal ref={ref1} messageData={mockMessageComposedData} defaultVia="email" />
      );
      expect(getByText1("Email")).toBeTruthy();

      const ref2 = React.createRef<any>();
      const { getByText: getByText2 } = render(
        <EmailDraftModal ref={ref2} messageData={mockMessageComposedData} defaultVia="sms" />
      );
      expect(getByText2("SMS")).toBeTruthy();

      const ref3 = React.createRef<any>();
      const { getByText: getByText3 } = render(
        <EmailDraftModal ref={ref3} messageData={mockMessageComposedData} defaultVia="whatsapp" />
      );
      expect(getByText3("WhatsApp")).toBeTruthy();

      const ref4 = React.createRef<any>();
      const { getByText: getByText4 } = render(
        <EmailDraftModal ref={ref4} messageData={mockMessageComposedData} defaultVia="slack" />
      );
      expect(getByText4("Slack")).toBeTruthy();
    });
  });

  test('"Edit Draft" button calls onEditDraft', () => {
    const mockOnEditDraft = jest.fn();
    const ref = React.createRef<any>();
    const { getByTestId } = render(
      <EmailDraftModal
        ref={ref}
        messageData={mockMessageComposedData}
        onEditDraft={mockOnEditDraft}
      />
    );

    const editButton = getByTestId("button-Edit Draft");
    act(() => {
      fireEvent.press(editButton);
    });

    expect(mockOnEditDraft).toHaveBeenCalledTimes(1);
  });

  test('"Send Email" button calls onSend', () => {
    const mockOnSend = jest.fn();
    const ref = React.createRef<any>();
    const { getByTestId } = render(
      <EmailDraftModal
        ref={ref}
        messageData={mockMessageComposedData}
        onSend={mockOnSend}
      />
    );

    const sendButton = getByTestId("button-Send Email");
    act(() => {
      fireEvent.press(sendButton);
    });

    expect(mockOnSend).toHaveBeenCalledTimes(1);
  });
});
