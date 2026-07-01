import { addBusinessDaysToISODate, addDaysToISODate } from "@/shared/utils/format";

const TRIGGER_CLOSING = "closing";
const TRIGGER_MUTUAL_ACCEPTANCE = "mutual_acceptance";
const RELATIVE_DAYS_REGEX =
  /(\d+)\s+(?:(?:business|calendar)\s+)?days?\s+(?:from|after|before)\s+(.+)/i;

function parseRelativeDays(calculation: string): {
  daysOffset: number;
  dayType: "business" | "calendar";
  triggerText: string;
} | null {
  if (!calculation) return null;

  const match = calculation.match(RELATIVE_DAYS_REGEX);
  if (!match) return null;

  const days = parseInt(match[1], 10);
  const isBefore = /before/i.test(calculation);
  const triggerText = (match[2] ?? "")
    .replace(/[.,;:!?]+$/g, "")
    .trim();

  if (!triggerText) return null;

  return {
    daysOffset: isBefore ? -days : days,
    dayType: /business/i.test(calculation) ? "business" : "calendar",
    triggerText,
  };
}

export function parseCalculationTrigger(
  calculation: string,
): { daysOffset: number; dayType: "business" | "calendar"; trigger: string } | null {
  const parsed = parseRelativeDays(calculation);
  if (!parsed) return null;

  const trigger = /mutual\s*acceptance/i.test(parsed.triggerText)
    ? TRIGGER_MUTUAL_ACCEPTANCE
    : /closing/i.test(parsed.triggerText)
      ? TRIGGER_CLOSING
      : null;

  if (!trigger) return null;

  return { daysOffset: parsed.daysOffset, dayType: parsed.dayType, trigger };
}

export function parseTaskDependencyTrigger(
  calculation: string,
): { daysOffset: number; dayType: "business" | "calendar"; triggerText: string } | null {
  const parsed = parseRelativeDays(calculation);
  if (!parsed) return null;

  if (
    /closing/i.test(parsed.triggerText) ||
    /mutual\s*acceptance/i.test(parsed.triggerText)
  ) {
    return null;
  }

  return parsed;
}

export function resolveExpectedTrigger(
  fieldName: "closeDate" | "mutualAcceptanceDate",
): string {
  return fieldName === "mutualAcceptanceDate"
    ? TRIGGER_MUTUAL_ACCEPTANCE
    : TRIGGER_CLOSING;
}

export function recalculateDate(
  daysOffset: number,
  newBaseDateISO: string,
  dayType: "business" | "calendar" = "calendar",
): string {
  return dayType === "business"
    ? addBusinessDaysToISODate(newBaseDateISO, daysOffset)
    : addDaysToISODate(newBaseDateISO, daysOffset);
}
