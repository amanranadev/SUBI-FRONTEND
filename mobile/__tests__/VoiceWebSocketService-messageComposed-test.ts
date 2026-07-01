import { MessageComposedData } from "@/types/message";
import voiceWebSocketService from "@/services/voiceWebSocketService";
import { VoiceWebSocketMessage } from "@/services/voiceWebSocketService";

// Suppress console warnings/errors during tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

describe("VoiceWebSocketService - message_composed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("onMessageComposed", () => {
    test("registers callback and returns unsubscribe function", () => {
      const callback = jest.fn();
      const unsubscribe = voiceWebSocketService.onMessageComposed(callback);

      expect(typeof unsubscribe).toBe("function");
    });

    test("handles multiple subscribers", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      const unsubscribe1 = voiceWebSocketService.onMessageComposed(callback1);
      const unsubscribe2 = voiceWebSocketService.onMessageComposed(callback2);
      const unsubscribe3 = voiceWebSocketService.onMessageComposed(callback3);

      // Simulate message_composed event
      const messageData: MessageComposedData = {
        message_id: "msg-123",
        contact: {
          id: "contact-1",
          name: "John Doe",
          email: "john@example.com",
          phone: null,
        },
        message_type: "email",
        subject: "Test Subject",
        body: "Test Body",
        requires_confirmation: true,
      };

      // Access private handleMessage through type casting
      (voiceWebSocketService as any).handleMessage({
        type: "message_composed",
        data: {
          message_id: "msg-123",
          contact: {
            id: "contact-1",
            name: "John Doe",
            email: "john@example.com",
            phone: null,
          },
          message_type: "email",
          subject: "Test Subject",
          body: "Test Body",
          requires_confirmation: true,
        },
      });

      expect(callback1).toHaveBeenCalledWith(messageData);
      expect(callback2).toHaveBeenCalledWith(messageData);
      expect(callback3).toHaveBeenCalledWith(messageData);

      // Cleanup
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    });

    test("unsubscribe removes callback correctly", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const unsubscribe1 = voiceWebSocketService.onMessageComposed(callback1);
      voiceWebSocketService.onMessageComposed(callback2);

      // Unsubscribe first callback
      unsubscribe1();

      // Simulate message_composed event
      (voiceWebSocketService as any).handleMessage({
        type: "message_composed",
        data: {
          message_id: "msg-123",
          contact: {
            id: "contact-1",
            name: "John Doe",
            email: "john@example.com",
          },
          message_type: "email",
          subject: "Test",
          body: "Test",
        },
      });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe("message_composed event handler", () => {
    test("extracts data correctly from message_composed event", () => {
      const callback = jest.fn();

      voiceWebSocketService.onMessageComposed(callback);

      const message = {
        type: "message_composed",
        data: {
          message_id: "msg-456",
          contact: {
            id: "contact-2",
            name: "Jane Smith",
            email: "jane@example.com",
            phone: "+1234567890",
          },
          message_type: "email",
          subject: "Meeting Tomorrow",
          body: "Let's meet at 2 PM",
          requires_confirmation: false,
        },
      };

      (voiceWebSocketService as any).handleMessage(message);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          message_id: "msg-456",
          contact: {
            id: "contact-2",
            name: "Jane Smith",
            email: "jane@example.com",
            phone: "+1234567890",
          },
          message_type: "email",
          subject: "Meeting Tomorrow",
          body: "Let's meet at 2 PM",
          requires_confirmation: false,
        })
      );
    });

    test("validates required field message_id", () => {
      const callback = jest.fn();

      voiceWebSocketService.onMessageComposed(callback);

      const message = {
        type: "message_composed",
        data: {
          // Missing message_id
          contact: {
            id: "contact-1",
            name: "John Doe",
            email: "john@example.com",
          },
          message_type: "email",
          subject: "Test",
          body: "Test",
        },
      };

      (voiceWebSocketService as any).handleMessage(message);

      expect(callback).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("message_composed missing message_id")
      );
    });

    test("validates required field contact.id", () => {
      const callback = jest.fn();

      voiceWebSocketService.onMessageComposed(callback);

      const message = {
        type: "message_composed",
        data: {
          message_id: "msg-123",
          // Missing contact.id
          contact: {
            name: "John Doe",
            email: "john@example.com",
          },
          message_type: "email",
          subject: "Test",
          body: "Test",
        },
      };

      (voiceWebSocketService as any).handleMessage(message);

      expect(callback).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("message_composed missing contact information")
      );
    });

    test("validates missing contact object", () => {
      const callback = jest.fn();

      voiceWebSocketService.onMessageComposed(callback);

      const message = {
        type: "message_composed",
        data: {
          message_id: "msg-123",
          // Missing contact entirely
          message_type: "email",
          subject: "Test",
          body: "Test",
        },
      };

      (voiceWebSocketService as any).handleMessage(message);

      expect(callback).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("message_composed missing contact information")
      );
    });

    test("triggers all registered callbacks", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      voiceWebSocketService.onMessageComposed(callback1);
      voiceWebSocketService.onMessageComposed(callback2);
      voiceWebSocketService.onMessageComposed(callback3);

      const message = {
        type: "message_composed",
        data: {
          message_id: "msg-789",
          contact: {
            id: "contact-3",
            name: "Bob Johnson",
            email: "bob@example.com",
          },
          message_type: "email",
          subject: "Hello",
          body: "World",
        },
      };

      (voiceWebSocketService as any).handleMessage(message);

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);

      const expectedData = expect.objectContaining({
        message_id: "msg-789",
        contact: expect.objectContaining({
          id: "contact-3",
          name: "Bob Johnson",
          email: "bob@example.com",
        }),
      });

      expect(callback1).toHaveBeenCalledWith(expectedData);
      expect(callback2).toHaveBeenCalledWith(expectedData);
      expect(callback3).toHaveBeenCalledWith(expectedData);
    });

    test("handles missing contact data with fallbacks", () => {
      const callback = jest.fn();

      voiceWebSocketService.onMessageComposed(callback);

      const message = {
        type: "message_composed",
        data: {
          message_id: "msg-999",
          contact: {
            id: "contact-4",
            // Missing name, email, phone
          },
          message_type: "email",
          // Missing subject, body
        },
      };

      (voiceWebSocketService as any).handleMessage(message);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          message_id: "msg-999",
          contact: {
            id: "contact-4",
            name: "", // Fallback to empty string
            email: "", // Fallback to empty string
            phone: null, // Fallback to null
          },
          message_type: "email", // Default fallback
          subject: "", // Fallback to empty string
          body: "", // Fallback to empty string
          requires_confirmation: true, // Default fallback
        })
      );
    });

    test("handles malformed message_composed data gracefully", () => {
      const callback = jest.fn();

      voiceWebSocketService.onMessageComposed(callback);

      // When data is null, handleMessage uses: data: messageData.data || messageData
      // So null falls back to messageData itself, which doesn't have message_id
      const message = {
        type: "message_composed",
        data: null,
      };

      (voiceWebSocketService as any).handleMessage(message);

      expect(callback).not.toHaveBeenCalled();
      // Since messageData itself is used (due to || fallback), it will fail message_id validation
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("message_composed missing message_id")
      );
    });

    test("handles missing data property gracefully", () => {
      const callback = jest.fn();

      voiceWebSocketService.onMessageComposed(callback);

      // Missing data property - handleMessage uses: data: messageData.data || messageData
      // Since data is undefined, it uses messageData itself, which doesn't have message_id
      const message = {
        type: "message_composed",
        // Missing data property
      };

      (voiceWebSocketService as any).handleMessage(message);

      expect(callback).not.toHaveBeenCalled();
      // Since messageData itself is used as data, it will fail message_id validation
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("message_composed missing message_id")
      );
    });

    test("handles callback errors gracefully", () => {
      const callback1 = jest.fn(() => {
        throw new Error("Callback error");
      });
      const callback2 = jest.fn();

      voiceWebSocketService.onMessageComposed(callback1);
      voiceWebSocketService.onMessageComposed(callback2);

      const message = {
        type: "message_composed",
        data: {
          message_id: "msg-error",
          contact: {
            id: "contact-error",
            name: "Error Test",
            email: "error@example.com",
          },
          message_type: "email",
          subject: "Test",
          body: "Test",
        },
      };

      (voiceWebSocketService as any).handleMessage(message);

      // First callback throws error, but second should still be called
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Error in message_composed callback"),
        expect.any(Error)
      );
    });

    test("handles processing errors gracefully", () => {
      const callback = jest.fn();

      voiceWebSocketService.onMessageComposed(callback);

      // Create a message that will cause processing error
      const message = {
        type: "message_composed",
        data: {
          // This will cause an error during processing
          get message_id() {
            throw new Error("Processing error");
          },
          contact: {
            id: "contact-1",
          },
        },
      };

      (voiceWebSocketService as any).handleMessage(message);

      expect(callback).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Error processing message_composed"),
        expect.any(Error)
      );
    });

    test("uses default message_type when missing", () => {
      const callback = jest.fn();

      voiceWebSocketService.onMessageComposed(callback);

      const message = {
        type: "message_composed",
        data: {
          message_id: "msg-default",
          contact: {
            id: "contact-default",
            name: "Default Test",
            email: "default@example.com",
          },
          // Missing message_type - should default to "email"
        },
      };

      (voiceWebSocketService as any).handleMessage(message);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          message_type: "email", // Default fallback
        })
      );
    });

    test("handles numeric message_id", () => {
      const callback = jest.fn();

      voiceWebSocketService.onMessageComposed(callback);

      const message = {
        type: "message_composed",
        data: {
          message_id: 12345, // Numeric ID
          contact: {
            id: "contact-numeric",
            name: "Numeric Test",
            email: "numeric@example.com",
          },
          message_type: "email",
          subject: "Test",
          body: "Test",
        },
      };

      (voiceWebSocketService as any).handleMessage(message);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          message_id: 12345,
        })
      );
    });

    test("handles numeric contact.id", () => {
      const callback = jest.fn();

      voiceWebSocketService.onMessageComposed(callback);

      const message = {
        type: "message_composed",
        data: {
          message_id: "msg-numeric-contact",
          contact: {
            id: 999, // Numeric contact ID
            name: "Numeric Contact",
            email: "numeric@example.com",
          },
          message_type: "email",
          subject: "Test",
          body: "Test",
        },
      };

      (voiceWebSocketService as any).handleMessage(message);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          contact: expect.objectContaining({
            id: 999,
          }),
        })
      );
    });
  });
});
