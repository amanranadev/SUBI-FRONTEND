"use client"

const WEEK_DAYS = ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

export function CalendarDayLabels() {
  return (
    <div className="grid grid-cols-7 border-b border-black/[0.03] pt-10 pb-5 px-4">
      {WEEK_DAYS.map((day) => (
        <div
          key={day}
          className="text-[11px] font-bold uppercase tracking-widest opacity-30 text-center"
        >
          {day}
        </div>
      ))}
    </div>
  )
}
