import { EmailSentModal } from "@/components/EmailSentModal/EmailSentModal";
import { Contact } from "@/types";
import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";

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

// Mock Button
jest.mock("@/components/Button/Button", () => {
  const React = require("react");
  const { TouchableOpacity, Text, View } = require("react-native");
  return {
    __esModule: true,
    default: ({ text, onPress, testID, icon }: any) => (
      <TouchableOpacity testID={testID || `button-${text}`} onPress={onPress}>
        <View>
          <Text>{text}</Text>
          {icon}
        </View>
      </TouchableOpacity>
    ),
  };
});

// Mock CircleCheck icon
jest.mock("@/assets/icons/CircleCheck", () => {
  const React = require("react");
  const { View } = require("react-native");
  return ({ width, height, color }: any) => (
    <View testID="circle-check-icon" style={{ width, height }}>
      <View style={{ backgroundColor: color }} />
    </View>
  );
});

// Mock Ionicons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name, size, color }: any) => {
    const React = require("react");
    const { View } = require("react-native");
    return (
      <View testID={`icon-${name}`} style={{ width: size, height: size }} />
    );
  },
}));

describe("<EmailSentModal />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockContact: Contact = {
    id: "contact-1",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1234567890",
  };

  describe("Displays success title and description", () => {
    test("renders the title text", () => {
      const ref = React.createRef<any>();
      const { getByText } = render(
        <EmailSentModal
          ref={ref}
          recipient={mockContact}
          title="Email sent successfully!"
        />
      );

      expect(getByText("Email sent successfully!")).toBeTruthy();
    });

    test("renders description starting with Sent to", () => {
      const ref = React.createRef<any>();
      const { getByText } = render(
        <EmailSentModal ref={ref} recipient={mockContact} />
      );

      expect(getByText(/^Sent to /i)).toBeTruthy();
    });

    test("shows recipient name correctly", () => {
      const ref = React.createRef<any>();
      const { getByText } = render(
        <EmailSentModal ref={ref} recipient={mockContact} />
      );

      expect(getByText("Sent to Jane Smith")).toBeTruthy();
    });
  });

  describe("Recipient handling", () => {
    it.each([
      ["Contact object", mockContact, "Jane Smith"],
      ["string", "John Doe", "John Doe"],
    ])(
      "works when recipient is a %s",
      (formatName, recipient, expectedName) => {
        const ref = React.createRef<any>();
        const { getByText } = render(
          <EmailSentModal ref={ref} recipient={recipient as any} />
        );

        expect(getByText(`Sent to ${expectedName}`)).toBeTruthy();
      }
    );
  });

  describe("Default values", () => {
    test("uses default recipient and default title when props are not provided", () => {
      const ref = React.createRef<any>();
      const { getByText } = render(<EmailSentModal ref={ref} />);

      // Should use default title
      expect(getByText("Email sent successfully!")).toBeTruthy();

      // Should use default recipient (John Smith)
      expect(getByText("Sent to John Smith")).toBeTruthy();
    });
  });

  test('"View in Gmail" button calls onViewInGmail', () => {
    const mockOnViewInGmail = jest.fn();
    const ref = React.createRef<any>();
    const { getByTestId } = render(
      <EmailSentModal
        ref={ref}
        recipient={mockContact}
        onViewInGmail={mockOnViewInGmail}
      />
    );

    const viewGmailButton = getByTestId("button-View in Gmail");
    act(() => {
      fireEvent.press(viewGmailButton);
    });

    expect(mockOnViewInGmail).toHaveBeenCalledTimes(1);
  });

  test('"Close" button calls onClose', () => {
    const mockOnClose = jest.fn();
    const ref = React.createRef<any>();
    const { getByTestId } = render(
      <EmailSentModal ref={ref} recipient={mockContact} onClose={mockOnClose} />
    );

    const closeButton = getByTestId("button-Close");
    act(() => {
      fireEvent.press(closeButton);
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
