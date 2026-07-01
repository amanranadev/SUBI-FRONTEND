import type { TaskListFilterPayload } from "../types/task-filters";
import { getDateRangeForPreset } from "./task-filter-date-presets";

/** Dates used for filtering (preset wins over custom range). */
export function getEffectiveFilterDates(
  filters: TaskListFilterPayload,
): { from: string; to: string } {
  if (filters.quickPresetId != null) {
    return getDateRangeForPreset(filters.quickPresetId);
  }
  return { from: filters.dateFrom, to: filters.dateTo };
}
