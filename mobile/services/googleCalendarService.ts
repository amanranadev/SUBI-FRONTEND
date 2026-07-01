import apiClient from "./api";
import { CalendarEvent } from "./calendarService";

/**
 * Google Calendar Service
 * Provides the same interface as Apple Calendar service but uses backend API
 */

interface GoogleCalendar {
  id: string;
  name: string;
  description?: string;
  primary: boolean;
}

interface GoogleCalendarAccount {
  id: string;
  email: string;
  name: string;
  calendars: GoogleCalendar[];
  selected_calendar_id: string | null;
  selected_calendar_name: string | null;
}

interface GoogleCalendarsResponse {
  accounts: GoogleCalendarAccount[];
  selected_calendar_id: string | null;
  selected_calendar_name: string | null;
}

/**
 * Represents a single event returned from the backend's Google Calendar events endpoint.
 * Fields mirror what Google Calendar API provides, simplified by the backend.
 */
export interface GoogleCalendarEventData {
  id: string;
  summary: string;
  description?: string;
  start: string; // ISO datetime string or date-only string for all-day events
  end: string;   // ISO datetime string or date-only string for all-day events
  location?: string;
  status?: string;
  allDay: boolean;
}

interface GoogleCalendarEventsResponse {
  events: GoogleCalendarEventData[];
}

interface SelectGoogleCalendarPayload {
  account_id: string;
  calendar_id: string;
  calendar_name: string;
}

const resolveCalendarSelection = (
  accounts: GoogleCalendarAccount[]
): SelectGoogleCalendarPayload | null => {
  if (!accounts.length) return null;

  // Prefer already selected calendar.
  for (const account of accounts) {
    if (account.selected_calendar_id) {
      return {
        account_id: account.id,
        calendar_id: account.selected_calendar_id,
        calendar_name: account.selected_calendar_name || "Google Calendar",
      };
    }
  }

  // Otherwise fallback to primary calendar in first account.
  const firstAccount = accounts[0];
  const primaryCalendar = firstAccount.calendars.find((cal) => cal.primary);
  if (primaryCalendar) {
    return {
      account_id: firstAccount.id,
      calendar_id: primaryCalendar.id,
      calendar_name: primaryCalendar.name,
    };
  }

  // Final fallback to first available calendar.
  if (firstAccount.calendars.length > 0) {
    return {
      account_id: firstAccount.id,
      calendar_id: firstAccount.calendars[0].id,
      calendar_name: firstAccount.calendars[0].name,
    };
  }

  return null;
};

/**
 * Get the selected/default Google Calendar
 */
export const getDefaultGoogleCalendar = async (): Promise<{
  accountId: string;
  calendarId: string;
  calendarName: string;
} | null> => {
  try {
    const response =
      await apiClient.get<GoogleCalendarsResponse>("/google_calendars");

    if (!response.data?.accounts || response.data.accounts.length === 0) {
      return null;
    }

    // Find account with selected calendar
    for (const account of response.data.accounts) {
      if (account.selected_calendar_id) {
        return {
          accountId: account.id,
          calendarId: account.selected_calendar_id,
          calendarName: account.selected_calendar_name || "Google Calendar",
        };
      }
    }

    // If no selected calendar, use primary calendar from first account
    const firstAccount = response.data.accounts[0];
    const primaryCalendar = firstAccount.calendars.find((cal) => cal.primary);

    if (primaryCalendar) {
      return {
        accountId: firstAccount.id,
        calendarId: primaryCalendar.id,
        calendarName: primaryCalendar.name,
      };
    }

    // Fallback to first calendar
    if (firstAccount.calendars.length > 0) {
      return {
        accountId: firstAccount.id,
        calendarId: firstAccount.calendars[0].id,
        calendarName: firstAccount.calendars[0].name,
      };
    }

    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Ensure backend has an explicit selected Google calendar for the connected account.
 */
export const ensureSelectedGoogleCalendar = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get<GoogleCalendarsResponse>("/google_calendars");
    const accounts = response.data?.accounts || [];
    const selectedCalendar = resolveCalendarSelection(accounts);
    if (!selectedCalendar) return false;

    await apiClient.put("/google_calendars/select", selectedCalendar);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Add an event directly to Google Calendar via backend API.
 * The event is NOT saved in the app's database — it lives only in Google Calendar.
 */
export const addGoogleCalendarEvent = async (
  event: CalendarEvent
): Promise<string | null> => {
  try {
    const payload = {
      summary: event.title,
      description: event.notes || "",
      location: event.location || "",
      start: event.startDate.toISOString(),
      end: event.endDate.toISOString(),
    };

    const response = await apiClient.post<{ id?: string; event?: { id?: string } }>(
      "/google_calendars/events",
      payload
    );

    const eventId =
      response.data?.id ||
      response.data?.event?.id;

    return eventId || null;
  } catch (error) {
    return null;
  }
};

/**
 * Update fields of a Google Calendar event directly via the backend API.
 * Only the provided fields are sent; the backend/Google merges them with existing data.
 */
export interface GoogleCalendarEventUpdate {
  summary?: string;
  description?: string;
  location?: string;
  start?: string; // ISO datetime string
  end?: string;   // ISO datetime string
}

export const updateGoogleCalendarEvent = async (
  eventId: string,
  updates: GoogleCalendarEventUpdate
): Promise<boolean> => {
  try {
    await apiClient.patch(`/google_calendars/events/${eventId}`, updates);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Delete a Google Calendar event via the Google Calendar events API
 */
export const deleteGoogleCalendarEvent = async (
  eventId: string
): Promise<boolean> => {
  try {
    await apiClient.delete(`/google_calendars/events/${eventId}`);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Fetch events from Google Calendar via backend API.
 * The backend uses the stored OAuth tokens to query Google Calendar API
 * and returns a simplified list of events.
 */
export const getGoogleCalendarEvents = async (
  startDate: string,
  endDate: string
): Promise<GoogleCalendarEventData[]> => {
  try {
    const response = await apiClient.get<GoogleCalendarEventsResponse>(
      "/google_calendars/events",
      {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      }
    );
    const events = response.data?.events || [];
    return events;
  } catch (error) {
    return [];
  }
};
