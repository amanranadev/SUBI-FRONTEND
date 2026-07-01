"use client"

import * as React from "react"
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { cn } from "@/lib/utils"
import type { CalendarEvent, CalendarEventKind } from "@/features/calendar/types"
import { CalendarDayEventsDialog } from "./calendar-day-events-dialog"

const MAX_VISIBLE_DAY_EVENTS = 3

function getTaskRowClass(color: CalendarEvent["color"]) {
  return cn(
    "group w-full rounded-md border border-transparent px-1.5 py-0.5 text-left transition-colors",
    color === "purple" &&
      "bg-purple-500/8 text-purple-700 hover:border-purple-500/15 hover:bg-purple-500/12",
    color === "blue" &&
      "bg-blue-500/8 text-blue-700 hover:border-blue-500/15 hover:bg-blue-500/12",
    color === "neutral" &&
      "bg-black/[0.03] text-foreground/70 hover:border-black/10 hover:bg-black/[0.05]",
  )
}

type CalendarGridProps = {
  currentMonth: Date
  events: CalendarEvent[]
  onGoToChecklistItem: (
    transactionId: string,
    taskId: string,
    eventKind: CalendarEventKind,
  ) => void
}

export function CalendarGrid({
  currentMonth,
  events,
  onGoToChecklistItem,
}: CalendarGridProps) {
  const [hoveredDay, setHoveredDay] = React.useState<{
    key: string
    date: Date
    events: CalendarEvent[]
  } | null>(null)
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calendarInterval = eachDayOfInterval({ start: startDate, end: endDate })

  const clearCloseTimeout = React.useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  const openDayPreview = React.useCallback(
    (key: string, date: Date, dayEvents: CalendarEvent[]) => {
      clearCloseTimeout()
      setHoveredDay({ key, date, events: dayEvents })
    },
    [clearCloseTimeout],
  )

  const closeDayPreview = React.useCallback(() => {
    clearCloseTimeout()
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredDay(null)
      closeTimeoutRef.current = null
    }, 120)
  }, [clearCloseTimeout])

  React.useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="grid grid-cols-7 flex-1 border-l border-t border-black/[0.03]">
      {calendarInterval.map((day) => {
        const dayKey = format(day, "yyyy-MM-dd")
        const formattedDate = format(day, "d")
        const isToday = isSameDay(day, new Date())
        const isCurrentMonth = isSameMonth(day, monthStart)
        const dayEvents = events.filter((event) => isSameDay(event.date, day))
        const orderedDayEvents = [...dayEvents].sort((a, b) =>
          a.title.localeCompare(b.title),
        )
        const visibleDayEvents = orderedDayEvents.slice(0, MAX_VISIBLE_DAY_EVENTS)
        const hiddenEventsCount = Math.max(
          0,
          dayEvents.length - MAX_VISIBLE_DAY_EVENTS,
        )
        const isPreviewOpen = hoveredDay?.key === dayKey

        const dayCell = (
          <div
            key={day.toString()}
            onMouseEnter={() => {
              if (orderedDayEvents.length === 0) return
              openDayPreview(dayKey, day, orderedDayEvents)
            }}
            onMouseLeave={() => {
              if (orderedDayEvents.length === 0) return
              closeDayPreview()
            }}
            className={cn(
              "min-h-[140px] p-4 border-r border-b border-black/[0.03] transition-all bg-white/40",
              !isCurrentMonth && "bg-black/[0.01]",
              isPreviewOpen && "bg-blue-50/40",
            )}
          >
            <div className="flex justify-center items-center mb-4">
              <span
                className={cn(
                  "text-sm font-bold tracking-tighter flex items-center justify-center rounded-full transition-all",
                  isToday ? "h-8 w-8 bg-foreground text-background" : "opacity-40",
                )}
              >
                {formattedDate}
              </span>
            </div>

            <div className="space-y-1">
              {visibleDayEvents.map((event) => {
                const isNavigable = Boolean(event.transactionId)

                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => {
                      if (!isNavigable) return
                      onGoToChecklistItem(
                        event.transactionId,
                        event.id,
                        event.kind,
                      )
                    }}
                    className={cn(
                      getTaskRowClass(event.color),
                      "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/30",
                      isNavigable ? "cursor-pointer" : "cursor-default",
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-5 w-1 shrink-0 rounded-full",
                          event.color === "purple" && "bg-purple-500",
                          event.color === "blue" && "bg-blue-500",
                          event.color === "neutral" && "bg-black/20",
                        )}
                      />
                      <span className="truncate text-[10px] font-medium leading-5 tracking-tight">
                        {event.title} - {event.transactionAddress}
                      </span>
                    </span>
                  </button>
                )
              })}
              {hiddenEventsCount > 0 ? (
                <div className="px-1.5 text-[10px] font-medium tracking-tight text-foreground/65">
                  +{hiddenEventsCount} more
                </div>
              ) : null}
            </div>
          </div>
        )

        return orderedDayEvents.length > 0 ? (
          <CalendarDayEventsDialog
            key={dayKey}
            open={isPreviewOpen}
            selectedDate={hoveredDay?.date ?? day}
            events={hoveredDay?.events ?? orderedDayEvents}
            onOpenChange={(open) => {
              if (open) {
                openDayPreview(dayKey, day, orderedDayEvents)
                return
              }

              closeDayPreview()
            }}
            onGoToChecklistItem={(transactionId, taskId, eventKind) => {
              clearCloseTimeout()
              setHoveredDay(null)
              onGoToChecklistItem(transactionId, taskId, eventKind)
            }}
          >
            {dayCell}
          </CalendarDayEventsDialog>
        ) : (
          dayCell
        )
      })}
    </div>
  )
}
