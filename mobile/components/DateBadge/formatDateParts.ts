import { isValid } from "date-fns";

export interface DateBadgeParts {
  month: string;
  day: string;
  accessibilityDate: string;
}

const DEFAULT_LOCALE = "en-US";

export function formatDateParts(
  date: Date,
  locale: string = DEFAULT_LOCALE,
): DateBadgeParts {
  if (!isValid(date)) {
    return { month: "--", day: "--", accessibilityDate: "Invalid date" };
  }

  const monthFormatter = new Intl.DateTimeFormat(locale, { month: "short" });
  const dayFormatter = new Intl.DateTimeFormat(locale, { day: "numeric" });
  const accessibilityFormatter = new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return {
    month: monthFormatter.format(date).toUpperCase(),
    day: dayFormatter.format(date),
    accessibilityDate: accessibilityFormatter.format(date),
  };
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
