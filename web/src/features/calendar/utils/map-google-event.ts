import type {
  GoogleCalendarEventMapped,
  GoogleCalendarEventRaw,
} from "@/features/calendar/types/google-calendar-event"

/**
 * Maps a raw Google Calendar event from the backend into a shape compatible
 * with TaskListItem for rendering in the internal task list.
 *
 * Design decisions:
 * - dueDate is preserved as the raw string from the API. We never construct
 *   a Date object or call toISOString() because doing so would apply the
 *   local timezone offset and shift the displayed date. The raw string
 *   (either YYYY-MM-DD or a full ISO datetime) is what the UI renders directly.
 *
 * - allDay is detected by checking whether the start string matches the
 *   date-only format YYYY-MM-DD. Google Calendar uses this format for
 *   all-day events and includes a time component for timed events.
 *
 * - isCalendarEvent: true is a discriminator field that task list renderers
 *   use to suppress edit/delete affordances for Google events.
 */
export function mapGoogleEventToTask(
  raw: GoogleCalendarEventRaw,
): GoogleCalendarEventMapped {
  const eventId = typeof raw.id === "string" ? raw.id : ""
  const start = typeof raw.start === "string" ? raw.start : ""

  return {
    id: `gcal-${eventId}`,
    googleEventId: eventId,
    name: typeof raw.summary === "string" ? raw.summary : "",
    description: typeof raw.description === "string" ? raw.description : "",
    dueDate: start,
    transactionId: "",
    type: "TASK",
    completed: false,
    status: "ON_TRACK",
    isCalendarEvent: true,
    allDay: /^\d{4}-\d{2}-\d{2}$/.test(start),
    information: "", // Default: Google events do not provide internal task information.
    location: typeof raw.location === "string" ? raw.location : "", // Default: empty display value when Google location is absent.
    assignedTo: "", // Default: Google events have no assignee in internal task data.
    address: "", // Default: Google events are not tied to a transaction address.
    checklistTaskId: null, // Default: Google events are not checklist tasks.
    checklistId: null, // Default: Google events have no checklist parent.
    fromChecklist: false, // Default: Google events never originate from checklist templates.
    createdAt: "", // Default: no backend createdAt for Google event list rendering.
  }
}
