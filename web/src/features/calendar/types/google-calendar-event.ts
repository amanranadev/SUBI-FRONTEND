import { z } from "zod"
import type { TaskListItem } from "@/features/tasks/types"

export const googleCalendarEventRawSchema = z.object({
  id: z.string().min(1),
  summary: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  start: z.string().nullable().optional(),
  end: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
})

export type GoogleCalendarEventRaw = z.infer<typeof googleCalendarEventRawSchema>

/**
 * A Google Calendar event mapped into a shape compatible with the task list.
 * TaskListItem fields are inherited and intentionally not redeclared.
 */
export interface GoogleCalendarEventMapped extends TaskListItem {
  /** Discriminator for routing edit/delete to Google APIs. */
  readonly isCalendarEvent: true
  /** Raw Google Calendar event ID without gcal- prefix. */
  readonly googleEventId: string
  /** True when event start is date-only YYYY-MM-DD. */
  readonly allDay: boolean
  /**
   * Google-specific location field from the events API.
   * Not part of TaskListItem, so it remains declared here.
   */
  readonly location: string
  /**
   * Calendar event rows are mapped as plain tasks in the UI.
   * Keep this literal to preserve renderer behavior.
   */
  readonly type: "TASK"
  /** Google rows are read-only and rendered as not completed by default. */
  readonly completed: false
  /** Google rows default to ON_TRACK status in list rendering. */
  readonly status: "ON_TRACK"
}

/**
 * Payload sent to PATCH /google_calendars/events/:eventId.
 * All fields are optional — only send changed values.
 */
export interface GoogleCalendarEventUpdatePayload {
  summary?: string
  description?: string
  start?: string
  end?: string
  location?: string
}
