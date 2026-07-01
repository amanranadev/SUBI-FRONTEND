import { extractIsoDay, formatLocalDateToIsoDay } from "@/shared/utils/dateUtils"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
})

/** Parses a price/currency string (e.g. "$1,234.56") to a number. */
export function parseCurrencyToNumber(
  value: number | string | null | undefined,
): number {
  if (value === null || value === undefined || value === "") return 0
  const num =
    typeof value === "string"
      ? parseFloat(String(value).replace(/[^0-9.-]/g, ""))
      : value
  return Number.isNaN(num) ? 0 : num
}

export function formatCurrency(value: number | string | null | undefined): string {
  const num = parseCurrencyToNumber(value)
  if (num === 0 && (value === null || value === undefined || value === ""))
    return ""
  return currencyFormatter.format(num)
}

export function formatDateDisplay(dateStr: string | null | undefined): string {
  if (!dateStr) return ""

  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    return `${isoMatch[2]}/${isoMatch[3]}/${isoMatch[1]}`
  }

  return dateStr
}

export function parseDateToISO(dateStr: string | null | undefined): string {
  if (!dateStr) return ""

  const isoDay = extractIsoDay(dateStr)
  if (isoDay) return isoDay

  const slashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashMatch) {
    const month = String(Number(slashMatch[1])).padStart(2, "0")
    const day = String(Number(slashMatch[2])).padStart(2, "0")
    return `${slashMatch[3]}-${month}-${day}`
  }

  const dashMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
  if (dashMatch) {
    const month = String(Number(dashMatch[1])).padStart(2, "0")
    const day = String(Number(dashMatch[2])).padStart(2, "0")
    return `${dashMatch[3]}-${month}-${day}`
  }

  const date = new Date(dateStr)
  if (!Number.isNaN(date.getTime())) {
    return formatLocalDateToIsoDay(date)
  }

  return dateStr
}

function observedHolidayUtc(year: number, monthIndex: number, day: number): Date {
  const date = new Date(Date.UTC(year, monthIndex, day))
  const weekday = date.getUTCDay()
  if (weekday === 6) date.setUTCDate(date.getUTCDate() - 1)
  if (weekday === 0) date.setUTCDate(date.getUTCDate() + 1)
  return date
}

function nthWeekdayOfMonthUtc(
  year: number,
  monthIndex: number,
  weekday: number,
  nth: number,
): Date {
  const firstDay = new Date(Date.UTC(year, monthIndex, 1))
  const offset = (weekday - firstDay.getUTCDay() + 7) % 7
  const day = 1 + offset + (nth - 1) * 7
  return new Date(Date.UTC(year, monthIndex, day))
}

function lastWeekdayOfMonthUtc(
  year: number,
  monthIndex: number,
  weekday: number,
): Date {
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0))
  const backshift = (lastDay.getUTCDay() - weekday + 7) % 7
  lastDay.setUTCDate(lastDay.getUTCDate() - backshift)
  return lastDay
}

function isFederalHolidayUtc(date: Date): boolean {
  const year = date.getUTCFullYear()
  const holidays = [
    observedHolidayUtc(year, 0, 1), // New Year's Day
    nthWeekdayOfMonthUtc(year, 0, 1, 3), // MLK Day (3rd Monday of January)
    nthWeekdayOfMonthUtc(year, 1, 1, 3), // Presidents Day (3rd Monday of February)
    lastWeekdayOfMonthUtc(year, 4, 1), // Memorial Day (last Monday of May)
    observedHolidayUtc(year, 6, 4), // Independence Day
    nthWeekdayOfMonthUtc(year, 8, 1, 1), // Labor Day (1st Monday of September)
    nthWeekdayOfMonthUtc(year, 9, 1, 2), // Columbus Day (2nd Monday of October)
    observedHolidayUtc(year, 10, 11), // Veterans Day
    nthWeekdayOfMonthUtc(year, 10, 4, 4), // Thanksgiving (4th Thursday of November)
    observedHolidayUtc(year, 11, 25), // Christmas Day
  ]
  return holidays.some(
    (holiday) =>
      holiday.getUTCFullYear() === date.getUTCFullYear() &&
      holiday.getUTCMonth() === date.getUTCMonth() &&
      holiday.getUTCDate() === date.getUTCDate(),
  )
}

/** Returns current date in YYYY-MM-DD (UTC). */
/** Returns current local date in YYYY-MM-DD. */
export function getCurrentISODate(): string {
  return formatLocalDateToIsoDay(new Date())
}

function parseISODateParts(isoDate: string): {
  year: number
  month: number
  day: number
} | null {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  }
}

function formatUTCDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/** Adds N calendar days to an ISO date string (YYYY-MM-DD). */
export function addDaysToISODate(isoDate: string, daysOffset: number): string {
  const parts = parseISODateParts(isoDate)
  if (!parts) return isoDate

  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
  date.setUTCDate(date.getUTCDate() + daysOffset)
  return formatUTCDate(date)
}

/** Adds N business days (Mon-Fri) to an ISO date string (YYYY-MM-DD). */
export function addBusinessDaysToISODate(
  isoDate: string,
  daysOffset: number,
): string {
  const parts = parseISODateParts(isoDate)
  if (!parts) return isoDate

  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
  const step = daysOffset >= 0 ? 1 : -1
  let remaining = Math.abs(daysOffset)

  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + step)
    const dayOfWeek = date.getUTCDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isFederalHoliday = isFederalHolidayUtc(date)
    if (!isWeekend && !isFederalHoliday) {
      remaining -= 1
    }
  }

  return formatUTCDate(date)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return ""
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHr = Math.floor(diffMs / 3_600_000)
  const diffDay = Math.floor(diffMs / 86_400_000)

  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return formatDateDisplay(dateStr)
}
