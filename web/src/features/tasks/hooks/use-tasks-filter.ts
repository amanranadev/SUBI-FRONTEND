"use client";

import * as React from "react";
import { format, startOfDay } from "date-fns";
import { isGoogleCalendarTask } from "@/features/calendar/utils/is-google-calendar-task";
import { getChecklistTaskDisplayName } from "@/features/transactions/utils/checklist-name";
import { TRANSACTION_TASK_STATUS } from "@/features/transactions/types/transaction-type";
import { parseDateValue } from "@/shared/utils/dateUtils";
import type { TaskListItem, TasksViewTask, TasksViewTaskStatus } from "../types";
import type { TaskListFilterPayload } from "../types/task-filters";
import { DEFAULT_TASK_LIST_FILTERS } from "../types/task-filters";
import { getEffectiveFilterDates } from "../utils/task-filter-effective-dates";

export type TaskFilterMode = "active" | "completed";

interface UseTasksFilterProps {
  backendTasks: TaskListItem[];
  transactionNamesById: Map<string, string>;
}

function normalizeRangeBounds(fromStr: string, toStr: string) {
  const fromDate = fromStr ? parseDateValue(fromStr) : undefined;
  const toDate = toStr ? parseDateValue(toStr) : undefined;
  if (fromDate && toDate && startOfDay(fromDate) > startOfDay(toDate)) {
    return { from: toDate, to: fromDate };
  }
  return { from: fromDate, to: toDate };
}

function taskMatchesDateRange(
  task: TasksViewTask,
  dateFromStr: string,
  dateToStr: string,
): boolean {
  if (!dateFromStr.trim() && !dateToStr.trim()) return true;

  const due = parseDateValue(task.sourceTask.dueDate ?? null);
  if (!due) return false;

  const { from, to } = normalizeRangeBounds(
    dateFromStr.trim(),
    dateToStr.trim(),
  );
  const taskDay = startOfDay(due).getTime();
  if (from !== undefined && taskDay < startOfDay(from).getTime()) return false;
  if (to !== undefined && taskDay > startOfDay(to).getTime()) return false;
  return true;
}

function listFiltersEqual(a: TaskListFilterPayload, b: TaskListFilterPayload) {
  return (
    a.dateFrom === b.dateFrom &&
    a.dateTo === b.dateTo &&
    a.quickPresetId === b.quickPresetId &&
    a.activeStatus === b.activeStatus
  );
}

function mapTaskToGlobalTask(
  task: TaskListItem,
  transactionNamesById: Map<string, string>,
): TasksViewTask {
  const googleTask = isGoogleCalendarTask(task) ? task : null;
  const taskDate =
    parseDateValue(task.dueDate) ??
    parseDateValue(task.createdAt) ??
    new Date();
  const property =
    (task.transactionId && transactionNamesById.get(task.transactionId)) ||
    task.transactionId ||
    "Unknown Property";

  return {
    id: task.id,
    sourceTask: task,
    property,
    title: getChecklistTaskDisplayName(task.name),
    name: getChecklistTaskDisplayName(task.name),
    date: taskDate,
    status: task.completed
      ? "done"
      : task.status === TRANSACTION_TASK_STATUS.SKIPPED
        ? "dont-need"
        : "none",
    completed: task.completed,
    note: task.description || undefined,
    description: task.description,
    information: task.information || undefined,
    transactionId: task.transactionId,
    dueDate: task.dueDate,
    type: task.type,
    isCalendarEvent: googleTask?.isCalendarEvent ?? false,
    googleEventId: googleTask?.googleEventId,
    allDay: googleTask?.allDay ?? false,
  };
}

