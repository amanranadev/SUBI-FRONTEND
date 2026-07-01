import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  GOOGLE_CALENDAR_EVENTS_QUERY_KEY,
  updateGoogleCalendarEvent,
} from "@/features/calendar/api/google-calendar-events-service"
import type { GoogleCalendarEventUpdatePayload } from "@/features/calendar/types/google-calendar-event"

export function useUpdateGoogleCalendarEvent() {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: string
      payload: GoogleCalendarEventUpdatePayload
    }) => updateGoogleCalendarEvent(eventId, payload),
    onSuccess: async (updatedEvent) => {
      if (!updatedEvent) return
      await queryClient.invalidateQueries({
        queryKey: [GOOGLE_CALENDAR_EVENTS_QUERY_KEY],
      })
    },
  })

  return {
    updateGoogleEvent: mutateAsync,
    isUpdating: isPending,
  }
}
