"use client";

import * as React from "react";
import { isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { parseDateValue } from "@/shared/utils/dateUtils";
import { TransactionTaskList } from "@/features/transactions/components/transaction-detail/transaction-task-list";
import type { TasksViewTask, TasksViewPendingTaskAction } from "../types";
import { buildTasksViewRows } from "../views/tasks-view-row-builder";

interface TaskDayGroupProps {
  dateStr: string;
  tasks: TasksViewTask[];
  pendingTaskActions: Record<string, TasksViewPendingTaskAction | undefined>;
  openNoteId: string | null;
  editingNoteText: string;
  isUpdatingNote: boolean;
  actions: {
    handleToggleDone: (task: TasksViewTask) => void;
    handleToggleDontNeed: (task: TasksViewTask) => void;
    handleRequestDeleteTask: (task: TasksViewTask) => void;
    handleUpdateTaskDate: (task: TasksViewTask, date: Date) => void;
    handleOpenNote: (task: TasksViewTask) => void;
    setEditingNoteText: (text: string) => void;
    handleUpdateNote: (task: TasksViewTask) => void;
    handleEditTask: (task: TasksViewTask) => void;
    setOpenNoteId: (id: string | null) => void;
  };
}

export function TaskDayGroup({
  dateStr,
  tasks,
  pendingTaskActions,
  openNoteId,
  editingNoteText,
  isUpdatingNote,
  actions,
}: TaskDayGroupProps) {
  const date = parseDateValue(dateStr) ?? new Date(`${dateStr}T00:00:00`);
  const isToday = isSameDay(date, new Date());

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
      <div className="flex items-center justify-between border-b border-black/[0.03] pb-3">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 flex-col items-center justify-center rounded-2xl border transition-all duration-500",
              isToday
                ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "border-black/[0.03] bg-white dark:bg-black/20",
            )}
          >
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                isToday ? "opacity-90" : "opacity-30",
              )}
            >
              {tasks[0]?.date ? tasks[0].date.toLocaleString("default", { month: "short" }) : ""}
            </span>
            <span className="text-xl font-bold tracking-tighter leading-none">
              {tasks[0]?.date ? tasks[0].date.getDate() : ""}
            </span>
          </div>
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tighter">
              {tasks[0]?.date ? tasks[0].date.toLocaleString("default", { weekday: "long" }) : ""}
            </h2>
            <p className="text-xs font-bold opacity-30 tracking-widest uppercase">
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"} scheduled
              {isToday && (
                <span className="bg-primary/10 text-primary border-0 font-bold uppercase tracking-widest text-[9px] px-3 py-0.5 rounded-full ml-2">
                  Today
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <TransactionTaskList
          className="space-y-4"
          rows={buildTasksViewRows({
            dayTasks: tasks,
            openNoteId,
            editingNoteText,
            isUpdatingNote,
            pendingTaskActions,
            onEditTask: actions.handleEditTask,
            onToggleDontNeed: actions.handleToggleDontNeed,
            onToggleDone: actions.handleToggleDone,
            onOpenNote: actions.handleOpenNote,
            onRequestDeleteTask: actions.handleRequestDeleteTask,
            onUpdateNote: actions.handleUpdateNote,
            onUpdateTaskDate: actions.handleUpdateTaskDate,
            onCloseNote: () => actions.setOpenNoteId(null),
            onNoteTextChange: actions.setEditingNoteText,
          })}
        />
      </div>
    </div>
  );
}

interface TasksListProps {
  isLoading: boolean;
  isGoogleLoading: boolean;
  googleError: Error | null;
  groupedTaskEntries: [string, TasksViewTask[]][];
  appliedSearchTerm: string;
  pendingTaskActions: Record<string, TasksViewPendingTaskAction | undefined>;
  openNoteId: string | null;
  editingNoteText: string;
  isUpdatingNote: boolean;
  actions: {
    handleToggleDone: (task: TasksViewTask) => void;
    handleToggleDontNeed: (task: TasksViewTask) => void;
    handleRequestDeleteTask: (task: TasksViewTask) => void;
    handleUpdateTaskDate: (task: TasksViewTask, date: Date) => void;
    handleOpenNote: (task: TasksViewTask) => void;
    setEditingNoteText: (text: string) => void;
    handleUpdateNote: (task: TasksViewTask) => void;
    handleEditTask: (task: TasksViewTask) => void;
    setOpenNoteId: (id: string | null) => void;
  };
}

export function TasksList({
  isLoading,
  isGoogleLoading,
  googleError,
  groupedTaskEntries,
  appliedSearchTerm,
  pendingTaskActions,
  openNoteId,
  editingNoteText,
  isUpdatingNote,
  actions,
}: TasksListProps) {
  if (isLoading) {
    return (
      <div className="glass-card shadow-default rounded-[2rem] border-white/60 dark:border-white/10 p-8 text-sm font-medium opacity-60">
        Loading tasks...
      </div>
    );
  }

  if (groupedTaskEntries.length === 0) {
    return (
      <div className="space-y-4">
        <div className="glass-card shadow-default rounded-[2rem] border-white/60 dark:border-white/10 p-8 text-sm font-medium opacity-60">
          {appliedSearchTerm ? "No tasks match your search." : "No tasks found."}
        </div>
        {!isLoading && (
          <div className="px-2">
            {isGoogleLoading && (
              <div className="glass-card shadow-default rounded-[2rem] border-white/60 dark:border-white/10 p-5 text-sm font-medium opacity-50">
                Loading Google Calendar events...
              </div>
            )}
            {googleError && !isGoogleLoading && (
              <p className="text-xs font-medium opacity-50">
                Could not load Google Calendar events
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {groupedTaskEntries.map(([dateStr, dayTasks]) => (
        <TaskDayGroup
          key={dateStr}
          dateStr={dateStr}
          tasks={dayTasks}
          pendingTaskActions={pendingTaskActions}
          openNoteId={openNoteId}
          editingNoteText={editingNoteText}
          isUpdatingNote={isUpdatingNote}
          actions={actions}
        />
      ))}
      <div className="px-2">
        {isGoogleLoading && (
          <div className="glass-card shadow-default rounded-[2rem] border-white/60 dark:border-white/10 p-5 text-sm font-medium opacity-50">
            Loading Google Calendar events...
          </div>
        )}
        {googleError && !isGoogleLoading && (
          <p className="text-xs font-medium opacity-50">
            Could not load Google Calendar events
          </p>
        )}
      </div>
    </div>
  );
}
