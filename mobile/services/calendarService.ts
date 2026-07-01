import * as Calendar from "expo-calendar";
import { Platform } from "react-native";

export interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  notes?: string;
  alarms?: { relativeOffset: number }[];
}

export const calendarService = {
  /**
   * Check if calendar is supported (iOS only)
   */
  isSupported: (): boolean => {
    return Platform.OS === "ios" || Platform.OS === "android";
  },

  /**
   * Request calendar permissions (iOS only)
   */
  requestPermissions: async (): Promise<boolean> => {
    if (!calendarService.isSupported()) {
      return false;
    }
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === "granted";
  },

  /**
   * Check if we have calendar permissions
   */
  checkPermissions: async (): Promise<boolean> => {
    if (!calendarService.isSupported()) {
      return false;
    }
    const { status } = await Calendar.getCalendarPermissionsAsync();
    return status === "granted";
  },

  /**
   * Get the default Apple Calendar
   */
  getDefaultCalendar: async (): Promise<string | null> => {
    if (!calendarService.isSupported()) {
      return null;
    }

    const hasPermission = await calendarService.requestPermissions();
    if (!hasPermission) {
      return null;
    }

    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    return defaultCalendar?.id || null;
  },

  /**
   * Add an event to the default Apple Calendar
   */
  addEvent: async (event: CalendarEvent): Promise<string | null> => {
    if (!calendarService.isSupported()) {
      return null;
    }

    const calendarId = await calendarService.getDefaultCalendar();
    if (!calendarId) {
      return null;
    }

    const eventId = await Calendar.createEventAsync(calendarId, {
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      notes: event.notes,
      alarms: event.alarms || [{ relativeOffset: -30 }], // Default 30 min reminder
    });

    return eventId;
  },

  /**
   * Get a single event by ID
   */
  getEventById: async (eventId: string): Promise<Calendar.Event | null> => {
    if (!calendarService.isSupported()) {
      return null;
    }

    try {
      const event = await Calendar.getEventAsync(eventId);
      return event;
    } catch (error) {
      console.error("Error fetching event:", error);
      return null;
    }
  },

  /**
   * Update an existing event
   * Fetches the current event first, merges with updates, and sends complete object
   */
  updateEvent: async (
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<void> => {
    if (!calendarService.isSupported()) {
      return;
    }

    const currentEvent = await calendarService.getEventById(eventId);

    if (!currentEvent) {
      console.error("Event not found:", eventId);
      return;
    }

    const updatedEvent = {
      title: updates.title !== undefined ? updates.title : currentEvent.title,
      startDate: updates.startDate !== undefined ? updates.startDate : currentEvent.startDate,
      endDate: updates.endDate !== undefined ? updates.endDate : currentEvent.endDate,
      location: updates.location !== undefined ? updates.location : (currentEvent.location || ""),
      notes: updates.notes !== undefined ? updates.notes : (currentEvent.notes || ""),
    };

    await Calendar.updateEventAsync(eventId, updatedEvent);
  },

  /**
   * Delete an event
   */
  deleteEvent: async (eventId: string): Promise<void> => {
    if (!calendarService.isSupported()) {
      return;
    }
    await Calendar.deleteEventAsync(eventId);
  },

  /**
   * Get events from all calendars within a date range
   */
  getEvents: async (
    startDate: Date,
    endDate: Date
  ): Promise<Calendar.Event[]> => {
    if (!calendarService.isSupported()) {
      return [];
    }

    const hasPermission = await calendarService.requestPermissions();
    if (!hasPermission) {
      return [];
    }

    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT
    );
    const calendarIds = calendars.map((cal) => cal.id);

    if (calendarIds.length === 0) {
      return [];
    }

    const events = await Calendar.getEventsAsync(
      calendarIds,
      startDate,
      endDate
    );

    return events;
  },

  /**
   * Get events from default calendar within a date range
   */
  getDefaultCalendarEvents: async (
    startDate: Date,
    endDate: Date
  ): Promise<Calendar.Event[]> => {
    if (!calendarService.isSupported()) {
      return [];
    }

    const calendarId = await calendarService.getDefaultCalendar();
    if (!calendarId) {
      return [];
    }

    const events = await Calendar.getEventsAsync(
      [calendarId],
      startDate,
      endDate
    );

    return events;
  },
};
