import { format, isValid, parse } from "date-fns";

export const DEFAULT_DATE_FORMAT = "dd-MMM-yyyy";

export function formatDateValue(
  date: Date | undefined,
  dateFormat: string = DEFAULT_DATE_FORMAT,
): string | undefined {
  if (!date || !isValid(date)) {
    return undefined;
  }
  return format(date, dateFormat);
}

export function toCalendarDateString(date: Date | undefined): string | undefined {
  if (!date || !isValid(date)) {
    return undefined;
  }
  return format(date, "yyyy-MM-dd");
}

export function parseCalendarDateString(dateString: string): Date {
  return parse(dateString, "yyyy-MM-dd", new Date());
}
