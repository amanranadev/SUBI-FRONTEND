import type { GoogleCalendarEventMapped } from "@/features/calendar/types/google-calendar-event"
import type { TaskListItem } from "@/features/tasks/types"

/**
 * Type guard for Google Calendar task rows.
 * Returns true and narrows the type when task is mapped from Google events.
 */
export function isGoogleCalendarTask(
  task: TaskListItem | null | undefined,
): task is GoogleCalendarEventMapped {
  if (task === null || task === undefined) {
    return false
  }

  const isCalendarEvent = Reflect.get(task, "isCalendarEvent")
  const googleEventId = Reflect.get(task, "googleEventId")

  return (
    isCalendarEvent === true &&
    typeof googleEventId === "string" &&
    googleEventId.length > 0
  )
}
