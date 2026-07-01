import * as React from "react"
import { type UseQueryResult } from "@tanstack/react-query"
import { buildGoogleEventTimeWindow } from "@/features/calendar/api/google-calendar-events-service"
import { useGoogleCalendarEvents } from "@/features/calendar/hooks/use-google-calendar-events"
import { useIsGoogleCalendarConnected } from "@/features/calendar/hooks/use-is-google-calendar-connected"
import { useAllTasks } from "@/features/tasks/hooks/use-all-tasks"
import type { TaskListItem, UseAllTasksParams } from "@/features/tasks/types"
import type { GoogleCalendarEventMapped } from "@/features/calendar/types/google-calendar-event"

interface UseAllTasksWithGoogleEventsResult extends Omit<UseQueryResult<TaskListItem[], Error>, "data"> {
  data: (TaskListItem | GoogleCalendarEventMapped)[]
  isGoogleLoading: boolean
  googleError: Error | null
  refetchAll: () => Promise<void>
  refetchGoogleEvents: () => Promise<void>
}

export function useAllTasksWithGoogleEvents(
  params: UseAllTasksParams = {},
): UseAllTasksWithGoogleEventsResult {
  const nativeResult = useAllTasks(params)
  const { isConnected } = useIsGoogleCalendarConnected()

  const { timeMin, timeMax } = React.useMemo(
    () => buildGoogleEventTimeWindow(),
    // Intentionally fixed per hook mount to keep the query key stable.
    [], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const {
    googleEvents,
    isLoading: isGoogleLoading,
    error: googleError,
    refetch,
  } = useGoogleCalendarEvents({
    timeMin,
    timeMax,
    enabled: isConnected,
  })

  const data = React.useMemo(
    // Deduplication limitation:
    // TaskListItem currently has no stable native field that stores
    // the corresponding Google event id for app-created tasks.
    // Without that linkage key, safe deduplication cannot be implemented
    // at this layer without risking false positives.
    () => [...(nativeResult.data ?? []), ...googleEvents],
    [nativeResult.data, googleEvents],
  )

  // Omit data from nativeResult spread because we override it with merged data
  const { data: _nativeData, ...queryProps } = nativeResult

  return {
    ...queryProps,
    data,
    isGoogleLoading,
    googleError,
    refetchAll: async () => {
      await Promise.all([nativeResult.refetch(), refetch()])
    },
    refetchGoogleEvents: refetch,
  }
}
