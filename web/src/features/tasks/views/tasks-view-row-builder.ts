"use client";

import {
  TRANSACTION_CHECKLIST_UI_STATUS,
  type ChecklistUiStatus,
} from "@/features/transactions/components/transaction-detail/checklist-task-row";
import type { TransactionTaskListRow } from "@/features/transactions/components/transaction-detail/transaction-task-list";
import type { GoogleCalendarEventMapped } from "@/features/calendar/types/google-calendar-event";
import type {
  TasksViewTask,
  TasksViewTaskStatus,
  TasksViewPendingTaskAction,
} from "@/features/tasks/types";

type BuildTasksViewRowsParams = {
  dayTasks: TasksViewTask[];
  openNoteId: string | null;
  editingNoteText: string;
  isUpdatingNote: boolean;
  pendingTaskActions: Record<string, TasksViewPendingTaskAction | undefined>;
  onEditTask: (task: TasksViewTask) => void;
  onToggleDontNeed: (task: TasksViewTask) => void;
  onToggleDone: (task: TasksViewTask) => void;
  onOpenNote: (task: TasksViewTask) => void;
  onRequestDeleteTask: (task: TasksViewTask) => Promise<void> | void;
  onUpdateNote: (task: TasksViewTask) => Promise<void> | void;
  onUpdateTaskDate: (task: TasksViewTask, date: Date) => Promise<void> | void;
  onCloseNote: () => void;
  onNoteTextChange: (value: string) => void;
};

function resolveUiStatus(status: TasksViewTaskStatus): ChecklistUiStatus {
  if (status === "dont-need") return TRANSACTION_CHECKLIST_UI_STATUS.DONT_NEED;
  if (status === "done") return TRANSACTION_CHECKLIST_UI_STATUS.DONE;
  return TRANSACTION_CHECKLIST_UI_STATUS.NONE;
}

export function buildTasksViewRows({
  dayTasks,
  openNoteId,
  editingNoteText,
  isUpdatingNote,
  pendingTaskActions,
  onEditTask,
  onToggleDontNeed,
  onToggleDone,
  onOpenNote,
  onRequestDeleteTask,
  onUpdateNote,
  onUpdateTaskDate,
  onCloseNote,
  onNoteTextChange,
}: BuildTasksViewRowsParams): TransactionTaskListRow[] {
  return dayTasks.map((task) => {
    const pendingTaskAction = pendingTaskActions[task.id];
    const isGoogleCalendarEvent = Boolean(task.isCalendarEvent);
    const googleLocation = isGoogleCalendarEvent
      ? (task.sourceTask as GoogleCalendarEventMapped).location?.trim() ?? ""
      : "";

    return {
      rowKey: task.id,
      task: task.sourceTask,
      uiStatus: resolveUiStatus(task.status),
      isChecklistItem:
        Boolean(task.sourceTask.fromChecklist) ||
        Boolean(task.sourceTask.checklistTaskId),
      isGoogleCalendarEvent,
      showStatusActions: !isGoogleCalendarEvent,
      isNoteOpen: openNoteId === task.id,
      editingNoteText,
      isUpdatingNote,
      isDeleting: Boolean(pendingTaskAction),
      onEditTask: () => onEditTask(task),
      onToggleDontNeed: () => onToggleDontNeed(task),
      onToggleDone: () => onToggleDone(task),
      onOpenNote: () => onOpenNote(task),
      onDeleteTask: () => {
        void onRequestDeleteTask(task);
      },
      onNoteTextChange,
      onSaveNote: () => {
        void onUpdateNote(task);
      },
      onCloseNote,
      notePlaceholder: "Add task notes...",
      titleLabel: isGoogleCalendarEvent ? googleLocation : task.property,
      isDateUpdating: pendingTaskAction === "date",
      onDateChange: (date) => {
        void onUpdateTaskDate(task, date);
      },
    };
  });
}