export function useTasksFilter({
  backendTasks,
  transactionNamesById,
}: UseTasksFilterProps) {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchInputValue, setSearchInputValue] = React.useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = React.useState("");
  const [taskFilterMode, setTaskFilterMode] =
    React.useState<TaskFilterMode>("active");
  const [listFilters, setListFilters] = React.useState<TaskListFilterPayload>(
    () => ({ ...DEFAULT_TASK_LIST_FILTERS }),
  );

  const [taskStatusOverrides, setTaskStatusOverrides] = React.useState<
    Record<string, TasksViewTaskStatus>
  >({});
  const [taskNoteOverrides, setTaskNoteOverrides] = React.useState<
    Record<string, string>
  >({});

  const applyTaskFilters = React.useCallback((next: TaskListFilterPayload) => {
    setListFilters(next);
  }, []);

  const tasks = React.useMemo(() => {
    const mappedBackendTasks = backendTasks.map((task) =>
      mapTaskToGlobalTask(task, transactionNamesById),
    );

    const combinedTasks = mappedBackendTasks.map((task) => ({
      ...task,
      status: taskStatusOverrides[task.id] ?? task.status,
      note: taskNoteOverrides[task.id] ?? task.note,
    }));

    return combinedTasks.sort(
      (left, right) => left.date.getTime() - right.date.getTime(),
    );
  }, [
    backendTasks,
    taskStatusOverrides,
    taskNoteOverrides,
    transactionNamesById,
  ]);

  const filteredTasks = React.useMemo(() => {
    const normalizedSearchTerm = appliedSearchTerm.trim().toLowerCase();
    const { activeStatus } = listFilters;
    const { from: effFrom, to: effTo } = getEffectiveFilterDates(listFilters);

    const visibleTasks = tasks.filter((task) => {
      if (!taskMatchesDateRange(task, effFrom, effTo)) {
        return false;
      }

      if (taskFilterMode === "completed") {
        return task.status === "done";
      }

      if (task.status === "done") return false;

      if (activeStatus === "open" && task.status !== "none") return false;
      if (activeStatus === "skipped" && task.status !== "dont-need")
        return false;

      return true;
    });

    if (!normalizedSearchTerm) {
      return visibleTasks;
    }

    return visibleTasks.filter((task) =>
      [task.title, task.note].some((value) =>
        value?.toLowerCase().includes(normalizedSearchTerm),
      ),
    );
  }, [
    appliedSearchTerm,
    listFilters,
    taskFilterMode,
    tasks,
  ]);

  const groupedTaskEntries = React.useMemo(() => {
    const groups = filteredTasks.reduce(
      (taskGroups, task) => {
        const dateKey = format(task.date, "yyyy-MM-dd");
        if (!taskGroups[dateKey]) {
          taskGroups[dateKey] = [];
        }
        taskGroups[dateKey].push(task);
        return taskGroups;
      },
      {} as Record<string, TasksViewTask[]>,
    );

    return Object.entries(groups).sort(
      ([left], [right]) => new Date(left).getTime() - new Date(right).getTime(),
    );
  }, [filteredTasks]);

  const hasActiveFilters = React.useMemo(() => {
    const { from, to } = getEffectiveFilterDates(listFilters);
    const datesActive = Boolean(from.trim() || to.trim());
    if (taskFilterMode === "completed") {
      return datesActive;
    }
    return !listFiltersEqual(listFilters, DEFAULT_TASK_LIST_FILTERS);
  }, [listFilters, taskFilterMode]);

  const toggleSearch = React.useCallback(() => {
    if (isSearchOpen) {
      setSearchInputValue("");
      setAppliedSearchTerm("");
    }
    setIsSearchOpen((prev) => !prev);
  }, [isSearchOpen]);

  const applySearchTerm = React.useCallback((term: string) => {
    const next = term.trim();
    setSearchInputValue(next);
    setAppliedSearchTerm(next);
  }, []);

  const setStatusOverride = React.useCallback(
    (taskId: string, status?: TasksViewTaskStatus) => {
      setTaskStatusOverrides((prev) => {
        if (!status) {
          if (!prev[taskId]) return prev;
          const next = { ...prev };
          delete next[taskId];
          return next;
        }
        return { ...prev, [taskId]: status };
      });
    },
    [],
  );

  const setNoteOverride = React.useCallback((taskId: string, note: string) => {
    setTaskNoteOverrides((prev) => ({ ...prev, [taskId]: note }));
  }, []);

  const clearNoteOverride = React.useCallback((taskId: string) => {
    setTaskNoteOverrides((prev) => {
      if (!prev[taskId]) return prev;
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  }, []);

  return {
    filteredTasks,
    groupedTaskEntries,
    state: {
      isSearchOpen,
      searchInputValue,
      appliedSearchTerm,
      taskFilterMode,
      listFilters,
      hasActiveFilters,
    },
    overrides: {
      taskStatusOverrides,
      taskNoteOverrides,
    },
    actions: {
      setIsSearchOpen,
      setSearchInputValue,
      setTaskFilterMode,
      toggleSearch,
      applySearchTerm,
      setStatusOverride,
      setNoteOverride,
      clearNoteOverride,
      applyTaskFilters,
    },
  };
}
