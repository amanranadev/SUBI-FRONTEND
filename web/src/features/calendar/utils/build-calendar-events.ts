import type { GoogleCalendarEventMapped } from "@/features/calendar/types/google-calendar-event"
import { CALENDAR_EVENT_KIND, type CalendarEvent } from "@/features/calendar/types"
import type { TaskListItem } from "@/features/tasks/types"
import type { Transaction } from "@/features/workspace/types"
import { parseDateValue } from "@/shared/utils/dateUtils"

type BuildCalendarEventsParams = {
  backendTasks: TaskListItem[]
  transactions: Transaction[]
  googleEvents: GoogleCalendarEventMapped[]
}

const CLOSING_DATE_TITLE = "Closing Date"
const MUTUAL_ACCEPTANCE_TITLE = "Mutual Acceptance"

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function toEventKey(
  event: Pick<CalendarEvent, "date" | "title" | "transactionId">,
): string {
  return [
    event.transactionId || "",
    event.title.trim().toLowerCase(),
    toDateKey(event.date),
  ].join("|")
}

export function buildCalendarEvents({
  backendTasks,
  transactions,
  googleEvents,
}: BuildCalendarEventsParams): CalendarEvent[] {
  const transactionNamesById = new Map(
    transactions.map((transaction) => [transaction.id, transaction.address]),
  )
  const existingEventKeys = new Set<string>()
  const events: CalendarEvent[] = []

  const pushEvent = (event: CalendarEvent) => {
    events.push(event)
  }

  const trackExistingEvent = (event: CalendarEvent) => {
    const key = toEventKey(event)
    existingEventKeys.add(key)
    pushEvent(event)
  }

  const pushTransactionDateEvent = (event: CalendarEvent) => {
    const key = toEventKey(event)
    if (existingEventKeys.has(key)) return

    pushEvent(event)
  }

  backendTasks.forEach((task) => {
    const date = parseDateValue(task.dueDate)
    if (!date) return

    const kind =
      task.fromChecklist || Boolean(task.checklistTaskId) ?
        CALENDAR_EVENT_KIND.CHECKLIST
      : CALENDAR_EVENT_KIND.TASK
    const transactionAddress =
      (task.transactionId && transactionNamesById.get(task.transactionId)) ||
      task.address ||
      task.transactionId ||
      "Unknown Property"

    trackExistingEvent({
      id: task.id,
      title: task.name || "Task",
      color: kind === CALENDAR_EVENT_KIND.CHECKLIST ? "purple" : "blue",
      date,
      transactionId: task.transactionId || "",
      transactionAddress,
      kind,
    })
  })

  googleEvents.forEach((event) => {
    const date = parseDateValue(event.dueDate)
    if (!date) return

    trackExistingEvent({
      id: event.id,
      title: event.name || "Task",
      color: "blue",
      date,
      transactionId: event.transactionId || "",
      transactionAddress: event.address || event.location || "Google Calendar",
      kind: CALENDAR_EVENT_KIND.TASK,
    })
  })

  transactions.forEach((transaction) => {
    const transactionAddress = transaction.address || "Unknown Property"
    const sharedEvent = {
      color: "neutral" as const,
      transactionId: transaction.id,
      transactionAddress,
      kind: CALENDAR_EVENT_KIND.TASK,
    }

    const closingDate = parseDateValue(transaction.date)
    if (closingDate) {
      pushTransactionDateEvent({
        id: `transaction-close-${transaction.id}`,
        title: CLOSING_DATE_TITLE,
        date: closingDate,
        ...sharedEvent,
      })
    }

    const mutualAcceptanceDate = parseDateValue(transaction.mutualAcceptanceDate)
    if (mutualAcceptanceDate) {
      pushTransactionDateEvent({
        id: `transaction-mutual-acceptance-${transaction.id}`,
        title: MUTUAL_ACCEPTANCE_TITLE,
        date: mutualAcceptanceDate,
        ...sharedEvent,
      })
    }
  })

  return events.sort((left, right) => {
    const dateDifference = left.date.getTime() - right.date.getTime()
    if (dateDifference !== 0) {
      return dateDifference
    }

    return left.title.localeCompare(right.title)
  })
}
