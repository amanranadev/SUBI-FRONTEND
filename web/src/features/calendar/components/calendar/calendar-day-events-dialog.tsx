"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  ArrowUpRight,
  CalendarClock,
  ClipboardCheck,
  ListTodo,
  MapPin,
} from "lucide-react"
import type { CalendarEvent, CalendarEventKind } from "@/features/calendar/types"
import { cn } from "@/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { Txt } from "@/shared/ui"

type CalendarDayEventsDialogProps = {
  children: React.ReactNode
  open: boolean
  selectedDate: Date | null
  events: CalendarEvent[]
  onOpenChange: (open: boolean) => void
  onGoToChecklistItem: (
    transactionId: string,
    taskId: string,
    eventKind: CalendarEventKind,
  ) => void
}

export function CalendarDayEventsDialog({
  children,
  open,
  selectedDate,
  events,
  onOpenChange,
  onGoToChecklistItem,
}: CalendarDayEventsDialogProps) {
  const [activeEventId, setActiveEventId] = React.useState<string | null>(null)

  const sortedEvents = [...events].sort((a, b) => {
    if (a.kind !== b.kind) {
      return a.kind.localeCompare(b.kind)
    }

    return a.title.localeCompare(b.title)
  })

  const checklistCount = events.filter((event) => event.kind === "checklist").length
  const taskCount = events.length - checklistCount

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={14}
        collisionPadding={20}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
        }}
        onMouseEnter={() => onOpenChange(true)}
        onMouseLeave={() => {
          setActiveEventId(null)
          onOpenChange(false)
        }}
        className="w-[460px] rounded-[3rem] border border-black/5 bg-background p-0 heavy-shadow"
      >
        <div className="overflow-hidden rounded-[3rem]">
          <div className="border-b border-black/5 px-6 py-5">

            <Txt as="p" size="lg" weight="bold" className="mt-3 tracking-tight">
              {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Day events"}
            </Txt>
            <Txt as="p" size="sm" weight="medium" className="mt-2 tracking-tight opacity-70">
              {events.length
                ? `${taskCount} task${taskCount !== 1 ? "s" : ""}, ${checklistCount} checklist${checklistCount !== 1 ? "s" : ""}`
                : "No scheduled items for this day."}
            </Txt>
          </div>

          <div className="px-5 pb-5 pt-2">
            <div className="subtle-scrollbar max-h-[55vh] space-y-3 overflow-y-auto rounded-[2.25rem] pr-2">
              {sortedEvents.map((event) => {
                const EventKindIcon =
                  event.kind === "checklist" ? ClipboardCheck : ListTodo

                return (
                  <div
                    key={event.id}
                    role={event.transactionId ? "button" : undefined}
                    tabIndex={event.transactionId ? 0 : -1}
                    onMouseEnter={() => setActiveEventId(event.id)}
                    onFocus={() => setActiveEventId(event.id)}
                    onBlur={() => {
                      setActiveEventId((currentId) =>
                        currentId === event.id ? null : currentId,
                      )
                    }}
                    onClick={() => {
                      if (!event.transactionId) return
                      onOpenChange(false)
                      onGoToChecklistItem(
                        event.transactionId,
                        event.id,
                        event.kind,
                      )
                    }}
                    onKeyDown={(keyboardEvent) => {
                      if (!event.transactionId) return
                      if (
                        keyboardEvent.key !== "Enter" &&
                        keyboardEvent.key !== " "
                      ) {
                        return
                      }

                      keyboardEvent.preventDefault()
                      onOpenChange(false)
                      onGoToChecklistItem(
                        event.transactionId,
                        event.id,
                        event.kind,
                      )
                    }}
                    className={cn(
                      "rounded-[2rem] border bg-white/88 p-4 shadow-[0_24px_50px_-34px_rgba(15,23,42,0.38)] transition-all focus:outline-none focus:ring-2 focus:ring-primary/30",
                      event.transactionId ? "cursor-pointer" : "cursor-default",
                      activeEventId === event.id
                        ? "border-primary/20 bg-white shadow-[0_28px_65px_-30px_rgba(59,130,246,0.34)]"
                        : "border-black/[0.05] hover:border-primary/10 hover:bg-white",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-[1.35rem] bg-black/[0.03] text-foreground/65">
                          <EventKindIcon className="size-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <Txt
                            as="p"
                            size="base"
                            weight="bold"
                            className="truncate tracking-tight"
                          >
                            {event.title}
                          </Txt>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5 truncate">
                              <MapPin className="size-3 shrink-0" />
                              <span className="truncate">{event.transactionAddress}</span>
                            </span>
                            <span className="opacity-30">&middot;</span>
                            <span className="flex shrink-0 items-center gap-1.5">
                              <CalendarClock className="size-3" />
                              {format(event.date, "MMM d, yyyy")}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="mt-1 rounded-full border-black/10 bg-white/80 px-2.5 py-0 text-[10px] font-bold uppercase tracking-widest"
                          >
                            {event.kind}
                          </Badge>
                        </div>
                      </div>

                      <span
                        aria-hidden="true"
                        className="flex size-10 shrink-0 items-center justify-center rounded-[1.25rem] bg-black/[0.02] opacity-50"
                      >
                        <ArrowUpRight className="size-4" />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
