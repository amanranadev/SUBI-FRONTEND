export type TaskActiveStatusFilter = "all" | "open" | "skipped";

export type TaskDatePresetId =
  | "today"
  | "this_week"
  | "next_7_days"
  | "next_30_days"
  | "this_month"
  | "clear";

/** Quick preset chips (excludes programmatic `clear`). */
export type TaskQuickPresetId = Exclude<TaskDatePresetId, "clear">;

export type TaskListFilterPayload = {
  /** Custom range only — not updated when a quick preset is selected. */
  dateFrom: string;
  dateTo: string;
  /** When set, due-date filtering uses this preset; custom range is ignored until cleared. */
  quickPresetId: TaskQuickPresetId | null;
  activeStatus: TaskActiveStatusFilter;
};

export const DEFAULT_TASK_LIST_FILTERS: TaskListFilterPayload = {
  dateFrom: "",
  dateTo: "",
  quickPresetId: null,
  activeStatus: "open",
};
