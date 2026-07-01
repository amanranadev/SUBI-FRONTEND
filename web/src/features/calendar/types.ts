export const CALENDAR_EVENT_KIND = {
  TASK: "task",
  CHECKLIST: "checklist",
} as const

export type CalendarEventKind =
  (typeof CALENDAR_EVENT_KIND)[keyof typeof CALENDAR_EVENT_KIND]

export interface CalendarEvent {
  id: string
  title: string
  color: "blue" | "purple" | "neutral"
  date: Date
  transactionId: string
  transactionAddress: string
  kind: CalendarEventKind
}
