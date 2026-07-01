"use client";

import { CalendarDateRangePicker } from "@/shared/ui/calendar-date-range-picker";
import type { TaskQuickPresetId } from "../types/task-filters";
import { TASK_FILTER_QUICK_DATE_PRESETS } from "../utils/task-filter-date-presets";
import { TasksFilterChip } from "./tasks-filter-chip";
import { TasksFilterSectionTitle } from "./tasks-filter-section-title";

type TasksFilterDueDateSectionProps = {
  dateFrom: string;
  dateTo: string;
  quickPresetId: TaskQuickPresetId | null;
  onQuickPresetChange: (id: TaskQuickPresetId | null) => void;
  onCustomDatesChange: (from: string, to: string) => void;
};

export function TasksFilterDueDateSection({
  dateFrom,
  dateTo,
  quickPresetId,
  onQuickPresetChange,
  onCustomDatesChange,
}: TasksFilterDueDateSectionProps) {
  const hasCustomDates = Boolean(dateFrom.trim() || dateTo.trim());
  const accentCustomRange = hasCustomDates && quickPresetId == null;

  const applyPreset = (id: TaskQuickPresetId) => {
    if (quickPresetId === id) {
      onQuickPresetChange(null);
      return;
    }
    onQuickPresetChange(id);
  };

  return (
    <section className="space-y-2.5">
      <TasksFilterSectionTitle>Due date</TasksFilterSectionTitle>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {TASK_FILTER_QUICK_DATE_PRESETS.map((preset) => {
            const id = preset.id as TaskQuickPresetId;
            return (
              <TasksFilterChip
                key={preset.id}
                selected={quickPresetId === id}
                onClick={() => applyPreset(id)}
              >
                {preset.label}
              </TasksFilterChip>
            );
          })}
        </div>
        <CalendarDateRangePicker
          from={dateFrom}
          to={dateTo}
          onChange={onCustomDatesChange}
          variant="pill"
          nested
          accentSelected={accentCustomRange}
          className="w-full min-w-0"
        />
      </div>
    </section>
  );
}
