import { TRANSACTION_TASK_TYPE } from "@/features/transactions/constants"
import { CALENDAR_EVENT_KIND, type CalendarEventKind } from "@/features/calendar/types"

export function resolveEventKind(
  rawTaskType: string | null | undefined,
): CalendarEventKind {
  if (String(rawTaskType ?? "").toUpperCase() === TRANSACTION_TASK_TYPE.FORM) {
    return CALENDAR_EVENT_KIND.CHECKLIST
  }
  return CALENDAR_EVENT_KIND.TASK
}
