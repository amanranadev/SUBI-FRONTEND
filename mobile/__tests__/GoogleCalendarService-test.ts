import apiClient from "@/services/api";
import { CalendarEvent } from "@/services/calendarService";
import {
  addGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  getDefaultGoogleCalendar,
} from "@/services/googleCalendarService";

// Mock apiClient
jest.mock("@/services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("GoogleCalendarService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getDefaultGoogleCalendar", () => {
    test("returns selected calendar", async () => {
      const mockResponse = {
        data: {
          accounts: [
            {
              id: "account-1",
              email: "user@example.com",
              name: "User Name",
              calendars: [
                { id: "cal-1", name: "Calendar 1", primary: false },
                { id: "cal-2", name: "Selected Calendar", primary: false },
              ],
              selected_calendar_id: "cal-2",
              selected_calendar_name: "Selected Calendar",
            },
          ],
          selected_calendar_id: "cal-2",
          selected_calendar_name: "Selected Calendar",
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getDefaultGoogleCalendar();

      expect(result).toEqual({
        accountId: "account-1",
        calendarId: "cal-2",
        calendarName: "Selected Calendar",
      });
      expect(apiClient.get).toHaveBeenCalledWith("/google_calendars");
    });

    test("falls back to primary calendar", async () => {
      const mockResponse = {
        data: {
          accounts: [
            {
              id: "account-1",
              email: "user@example.com",
              name: "User Name",
              calendars: [
                { id: "cal-1", name: "Primary Calendar", primary: true },
                { id: "cal-2", name: "Other Calendar", primary: false },
              ],
              selected_calendar_id: null,
              selected_calendar_name: null,
            },
          ],
          selected_calendar_id: null,
          selected_calendar_name: null,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getDefaultGoogleCalendar();

      expect(result).toEqual({
        accountId: "account-1",
        calendarId: "cal-1",
        calendarName: "Primary Calendar",
      });
    });

    test("returns null when no accounts", async () => {
      const mockResponse = {
        data: {
          accounts: [],
          selected_calendar_id: null,
          selected_calendar_name: null,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getDefaultGoogleCalendar();

      expect(result).toBeNull();
    });
  });

  describe("addGoogleCalendarEvent", () => {
    const mockEvent: CalendarEvent = {
      title: "Test Event",
      startDate: new Date("2025-01-15T10:00:00Z"),
      endDate: new Date("2025-01-15T11:00:00Z"),
      location: "Test Location",
      notes: "Test Notes",
    };

    beforeEach(() => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: {
          accounts: [
            {
              id: "account-1",
              email: "user@example.com",
              name: "User Name",
              calendars: [
                { id: "cal-1", name: "Calendar 1", primary: true },
              ],
              selected_calendar_id: "cal-1",
              selected_calendar_name: "Calendar 1",
            },
          ],
        },
      });
    });

    test("creates task with correct payload", async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { id: "task-123" },
      });
      (apiClient.put as jest.Mock).mockResolvedValue({});

      await addGoogleCalendarEvent(mockEvent, "transaction-456");

      expect(apiClient.post).toHaveBeenCalledWith("/transaction_tasks", {
        name: "Test Event",
        description: "Test Notes",
        information: "Test Location",
        due_date: "2025-01-15",
        completed: false,
        transaction_task_type: "TASK",
        status: "ON_TRACK",
        transaction_id: "transaction-456",
      });
    });

    test("formats due_date correctly", async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { id: "task-123" },
      });
      (apiClient.put as jest.Mock).mockResolvedValue({});

      const eventWithDate = {
        ...mockEvent,
        startDate: new Date("2025-12-25T14:30:00Z"),
      };

      await addGoogleCalendarEvent(eventWithDate);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/transaction_tasks",
        expect.objectContaining({
          due_date: "2025-12-25",
        })
      );
    });

    test("returns task ID on success", async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { id: "task-123" },
      });
      (apiClient.put as jest.Mock).mockResolvedValue({});

      const result = await addGoogleCalendarEvent(mockEvent);

      expect(result).toBe("task-123");
    });

    test("returns null when no accounts", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: {
          accounts: [],
        },
      });

      const result = await addGoogleCalendarEvent(mockEvent);

      expect(result).toBeNull();
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    test("handles API errors gracefully", async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await addGoogleCalendarEvent(mockEvent);

      expect(result).toBeNull();
    });

    test("auto-selects calendar when none selected", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: {
          accounts: [
            {
              id: "account-1",
              email: "user@example.com",
              name: "User Name",
              calendars: [
                { id: "cal-1", name: "Primary Calendar", primary: true },
              ],
              selected_calendar_id: null,
              selected_calendar_name: null,
            },
          ],
        },
      });
      (apiClient.put as jest.Mock).mockResolvedValue({});
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { id: "task-123" },
      });

      await addGoogleCalendarEvent(mockEvent);

      expect(apiClient.put).toHaveBeenCalledWith("/google_calendars/select", {
        account_id: "account-1",
        calendar_id: "cal-1",
        calendar_name: "Primary Calendar",
      });
      expect(apiClient.post).toHaveBeenCalled();
    });
  });

  describe("deleteGoogleCalendarEvent", () => {
    test("handles prefixed calendar- IDs", async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({});

      const result = await deleteGoogleCalendarEvent("calendar-task-123");

      expect(result).toBe(true);
      expect(apiClient.delete).toHaveBeenCalledWith(
        "/transaction_tasks/task-123"
      );
    });

    test("returns false on error", async () => {
      (apiClient.delete as jest.Mock).mockRejectedValue(
        new Error("Delete failed")
      );

      const result = await deleteGoogleCalendarEvent("task-123");

      expect(result).toBe(false);
    });
  });
});
