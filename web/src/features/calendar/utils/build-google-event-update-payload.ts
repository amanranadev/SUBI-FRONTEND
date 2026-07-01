import type {
  GoogleCalendarEventMapped,
  GoogleCalendarEventUpdatePayload,
} from "@/features/calendar/types/google-calendar-event"

/**
 * Builds a Google Calendar update payload from edited task fields.
 * Only changed fields are included.
 */
export function buildGoogleEventUpdatePayload(
  original: GoogleCalendarEventMapped,
  updated: {
    name?: string
    dueDate?: string
    description?: string
    address?: string
  },
): GoogleCalendarEventUpdatePayload {
  const payload: GoogleCalendarEventUpdatePayload = {}

  if (updated.name !== undefined && updated.name !== original.name) {
    payload.summary = updated.name
  }

  if (
    updated.description !== undefined &&
    updated.description !== original.description
  ) {
    payload.description = updated.description
  }

  if (updated.address !== undefined && updated.address !== original.address) {
    payload.location = updated.address
  }

  if (updated.dueDate !== undefined && updated.dueDate !== original.dueDate) {
    payload.start = updated.dueDate
    // Backend accepts date-only or datetime; for task-like events with no duration,
    // keep end aligned to start.
    payload.end = updated.dueDate
  }

  return payload
}

/**
 * Builds a description-only update payload for task-note flow.
 */
export function buildGoogleEventNotePayload(
  description: string,
): GoogleCalendarEventUpdatePayload {
  return { description }
}
