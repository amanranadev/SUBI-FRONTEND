import { act, renderHook, waitFor } from "@testing-library/react-native";
import { Alert, AppState } from "react-native";
import { useCalendar } from "@/hooks/useCalendar";
import { calendarService } from "@/services/calendarService";

// Mock expo-calendar
jest.mock("expo-calendar", () => ({
  EntityTypes: {
    EVENT: "event",
  },
}));

// Mock react-native
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
  Alert: {
    alert: jest.fn(),
  },
  AppState: {
    currentState: "active",
    addEventListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
  },
}));

// Get the mocked Alert
const mockAlert = Alert.alert as jest.Mock;

// Mock calendarService
jest.mock("@/services/calendarService", () => ({
  calendarService: {
    isSupported: jest.fn(() => true),
    requestPermissions: jest.fn(),
    getEvents: jest.fn(),
    addEvent: jest.fn(),
    getEventById: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
  },
}));

describe("useCalendar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
    (calendarService.isSupported as jest.Mock).mockReturnValue(true);
    (AppState as any).currentState = "active";
  });

  test("initializes with empty events", () => {
    const { result } = renderHook(() => useCalendar());

    expect(result.current.events).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSupported).toBe(true);
  });

  describe("createCalendarEvent", () => {
    test("merges date + time correctly", async () => {
      const mockEventId = "event-123";
      (calendarService.requestPermissions as jest.Mock).mockResolvedValue(true);
      (calendarService.addEvent as jest.Mock).mockResolvedValue(mockEventId);
      (calendarService.getEvents as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useCalendar());

      const date = new Date("2025-01-15T00:00:00");
      const time = new Date("2025-01-01T14:30:00"); // 2:30 PM

      await act(async () => {
        await result.current.createCalendarEvent({
          title: "Test Event",
          date,
          time,
        });
      });

      expect(calendarService.addEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Event",
          startDate: expect.any(Date),
        })
      );

      const callArgs = (calendarService.addEvent as jest.Mock).mock.calls[0][0];
      expect(callArgs.startDate.getHours()).toBe(14);
      expect(callArgs.startDate.getMinutes()).toBe(30);
      expect(callArgs.startDate.getDate()).toBe(15);
      expect(callArgs.startDate.getMonth()).toBe(0); // January
    });

    test("sets default 1-hour duration", async () => {
      const mockEventId = "event-123";
      (calendarService.requestPermissions as jest.Mock).mockResolvedValue(true);
      (calendarService.addEvent as jest.Mock).mockResolvedValue(mockEventId);
      (calendarService.getEvents as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useCalendar());

      const date = new Date("2025-01-15T10:00:00");

      await act(async () => {
        await result.current.createCalendarEvent({
          title: "Test Event",
          date,
        });
      });

      const callArgs = (calendarService.addEvent as jest.Mock).mock.calls[0][0];
      const duration =
        callArgs.endDate.getTime() - callArgs.startDate.getTime();
      const oneHour = 60 * 60 * 1000;

      expect(duration).toBe(oneHour);
    });

    test("shows alert on permission denial", async () => {
      (calendarService.requestPermissions as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useCalendar());

      await act(async () => {
        await result.current.createCalendarEvent({
          title: "Test Event",
          date: new Date(),
        });
      });

      expect(mockAlert).toHaveBeenCalledWith(
        "Calendar Permission Required",
        "Please enable calendar access in your device settings."
      );
      expect(calendarService.addEvent).not.toHaveBeenCalled();
    });

    test("refreshes events on success", async () => {
      const mockEventId = "event-123";
      const mockEvents = [
        { id: "event-1", title: "Event 1" },
        { id: "event-2", title: "Event 2" },
      ];

      (calendarService.requestPermissions as jest.Mock).mockResolvedValue(true);
      (calendarService.addEvent as jest.Mock).mockResolvedValue(mockEventId);
      (calendarService.getEvents as jest.Mock).mockResolvedValue(mockEvents);

      const { result } = renderHook(() => useCalendar());

      // First, fetch events to set lastFetchRangeRef
      await act(async () => {
        await result.current.fetchEvents(
          new Date("2025-01-01"),
          new Date("2025-01-31")
        );
      });

      await act(async () => {
        await result.current.createCalendarEvent({
          title: "Test Event",
          date: new Date(),
        });
      });

      await waitFor(() => {
        expect(calendarService.getEvents).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("updateCalendarEvent", () => {
    test("updates partial data", async () => {
      const mockCurrentEvent = {
        id: "event-123",
        title: "Original Title",
        startDate: new Date("2025-01-15T10:00:00"),
        endDate: new Date("2025-01-15T11:00:00"),
        location: "Original Location",
        notes: "Original Notes",
      };

      (calendarService.getEventById as jest.Mock).mockResolvedValue(
        mockCurrentEvent
      );
      (calendarService.updateEvent as jest.Mock).mockResolvedValue(undefined);
      (calendarService.getEvents as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useCalendar());

      // First, fetch events to set lastFetchRangeRef
      await act(async () => {
        await result.current.fetchEvents(
          new Date("2025-01-01"),
          new Date("2025-01-31")
        );
      });

      await act(async () => {
        await result.current.updateCalendarEvent("event-123", {
          title: "Updated Title",
          description: "Updated Description",
        });
      });

      expect(calendarService.updateEvent).toHaveBeenCalledWith(
        "event-123",
        expect.objectContaining({
          title: "Updated Title",
          notes: "Updated Description",
        })
      );
    });

    test("preserves duration", async () => {
      const mockCurrentEvent = {
        id: "event-123",
        title: "Test Event",
        startDate: new Date("2025-01-15T10:00:00"),
        endDate: new Date("2025-01-15T12:00:00"), // 2-hour duration
      };

      (calendarService.getEventById as jest.Mock).mockResolvedValue(
        mockCurrentEvent
      );
      (calendarService.updateEvent as jest.Mock).mockResolvedValue(undefined);
      (calendarService.getEvents as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useCalendar());

      // First, fetch events to set lastFetchRangeRef
      await act(async () => {
        await result.current.fetchEvents(
          new Date("2025-01-01"),
          new Date("2025-01-31")
        );
      });

      const newDate = new Date("2025-01-20T14:00:00");

      await act(async () => {
        await result.current.updateCalendarEvent("event-123", {
          date: newDate,
        });
      });

      const updateCall = (calendarService.updateEvent as jest.Mock).mock
        .calls[0];
      const duration =
        updateCall[1].endDate.getTime() - updateCall[1].startDate.getTime();
      const twoHours = 2 * 60 * 60 * 1000;

      expect(duration).toBe(twoHours);
    });
  });

  describe("fetchEvents", () => {
    test("fetches and sets events", async () => {
      const mockEvents = [
        { id: "event-1", title: "Event 1" },
        { id: "event-2", title: "Event 2" },
      ];

      (calendarService.getEvents as jest.Mock).mockResolvedValue(mockEvents);

      const { result } = renderHook(() => useCalendar());

      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-01-31");

      await act(async () => {
        await result.current.fetchEvents(startDate, endDate);
      });

      expect(result.current.events).toEqual(mockEvents);
      expect(calendarService.getEvents).toHaveBeenCalledWith(
        startDate,
        endDate
      );
    });
  });

  describe("refreshEvents", () => {
    test("refetches last range", async () => {
      const mockEvents = [{ id: "event-1", title: "Event 1" }];

      (calendarService.getEvents as jest.Mock).mockResolvedValue(mockEvents);

      const { result } = renderHook(() => useCalendar());

      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-01-31");

      // First fetch to set lastFetchRangeRef
      await act(async () => {
        await result.current.fetchEvents(startDate, endDate);
      });

      // Then refresh
      await act(async () => {
        await result.current.refreshEvents();
      });

      expect(calendarService.getEvents).toHaveBeenCalledTimes(2);
      expect(calendarService.getEvents).toHaveBeenLastCalledWith(
        startDate,
        endDate
      );
    });
  });

  describe("fetchToday/week/month", () => {
    test("use correct date ranges", async () => {
      (calendarService.getEvents as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useCalendar());

      await act(async () => {
        await result.current.fetchTodayEvents();
      });

      const todayCall = (calendarService.getEvents as jest.Mock).mock.calls[0];
      const todayStart = todayCall[0];
      const todayEnd = todayCall[1];
      expect(todayStart.getHours()).toBe(0);
      expect(todayStart.getMinutes()).toBe(0);
      expect(todayStart.getSeconds()).toBe(0);
      expect(todayEnd.getHours()).toBe(23);
      expect(todayEnd.getMinutes()).toBe(59);
      expect(todayEnd.getSeconds()).toBe(59);

      await act(async () => {
        await result.current.fetchWeekEvents();
      });

      const weekCall = (calendarService.getEvents as jest.Mock).mock.calls[1];
      const weekStart = weekCall[0];
      const weekEnd = weekCall[1];
      const expectedWeekEnd = new Date(weekStart);
      expectedWeekEnd.setDate(expectedWeekEnd.getDate() + 7);
      expect(weekEnd.getDate()).toBe(expectedWeekEnd.getDate());
      expect(weekEnd.getHours()).toBe(23);
      expect(weekEnd.getMinutes()).toBe(59);

      await act(async () => {
        await result.current.fetchMonthEvents();
      });

      const monthCall = (calendarService.getEvents as jest.Mock).mock.calls[2];
      const monthStart = monthCall[0];
      const monthEnd = monthCall[1];
      const expectedMonthEnd = new Date(monthStart);
      expectedMonthEnd.setMonth(expectedMonthEnd.getMonth() + 1);
      expect(monthEnd.getMonth()).toBe(expectedMonthEnd.getMonth());
      expect(monthEnd.getHours()).toBe(23);
      expect(monthEnd.getMinutes()).toBe(59);
    });
  });
});
