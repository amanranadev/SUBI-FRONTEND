import { calendarService } from "@/services/calendarService";
import * as Calendar from "expo-calendar";
import { Platform } from "react-native";

// Mock expo-calendar
jest.mock("expo-calendar", () => ({
  requestCalendarPermissionsAsync: jest.fn(),
  getCalendarPermissionsAsync: jest.fn(),
  getDefaultCalendarAsync: jest.fn(),
  createEventAsync: jest.fn(),
  getEventAsync: jest.fn(),
  updateEventAsync: jest.fn(),
  deleteEventAsync: jest.fn(),
  getCalendarsAsync: jest.fn(),
  getEventsAsync: jest.fn(),
  EntityTypes: {
    EVENT: "event",
  },
}));

// Mock Platform
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
}));

describe("CalendarService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Platform OS to iOS by default
    (Platform as any).OS = "ios";
  });

  describe("isSupported", () => {
    test("returns true on iOS", () => {
      (Platform as any).OS = "ios";
      expect(calendarService.isSupported()).toBe(true);
    });

    test("returns true on Android", () => {
      (Platform as any).OS = "android";
      expect(calendarService.isSupported()).toBe(true);
    });

    test("returns false on web", () => {
      (Platform as any).OS = "web";
      expect(calendarService.isSupported()).toBe(false);
    });
  });

  describe("requestPermissions", () => {
    test("returns true when permission is granted", async () => {
      (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue(
        {
          status: "granted",
        }
      );

      const result = await calendarService.requestPermissions();
      expect(result).toBe(true);
      expect(Calendar.requestCalendarPermissionsAsync).toHaveBeenCalled();
    });

    test("returns false when permission is denied", async () => {
      (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue(
        {
          status: "denied",
        }
      );

      const result = await calendarService.requestPermissions();
      expect(result).toBe(false);
    });

    test("returns false on unsupported platform", async () => {
      (Platform as any).OS = "web";
      const result = await calendarService.requestPermissions();
      expect(result).toBe(false);
      expect(Calendar.requestCalendarPermissionsAsync).not.toHaveBeenCalled();
    });
  });

  describe("getDefaultCalendar", () => {
    test("returns calendar ID when permission granted", async () => {
      (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue(
        {
          status: "granted",
        }
      );
      (Calendar.getDefaultCalendarAsync as jest.Mock).mockResolvedValue({
        id: "calendar-id-123",
        title: "Default Calendar",
      });

      const calendarId = await calendarService.getDefaultCalendar();

      expect(calendarId).toBe("calendar-id-123");
      expect(Calendar.requestCalendarPermissionsAsync).toHaveBeenCalled();
      expect(Calendar.getDefaultCalendarAsync).toHaveBeenCalled();
    });

    test("returns null when permission denied", async () => {
      (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue(
        {
          status: "denied",
        }
      );

      const calendarId = await calendarService.getDefaultCalendar();

      expect(calendarId).toBeNull();
      expect(Calendar.getDefaultCalendarAsync).not.toHaveBeenCalled();
    });

    test("returns null when calendar not found", async () => {
      (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue(
        {
          status: "granted",
        }
      );
      (Calendar.getDefaultCalendarAsync as jest.Mock).mockResolvedValue(null);

      const calendarId = await calendarService.getDefaultCalendar();

      expect(calendarId).toBeNull();
    });

    test("returns null on unsupported platform", async () => {
      (Platform as any).OS = "web";
      const calendarId = await calendarService.getDefaultCalendar();
      expect(calendarId).toBeNull();
    });
  });

  describe("addEvent", () => {
    beforeEach(() => {
      // Setup default mocks for addEvent tests
      (Platform as any).OS = "ios";
      (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue(
        {
          status: "granted",
        }
      );
      (Calendar.getDefaultCalendarAsync as jest.Mock).mockResolvedValue({
        id: "calendar-id-123",
      });
    });

    test("creates event and returns event ID", async () => {
      const mockEventId = "event-id-456";
      (Calendar.createEventAsync as jest.Mock).mockResolvedValue(mockEventId);

      const event = {
        title: "Test Event",
        startDate: new Date("2025-01-15T10:00:00"),
        endDate: new Date("2025-01-15T11:00:00"),
      };

      const eventId = await calendarService.addEvent(event);

      expect(eventId).toBe(mockEventId);
      expect(Calendar.createEventAsync).toHaveBeenCalledWith(
        "calendar-id-123",
        expect.objectContaining({
          title: "Test Event",
          startDate: event.startDate,
          endDate: event.endDate,
        })
      );
    });

    test("includes default 30min reminder when alarms not provided", async () => {
      const mockEventId = "event-id-456";
      (Calendar.createEventAsync as jest.Mock).mockResolvedValue(mockEventId);

      const event = {
        title: "Test Event",
        startDate: new Date(),
        endDate: new Date(),
      };

      await calendarService.addEvent(event);

      expect(Calendar.createEventAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          alarms: [{ relativeOffset: -30 }],
        })
      );
    });

    test("uses custom alarms when provided", async () => {
      const mockEventId = "event-id-456";
      (Calendar.createEventAsync as jest.Mock).mockResolvedValue(mockEventId);

      const customAlarms = [{ relativeOffset: -60 }, { relativeOffset: -15 }];

      const event = {
        title: "Test Event",
        startDate: new Date(),
        endDate: new Date(),
        alarms: customAlarms,
      };

      await calendarService.addEvent(event);

      expect(Calendar.createEventAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          alarms: customAlarms,
        })
      );
    });

    test("returns null when no calendar available", async () => {
      (Calendar.getDefaultCalendarAsync as jest.Mock).mockResolvedValue(null);

      const event = {
        title: "Test Event",
        startDate: new Date(),
        endDate: new Date(),
      };

      const eventId = await calendarService.addEvent(event);

      expect(eventId).toBeNull();
      expect(Calendar.createEventAsync).not.toHaveBeenCalled();
    });

    test("returns null when permission denied", async () => {
      (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue(
        {
          status: "denied",
        }
      );

      const event = {
        title: "Test Event",
        startDate: new Date(),
        endDate: new Date(),
      };

      const eventId = await calendarService.addEvent(event);

      expect(eventId).toBeNull();
      expect(Calendar.createEventAsync).not.toHaveBeenCalled();
    });

    test("returns null on unsupported platform", async () => {
      (Platform as any).OS = "web";

      const event = {
        title: "Test Event",
        startDate: new Date(),
        endDate: new Date(),
      };

      const eventId = await calendarService.addEvent(event);

      expect(eventId).toBeNull();
      expect(Calendar.createEventAsync).not.toHaveBeenCalled();
    });
  });
});
