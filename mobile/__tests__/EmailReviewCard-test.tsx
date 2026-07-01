import { EmailReviewCard } from "@/components/EmailReviewCard/EmailReviewCard";
import { MessageComposedData } from "@/types";
import { render } from "@testing-library/react-native";
import React from "react";

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

describe("<EmailReviewCard />", () => {
  const mockMessageData: MessageComposedData = {
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

  describe("Renders contact name, subject, and body when data is provided", () => {
    test("displays To: {contact.name}", () => {
      const { getByText } = render(<EmailReviewCard data={mockMessageData} />);

      expect(getByText("To: Jane Smith")).toBeTruthy();
    });

    test("displays Subject: {subject}", () => {
      const { getByText } = render(<EmailReviewCard data={mockMessageData} />);

      expect(getByText(/Subject:/i)).toBeTruthy();
      expect(getByText("Meeting Tomorrow")).toBeTruthy();
    });

    test("displays message body text", () => {
      const { getByText } = render(<EmailReviewCard data={mockMessageData} />);

      expect(getByText("Let's meet at 2 PM tomorrow.")).toBeTruthy();
    });
  });

  describe("Generates initials correctly from contact name", () => {
    it.each([
      ["John Smith", "JS"],
      ["Alice Johnson", "AJ"],
      ["Mary Jane Watson", "MW"],
      ["John", "JO"],
      ["Alice", "AL"],
      ["A", "A"],
    ])("generates correct initials for %s → %s", (name, expectedInitials) => {
      const messageData: MessageComposedData = {
        ...mockMessageData,
        contact: {
          ...mockMessageData.contact,
          name,
        },
      };

      const { getByText } = render(<EmailReviewCard data={messageData} />);

      expect(getByText(expectedInitials)).toBeTruthy();
    });
  });

  describe("Handles missing data gracefully", () => {
    test("does not crash when data is undefined", () => {
      expect(() => render(<EmailReviewCard />)).not.toThrow();
      expect(() => render(<EmailReviewCard data={undefined} />)).not.toThrow();
    });

    test("renders empty / fallback text safely", () => {
      const { getByText } = render(<EmailReviewCard />);

      // Should render "To: " with empty name (component handles undefined gracefully)
      expect(getByText(/To:/i)).toBeTruthy();

      // Should render "Subject:" with empty subject
      expect(getByText(/Subject:/i)).toBeTruthy();

      // Component should render without crashing - verify structure exists
      // The component uses optional chaining (data?.contact.name) so it handles undefined safely
      expect(getByText(/To:/i)).toBeTruthy();
    });
  });
});
