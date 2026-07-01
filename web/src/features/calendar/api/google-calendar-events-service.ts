import { apiClient } from "@/lib/api/client"
import { addDays, endOfDay, startOfDay, subDays } from "date-fns"
import { mapGoogleEventToTask } from "@/features/calendar/utils/map-google-event"
import {
  googleCalendarEventRawSchema,
  type GoogleCalendarEventMapped,
  type GoogleCalendarEventRaw,
  type GoogleCalendarEventUpdatePayload,
} from "@/features/calendar/types/google-calendar-event"
import { logger } from "@/lib/logger"

export const GOOGLE_CALENDAR_EVENTS_QUERY_KEY =
  "google-calendar-events" as const

type GoogleCalendarListCalendar = {
  id?: string | null
  name?: string | null
  summary?: string | null
  primary?: boolean | null
}

type GoogleCalendarListAccount = {
  id?: string | null
  selected_calendar_id?: string | null
  isSelected?: boolean | null
  selected?: boolean | null
  calendars?: GoogleCalendarListCalendar[] | null
}

/**
 * Returns a fixed time window for fetching Google Calendar events.
 * Window: today minus 7 days (timeMin) to today plus 90 days (timeMax).
 * Both bounds are UTC day boundaries (start-of-day for timeMin,
 * end-of-day for timeMax) formatted as ISO 8601 strings.
 *
 * Rationale: Task due dates are rarely in the past beyond one week and
 * rarely scheduled beyond three months. This window covers realistic
 * task list ranges without fetching unbounded history.
 */
export function buildGoogleEventTimeWindow(): {
  timeMin: string
  timeMax: string
} {
  const now = new Date()
  return {
    timeMin: startOfDay(subDays(now, 7)).toISOString(),
    timeMax: endOfDay(addDays(now, 90)).toISOString(),
  }
}

export async function getGoogleCalendarEvents(
  params: { timeMin: string; timeMax: string },
  signal?: AbortSignal,
): Promise<GoogleCalendarEventMapped[]> {
  try {
    const response = await apiClient.get("/google_calendars/events", {
      params: {
        timeMin: params.timeMin,
        timeMax: params.timeMax,
      },
      signal,
    })

    const rawItems: unknown[] =
      Array.isArray(response.data) ? response.data
      : typeof response.data === "object" &&
          response.data &&
          "events" in response.data &&
          Array.isArray(response.data.events) ?
        response.data.events
      : []
    if (rawItems.length === 0) {
      return []
    }

    const mapped: GoogleCalendarEventMapped[] = []

    rawItems.forEach((item: unknown, index: number) => {
      const result = googleCalendarEventRawSchema.safeParse(item)
      if (!result.success) {
        logger.warn(`[GCalEvents] Malformed item at index ${index}`, result.error)
        return
      }

      mapped.push(mapGoogleEventToTask(result.data))
    })

    return mapped
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response &&
      "status" in error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      return []
    }

    logger.warn("[GCalEvents] Failed to fetch Google Calendar events", error)
    return []
  }
}

export async function ensureSelectedGoogleCalendar(): Promise<void> {
  try {
    const response = await apiClient.get("/google_calendars")
    const accountsUnknown =
      typeof response.data === "object" &&
      response.data &&
      "accounts" in response.data
        ? response.data.accounts
        : []

    const accounts = Array.isArray(accountsUnknown)
      ? (accountsUnknown as GoogleCalendarListAccount[])
      : []

    if (accounts.some((account) => Boolean(account.selected_calendar_id))) {
      return
    }

    const selectedAccount =
      accounts.find((account) => account.isSelected || account.selected) ??
      accounts[0]

    if (!selectedAccount?.id) {
      return
    }

    const calendars = Array.isArray(selectedAccount.calendars)
      ? selectedAccount.calendars
      : []
    const selectedCalendar =
      calendars.find((calendar) => calendar.primary) ?? calendars[0]

    if (!selectedCalendar?.id) {
      return
    }

    await apiClient.put("/google_calendars/select", {
      account_id: selectedAccount.id,
      calendar_id: selectedCalendar.id,
      calendar_name:
        selectedCalendar.name ?? selectedCalendar.summary ?? "Google Calendar",
    })
  } catch (error) {
    logger.warn("[GCalEvents] ensureSelectedGoogleCalendar failed", error)
  }
}

/**
 * Updates a Google Calendar event via backend API.
 * Returns mapped event on success, or null on failure. Never throws.
 */
export async function updateGoogleCalendarEvent(
  eventId: string,
  payload: GoogleCalendarEventUpdatePayload,
): Promise<GoogleCalendarEventMapped | null> {
  try {
    const response = await apiClient.patch(
      `/google_calendars/events/${eventId}`,
      payload,
    )

    const responseItem: unknown =
      typeof response.data === "object" &&
      response.data &&
      "event" in response.data ?
        response.data.event
      : response.data

    const parsed = googleCalendarEventRawSchema.safeParse(
      responseItem as GoogleCalendarEventRaw,
    )

    if (!parsed.success) {
      logger.warn("[GCalEvents] Update response malformed", parsed.error)
      return null
    }

    return mapGoogleEventToTask(parsed.data)
  } catch (error) {
    logger.warn("[GCalEvents] Failed to update Google Calendar event", {
      eventId,
      error,
    })
    return null
  }
}

/**
 * Deletes a Google Calendar event via backend API.
 * Returns true on success, false on failure. Never throws.
 */
export async function deleteGoogleCalendarEvent(
  eventId: string,
): Promise<boolean> {
  try {
    await apiClient.delete(`/google_calendars/events/${eventId}`)
    return true
  } catch (error) {
    logger.warn("[GCalEvents] Failed to delete Google Calendar event", {
      eventId,
      error,
    })
    return false
  }
}
