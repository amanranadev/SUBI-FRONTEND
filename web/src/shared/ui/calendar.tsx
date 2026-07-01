"use client"

import * as React from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/shared/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/** Only applied when `mode === "range"` — keeps all other calendar UX unchanged. */
const RANGE_SELECTION_CLASS_NAMES: Partial<
  NonNullable<CalendarProps["classNames"]>
> = {
  week: "mt-2 flex w-full gap-0",
  day: cn(
    "relative h-9 w-9 p-0 text-center text-sm",
    "focus-within:relative focus-within:z-20",
  ),
  day_button: cn(
    "flex items-center justify-center size-9 p-0 font-normal border border-transparent rounded-full",
    "cursor-pointer hover:bg-primary/12",
    "aria-selected:opacity-100",
    "disabled:pointer-events-none disabled:cursor-default disabled:opacity-50",
  ),
  selected: cn(
    "rounded-full bg-primary/22 font-semibold text-primary shadow-none",
    "ring-1 ring-primary/20",
    "hover:bg-primary/30 hover:text-primary",
    "focus:bg-primary/25 focus:text-primary",
  ),
  range_start: cn(
    "rounded-l-[10px] bg-primary/8",
    "[&>button]:relative [&>button]:z-[1]",
    "[&>button]:rounded-full [&>button]:bg-primary [&>button]:text-primary-foreground",
    "[&>button]:shadow-sm [&>button]:hover:bg-primary/90",
  ),
  range_middle: cn(
    "rounded-none bg-primary/7",
    "[&>button]:rounded-none [&>button]:bg-transparent [&>button]:text-foreground",
    "[&>button]:font-medium [&>button]:shadow-none",
    "[&>button]:hover:bg-primary/12",
  ),
  range_end: cn(
    "day-range-end rounded-r-[10px] bg-primary/8",
    "[&>button]:relative [&>button]:z-[1]",
    "[&>button]:rounded-full [&>button]:bg-primary [&>button]:text-primary-foreground",
    "[&>button]:shadow-sm [&>button]:hover:bg-primary/90",
  ),
  outside:
    "outside text-muted-foreground opacity-60 aria-selected:bg-primary/6 aria-selected:text-muted-foreground",
}

const BASE_CALENDAR_CLASS_NAMES: NonNullable<CalendarProps["classNames"]> = {
  months: "flex flex-col gap-4",
  month: "space-y-4",
  month_caption: "relative flex items-center justify-center pt-1",
  caption_label: "text-sm font-medium",
  nav: "absolute inset-x-0 top-1 flex items-center justify-between px-1",
  button_previous: cn(
    buttonVariants({ variant: "outline" }),
    "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
  ),
  button_next: cn(
    buttonVariants({ variant: "outline" }),
    "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
  ),
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday:
    "w-9 text-center text-[0.8rem] font-normal text-muted-foreground rounded-md",
  week: "mt-2 flex w-full",
  day: cn(
    "relative h-9 w-9 p-0 text-center text-sm",
    "[&:has([aria-selected=true].day-range-end)]:rounded-r-lg",
    "[&:has([aria-selected=true].outside)]:bg-primary/8",
    "[&:has([aria-selected=true])]:bg-primary/10",
    "first:[&:has([aria-selected=true])]:rounded-l-lg last:[&:has([aria-selected=true])]:rounded-r-lg",
    "focus-within:relative focus-within:z-20",
  ),
  day_button: cn(
    "flex items-center justify-center size-9 p-0 font-normal border border-transparent rounded-full",
    "cursor-pointer hover:bg-primary/15",
    "aria-selected:opacity-100",
    "disabled:pointer-events-none disabled:cursor-default disabled:opacity-50",
  ),
  selected: cn(
    "rounded-full bg-primary/20 font-medium text-primary shadow-none ring-1 ring-primary/25",
    "hover:bg-primary/28 hover:text-primary focus:bg-primary/22 focus:text-primary",
  ),
  today: "rounded-full bg-primary/15 text-foreground",
  outside: "outside text-muted-foreground opacity-60",
  disabled: "text-muted-foreground opacity-50",
  range_middle:
    "rounded-none aria-selected:bg-primary/10 aria-selected:text-foreground",
  range_end: "day-range-end",
  hidden: "invisible",
}

function Calendar({
  className,
  classNames: userClassNames,
  showOutsideDays = true,
  mode,
  ...props
}: CalendarProps) {
  const isRange = mode === "range"

  const mergedClassNames = React.useMemo(
    () => ({
      ...BASE_CALENDAR_CLASS_NAMES,
      ...(isRange ? RANGE_SELECTION_CLASS_NAMES : {}),
      ...userClassNames,
    }),
    [isRange, userClassNames],
  )

  return (
    <div data-subi-calendar {...(isRange ? { "data-range-picker": "" as const } : {})}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        mode={mode}
        className={cn("p-3", className)}
        classNames={mergedClassNames}
        components={{
          Chevron: (({
            className: chevronClassName,
            orientation,
            ...chevronProps
          }: {
            className?: string
            orientation?: "left" | "right" | "down"
          }) => (
            orientation === "left" ? (
              <ChevronLeft className={cn("h-4 w-4", chevronClassName)} {...chevronProps} />
            ) : orientation === "right" ? (
              <ChevronRight className={cn("h-4 w-4", chevronClassName)} {...chevronProps} />
            ) : (
              <ChevronDown className={cn("h-4 w-4", chevronClassName)} {...chevronProps} />
            )
          )) as NonNullable<CalendarProps["components"]>["Chevron"],
        } as CalendarProps["components"]}
        {...props}
      />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
