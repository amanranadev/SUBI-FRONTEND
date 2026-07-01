import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  ensureSelectedGoogleCalendar,
  getGoogleCalendarEvents,
  GOOGLE_CALENDAR_EVENTS_QUERY_KEY,
} from "@/features/calendar/api/google-calendar-events-service"
import type { GoogleCalendarEventMapped } from "@/features/calendar/types/google-calendar-event"
import { logger } from "@/lib/logger"

export function useGoogleCalendarEvents(params: {
  timeMin: string
  timeMax: string
  enabled: boolean
}): {
  googleEvents: GoogleCalendarEventMapped[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
} {
  const [ensureReady, setEnsureReady] = React.useState(false)

  React.useEffect(() => {
    if (!params.enabled || ensureReady) return

    ensureSelectedGoogleCalendar()
      .catch((error: unknown) => {
        logger.warn("[GCalEvents] ensureSelectedGoogleCalendar failed, proceeding", error)
      })
      .finally(() => {
        setEnsureReady(true)
      })
    // Only run once per hook instance after sync becomes active.
  }, [params.enabled, ensureReady])

  const { data, isLoading, isFetching, error, refetch: queryRefetch } = useQuery({
    queryKey: [GOOGLE_CALENDAR_EVENTS_QUERY_KEY, params.timeMin, params.timeMax],
    queryFn: ({ signal }) =>
      getGoogleCalendarEvents(
        { timeMin: params.timeMin, timeMax: params.timeMax },
        signal,
      ),
    enabled: params.enabled && ensureReady,
    refetchOnWindowFocus: true,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })

  const isGoogleEventsLoading =
    params.enabled && (!ensureReady || isLoading || isFetching)

  return {
    googleEvents: data ?? [],
    isLoading: isGoogleEventsLoading,
    error: error instanceof Error ? error : null,
    refetch: async () => {
      await queryRefetch()
    },
  }
}
