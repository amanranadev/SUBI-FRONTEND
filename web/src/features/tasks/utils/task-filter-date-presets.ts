import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { TaskDatePresetId } from "../types/task-filters";

export type TaskFilterDatePreset = {
  id: TaskDatePresetId;
  label: string;
};

export const TASK_FILTER_DATE_PRESETS: TaskFilterDatePreset[] = [
  { id: "today", label: "Today" },
  { id: "this_week", label: "This week" },
  { id: "next_7_days", label: "Next 7 days" },
  { id: "next_30_days", label: "Next 30 days" },
  { id: "this_month", label: "This month" },
  { id: "clear", label: "Any date" },
];

/** Presets shown as quick chips in the tasks filter (custom range handles clearing). */
export const TASK_FILTER_QUICK_DATE_PRESETS: TaskFilterDatePreset[] =
  TASK_FILTER_DATE_PRESETS.filter((p) => p.id !== "clear");

const WEEK_OPTIONS = { weekStartsOn: 1 as const };

function toRangeStrings(from: Date, to: Date) {
  return {
    from: format(startOfDay(from), "yyyy-MM-dd"),
    to: format(startOfDay(to), "yyyy-MM-dd"),
  };
}

export function getDateRangeForPreset(presetId: TaskDatePresetId): {
  from: string;
  to: string;
} {
  const today = new Date();

  switch (presetId) {
    case "today":
      return toRangeStrings(startOfDay(today), endOfDay(today));
    case "this_week": {
      const start = startOfWeek(today, WEEK_OPTIONS);
      const end = endOfWeek(today, WEEK_OPTIONS);
      return toRangeStrings(start, end);
    }
    case "next_7_days":
      return toRangeStrings(today, addDays(today, 6));
    case "next_30_days":
      return toRangeStrings(today, addDays(today, 29));
    case "this_month":
      return toRangeStrings(startOfMonth(today), endOfMonth(today));
    case "clear":
    default:
      return { from: "", to: "" };
  }
}
