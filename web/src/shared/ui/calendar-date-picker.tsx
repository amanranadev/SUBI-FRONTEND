"use client"

import * as React from "react"
import { format } from "date-fns"
import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { cn } from "@/lib/utils"

export type CalendarDatePickerProps = {
  view?: 'day' | 'month'
  handleOnchangeDate?: (date: Date | undefined) => void
  id?: string
  name?: string
  size?: 'sm' | 'default' | 'lg'
  value?: string | Date | null
}

export default function CalendarDatePicker({
  view = 'day',
  handleOnchangeDate,
  id,
  name,
  size = 'default',
  value,
}: CalendarDatePickerProps) {
  const parsedValue = React.useMemo(() => {
    if (!value) return undefined
    if (value instanceof Date) return value
    const str = String(value)
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str)
    if (dateOnlyMatch) {
      const [, y, m, d] = dateOnlyMatch
      return new Date(Number(y), Number(m) - 1, Number(d))
    }
    const parsed = new Date(str)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }, [value])

  const [date, setDate] = React.useState<Date | undefined>(parsedValue)
  const [month, setMonth] = React.useState<Date>(parsedValue || new Date())
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    setDate(parsedValue)
    if (parsedValue) setMonth(parsedValue)
  }, [parsedValue])

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate) setMonth(newDate)
    handleOnchangeDate?.(newDate)
    setOpen(false)
  }

  const formattedDate = date ? format(date, view === 'day' ? 'MMMM dd, yyyy' : 'MMM yyyy') : ''

  return (
    <div>
      {name && (
        <input
          type="text"
          name={name}
          value={date ? format(date, 'yyyy-MM-dd') : ''}
          id={id ? `${id}-hidden` : undefined}
          readOnly
          className="sr-only"
        />
      )}

      <Popover modal open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            className={cn(!date && 'text-muted-foreground')}
            type="button"
          >
            <span className={cn('flex-1 text-left')}>{date ? formattedDate : ' Select date'}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={date}
            month={month}
            onSelect={handleDateChange}
            onMonthChange={setMonth}
            required
            id={id}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
