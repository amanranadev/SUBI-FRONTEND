"use client"

import { LoadingSpinner, Txt } from "@/shared/ui"

type CalendarLegendProps = {
  totalTaskEvents: number
  totalChecklistEvents: number
  isGoogleCalendarTasksLoading: boolean
  isTransactionsLoading: boolean
  hasTransactionsError: boolean
}

export function CalendarLegend({
  totalTaskEvents,
  totalChecklistEvents,
  isGoogleCalendarTasksLoading,
  isTransactionsLoading,
  hasTransactionsError,
}: CalendarLegendProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-50">
      <span className="inline-flex items-center gap-1.5">
        {isGoogleCalendarTasksLoading ? (
          <span
            className="inline-flex size-[18px] shrink-0 items-center justify-center"
            role="status"
            aria-live="polite"
          >
            <LoadingSpinner className="size-[18px] text-current" />
            <span className="sr-only">Loading Google Calendar tasks</span>
          </span>
        ) : null}
        <Txt as="span" size="xs" weight="bold" transform="upper">
          {totalTaskEvents} tasks
        </Txt>
      </span>
      <Txt as="span" size="xs" weight="bold" transform="upper">
        •
      </Txt>
      <Txt as="span" size="xs" weight="bold" transform="upper">
        {totalChecklistEvents} checklists
      </Txt>
      {isTransactionsLoading && (
        <>
          <Txt as="span" size="xs" weight="bold" transform="upper">
            •
          </Txt>
          <Txt as="span" size="xs" weight="bold" transform="upper">
            Loading transactions...
          </Txt>
        </>
      )}
      {hasTransactionsError && (
        <>
          <Txt as="span" size="xs" weight="bold" transform="upper">
            •
          </Txt>
          <Txt
            as="span"
            size="xs"
            weight="bold"
            transform="upper"
            className="text-destructive"
          >
            Failed to load transactions
          </Txt>
        </>
      )}
    </div>
  )
}
