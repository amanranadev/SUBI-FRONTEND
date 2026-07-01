import * as Calendar from "expo-calendar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AppState, AppStateStatus } from "react-native";
import { CalendarEvent, calendarService } from "../services/calendarService";

export interface CalendarEventUpdate {
  title?: string;
  description?: string;
  date?: Date;
  time?: Date;
  location?: string;
}

export const useCalendar = (options?: { autoRefreshOnForeground?: boolean }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<Calendar.Event[]>([]);
  const isSupported = calendarService.isSupported();
  const lastFetchRangeRef = useRef<{ start: Date; end: Date } | null>(null);
  const appState = useRef(AppState.currentState);

  const refreshEvents = useCallback(async () => {
    if (lastFetchRangeRef.current) {
      const fetchedEvents = await calendarService.getEvents(
        lastFetchRangeRef.current.start,
        lastFetchRangeRef.current.end
      );
      setEvents(fetchedEvents);
      return fetchedEvents;
    }
    return [];
  }, []);

  useEffect(() => {
    if (!options?.autoRefreshOnForeground || !isSupported) return;

    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          console.log("[Calendar] App came to foreground, checking for updates...");
          refreshEvents();
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [options?.autoRefreshOnForeground, isSupported, refreshEvents]);

  // ==================== CREATE ====================
  const createCalendarEvent = useCallback(
    async (eventData: {
      title: string;
      date: Date;
      time?: Date;
      location?: string;
      description?: string;
    }): Promise<string | null> => {
      if (!isSupported) {
        Alert.alert(
          "Not Available",
          "Calendar integration is only available on iOS devices."
        );
        return null;
      }

      setIsLoading(true);
      try {
        const hasPermission = await calendarService.requestPermissions();
        if (!hasPermission) {
          Alert.alert(
            "Calendar Permission Required",
            "Please enable calendar access in your device settings."
          );
          return null;
        }

        // Combine date and time
        const startDate = new Date(eventData.date);
        if (eventData.time) {
          startDate.setHours(eventData.time.getHours(), eventData.time.getMinutes(), 0, 0);
        }

        // Default event duration: 1 hour
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1);

        const event: CalendarEvent = {
          title: eventData.title,
          startDate,
          endDate,
          location: eventData.location,
          notes: eventData.description,
          alarms: [{ relativeOffset: -30 }],
        };

        const eventId = await calendarService.addEvent(event);

        if (eventId) {
          await refreshEvents();
        }

        return eventId;
      } catch (error) {
        console.error("Error creating calendar event:", error);
        Alert.alert("Error", "Failed to create calendar event");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isSupported, refreshEvents]
  );

  // ==================== UPDATE ====================
  const updateCalendarEvent = useCallback(
    async (eventId: string, updates: CalendarEventUpdate): Promise<boolean> => {
      if (!isSupported) {
        return false;
      }

      setIsLoading(true);
      try {
        // Build the update object for calendarService
        // The service will fetch current event and merge with these updates
        const serviceUpdates: Partial<{
          title: string;
          startDate: Date;
          endDate: Date;
          location: string;
          notes: string;
        }> = {};

        if (updates.title !== undefined) {
          serviceUpdates.title = updates.title;
        }

        if (updates.description !== undefined) {
          serviceUpdates.notes = updates.description;
        }

        if (updates.location !== undefined) {
          serviceUpdates.location = updates.location;
        }

        // Handle date/time updates - need to fetch current event for duration calculation
        if (updates.date || updates.time) {
          const currentEvent = await calendarService.getEventById(eventId);

          if (currentEvent) {
            let startDate = new Date(currentEvent.startDate);
            const duration = new Date(currentEvent.endDate).getTime() - new Date(currentEvent.startDate).getTime();

            if (updates.date) {
              const newDate = new Date(updates.date);
              startDate.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
            }

            if (updates.time) {
              startDate.setHours(updates.time.getHours(), updates.time.getMinutes(), 0, 0);
            }

            serviceUpdates.startDate = startDate;
            serviceUpdates.endDate = new Date(startDate.getTime() + duration);
          }
        }

        await calendarService.updateEvent(eventId, serviceUpdates);

        await refreshEvents();
        return true;
      } catch (error) {
        console.error("Error updating calendar event:", error);
        Alert.alert("Error", "Failed to update calendar event");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isSupported, refreshEvents]
  );

  // ==================== DELETE ====================
  const deleteCalendarEvent = useCallback(
    async (eventId: string): Promise<boolean> => {
      if (!isSupported) {
        return false;
      }

      setIsLoading(true);
      try {
        await calendarService.deleteEvent(eventId);
        await refreshEvents();
        return true;
      } catch (error) {
        console.error("Error deleting calendar event:", error);
        Alert.alert("Error", "Failed to delete calendar event");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isSupported, refreshEvents]
  );

  // ==================== READ ====================
  const fetchEvents = useCallback(
    async (startDate: Date, endDate: Date) => {
      if (!isSupported) {
        return [];
      }

      setIsLoading(true);
      try {
        lastFetchRangeRef.current = { start: startDate, end: endDate };
        const fetchedEvents = await calendarService.getEvents(startDate, endDate);
        setEvents(fetchedEvents);
        return fetchedEvents;
      } catch (error) {
        console.error("Error fetching calendar events:", error);
        Alert.alert("Error", "Failed to fetch calendar events");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [isSupported]
  );

  const fetchTodayEvents = useCallback(async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return fetchEvents(start, end);
  }, [fetchEvents]);

  const fetchWeekEvents = useCallback(async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setDate(end.getDate() + 7);
    end.setHours(23, 59, 59, 999);
    return fetchEvents(start, end);
  }, [fetchEvents]);

  const fetchMonthEvents = useCallback(async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    end.setHours(23, 59, 59, 999);
    return fetchEvents(start, end);
  }, [fetchEvents]);

  return {
    // State
    isSupported,
    isLoading,
    events,

    // CRUD operations
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,

    // Fetch operations
    fetchEvents,
    fetchTodayEvents,
    fetchWeekEvents,
    fetchMonthEvents,
    refreshEvents,
  };
};
