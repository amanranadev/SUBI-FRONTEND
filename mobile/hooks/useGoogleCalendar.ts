import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import {
  getGoogleCalendarEvents,
  GoogleCalendarEventData,
} from "../services/googleCalendarService";

export const useGoogleCalendar = (options?: {
  autoRefreshOnForeground?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<GoogleCalendarEventData[]>([]);
  const lastFetchRangeRef = useRef<{ start: string; end: string } | null>(
    null
  );
  const appState = useRef(AppState.currentState);

  const refreshEvents = useCallback(async () => {
    if (lastFetchRangeRef.current) {
      const fetchedEvents = await getGoogleCalendarEvents(
        lastFetchRangeRef.current.start,
        lastFetchRangeRef.current.end
      );
      setEvents(fetchedEvents);
      return fetchedEvents;
    }
    return [];
  }, []);

  /**
   * Optimistically update a single event in the local state.
   * Returns a rollback function that restores the previous state on failure.
   */
  const optimisticUpdateEvent = useCallback(
    (
      eventId: string,
      updates: Partial<GoogleCalendarEventData>
    ): (() => void) => {
      let snapshot: GoogleCalendarEventData[] = [];
      setEvents((prev) => {
        snapshot = prev;
        return prev.map((e) =>
          e.id === eventId ? { ...e, ...updates } : e
        );
      });
      return () => setEvents(snapshot);
    },
    []
  );

  useEffect(() => {
    if (!options?.autoRefreshOnForeground) return;

    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          refreshEvents();
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [options?.autoRefreshOnForeground, refreshEvents]);

  const fetchEvents = useCallback(
    async (startDate: Date, endDate: Date) => {
      setIsLoading(true);
      try {
        const start = startDate.toISOString();
        const end = endDate.toISOString();
        lastFetchRangeRef.current = { start, end };
        const fetchedEvents = await getGoogleCalendarEvents(start, end);
        setEvents(fetchedEvents);
        return fetchedEvents;
      } catch (error) {
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchMonthEvents = useCallback(async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    end.setHours(23, 59, 59, 999);
    return fetchEvents(start, end);
  }, [fetchEvents]);

  return {
    isLoading,
    events,
    fetchEvents,
    fetchMonthEvents,
    refreshEvents,
    optimisticUpdateEvent,
  };
};
