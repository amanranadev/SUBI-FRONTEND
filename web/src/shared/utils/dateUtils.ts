function pad2(value: number): string {
  return String(value).padStart(2, "0")
}

/** Date object -> local calendar day (`YYYY-MM-DD`) with no UTC conversion. */
export function formatLocalDateToIsoDay(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/** Extracts the `YYYY-MM-DD` day part from ISO-like strings. */
export function extractIsoDay(value: string): string | undefined {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/)
  return match?.[1]
}

export function parseDateValue(
  value: string | Date | null | undefined,
): Date | undefined {
  if (value === null || value === undefined || value === "") return undefined
  if (value instanceof Date) return value

  const str = String(value)

  // ISO day or ISO datetime -> parse as local calendar day.
  const isoDay = extractIsoDay(str)
  if (isoDay) {
    const d = new Date(`${isoDay}T00:00:00`)
    return Number.isNaN(d.getTime()) ? undefined : d
  }

  // MM/DD/YYYY
  const slash = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (slash) {
    const [, mm, dd, yyyy] = slash
    const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00`)
    return Number.isNaN(d.getTime()) ? undefined : d
  }

  // Fallback: try Date constructor
  const parsed = new Date(str)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

export function dateToInputFormat(date?: string | Date | null): string {
  if (!date) return ""
  if (date instanceof Date) return formatLocalDateToIsoDay(date)

  const str = String(date)

  const isoDay = extractIsoDay(str)
  if (isoDay) return isoDay

  const slash = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (slash) {
    const [, mm, dd, yyyy] = slash
    return `${yyyy}-${mm}-${dd}`
  }

  const parsed = new Date(str)
  if (!Number.isNaN(parsed.getTime())) return formatLocalDateToIsoDay(parsed)

  return ""
}

export default {
  parseDateValue,
  dateToInputFormat,
}
