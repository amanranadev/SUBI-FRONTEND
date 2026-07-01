import apiClient from "@/services/api";
import { emailService, SendEmailResponse } from "@/services/emailService";

// Mock apiClient
jest.mock("@/services/api", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

// Mock console.error
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

describe("EmailService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe("sendEmail", () => {
    test("calls the correct API endpoint", async () => {
      const mockResponse: SendEmailResponse = {
        draft: {
          id: "draft-123",
          recipient_name: "John Doe",
          recipient_email: "john@example.com",
          recipient_phone: null,
          message_type: "email",
          subject: "Test Subject",
          body: "Test Body",
          status: "sent",
          recipient_type: "buyer",
          contact_id: "contact-1",
          transaction_id: null,
          created_at: "2025-01-15T10:00:00Z",
          expires_at: "2025-01-16T10:00:00Z",
        },
        message: "Email sent successfully",
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      await emailService.sendEmail("draft-123");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/message_drafts/draft-123/send_message"
      );
    });

    test("returns SendEmailResponse on success", async () => {
      const mockResponse: SendEmailResponse = {
        draft: {
          id: "draft-456",
          recipient_name: "Jane Smith",
          recipient_email: "jane@example.com",
          recipient_phone: "+1234567890",
          message_type: "email",
          subject: "Meeting Tomorrow",
          body: "Let's meet at 2 PM",
          status: "sent",
          recipient_type: "seller",
          contact_id: "contact-2",
          transaction_id: "transaction-1",
          created_at: "2025-01-15T11:00:00Z",
          expires_at: "2025-01-16T11:00:00Z",
        },
        message: "Email sent successfully",
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const result = await emailService.sendEmail("draft-456");

      expect(result).toEqual(mockResponse);
      expect(result.draft.status).toBe("sent");
      expect(result.draft.id).toBe("draft-456");
      expect(result.message).toBe("Email sent successfully");
    });

    test("throws error when API call fails", async () => {
      const mockError = new Error("Network error");
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(emailService.sendEmail("draft-789")).rejects.toThrow(
        "Network error"
      );

      expect(apiClient.post).toHaveBeenCalledWith(
        "/message_drafts/draft-789/send_message"
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error sending email:",
        mockError
      );
    });

    test("handles API error with status code", async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: "Draft not found" },
        },
        message: "Request failed with status code 404",
      };

      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(emailService.sendEmail("invalid-draft")).rejects.toEqual(
        mockError
      );

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error sending email:",
        mockError
      );
    });

    test("handles network timeout errors", async () => {
      const timeoutError = new Error("Request timeout");
      (apiClient.post as jest.Mock).mockRejectedValue(timeoutError);

      await expect(emailService.sendEmail("draft-timeout")).rejects.toThrow(
        "Request timeout"
      );

      expect(apiClient.post).toHaveBeenCalledWith(
        "/message_drafts/draft-timeout/send_message"
      );
    });
  });
});
