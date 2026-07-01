import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  deleteGoogleCalendarEvent,
  GOOGLE_CALENDAR_EVENTS_QUERY_KEY,
} from "@/features/calendar/api/google-calendar-events-service"
import type { GoogleCalendarEventMapped } from "@/features/calendar/types/google-calendar-event"
import { logger } from "@/lib/logger"

export function useDeleteGoogleCalendarEvent() {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (rawEventId: string) => deleteGoogleCalendarEvent(rawEventId),
    onMutate: async (rawEventId: string) => {
      await queryClient.cancelQueries({
        queryKey: [GOOGLE_CALENDAR_EVENTS_QUERY_KEY],
      })

      const previousEntries = queryClient.getQueriesData<
        GoogleCalendarEventMapped[]
      >({
        queryKey: [GOOGLE_CALENDAR_EVENTS_QUERY_KEY],
      })

      queryClient.setQueriesData<GoogleCalendarEventMapped[]>(
        { queryKey: [GOOGLE_CALENDAR_EVENTS_QUERY_KEY] },
        (old) => old?.filter((event) => event.googleEventId !== rawEventId) ?? [],
      )

      return { previousEntries }
    },
    onSuccess: async (deleted: boolean, _rawEventId, context) => {
      if (!deleted) {
        context?.previousEntries.forEach(([queryKey, previousValue]) => {
          queryClient.setQueryData(queryKey, previousValue)
        })
        return
      }

      await queryClient.invalidateQueries({
        queryKey: [GOOGLE_CALENDAR_EVENTS_QUERY_KEY],
      })
    },
    onError: (error, _rawEventId, context) => {
      context?.previousEntries.forEach(([queryKey, previousValue]) => {
        queryClient.setQueryData(queryKey, previousValue)
      })
      logger.warn("[GCalEvents] Unexpected error in delete mutation", error)
    },
  })

  return {
    deleteGoogleEvent: mutateAsync,
    isDeleting: isPending,
  }
}
