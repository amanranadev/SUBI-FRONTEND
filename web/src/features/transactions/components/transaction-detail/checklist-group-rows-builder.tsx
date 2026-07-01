"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TaskListItem } from "@/features/tasks/types";
import type { TransactionTaskListRow } from "@/features/transactions/components/transaction-detail/transaction-task-list";
import { getChecklistUiStatus } from "@/features/transactions/components/transaction-detail/transaction-detail-task-helpers";
import {
  ChecklistTaskExtraActions,
  type ChecklistAssignableMember,
} from "@/features/transactions/components/transaction-detail/checklist-task-extra-actions";

export type ChecklistGroupSubtask = {
  id: string;
  label: string;
};

type BuildChecklistGroupRowsParams = {
  groupLabel: string;
  subtasks: ChecklistGroupSubtask[];
  checklistTaskMap: Map<string, TaskListItem>;
  highlightedTaskId?: string | null;
  openNoteId: string | null;
  editingNoteText: string;
  isMutatingTaskId: string | null;
  canAssignChecklistTasks: boolean;
  assignableMembers: ChecklistAssignableMember[];
  onSetTaskStatus: (task: TaskListItem, status: "dont-need" | "done") => void;
  onOpenNoteEditor: (task: TaskListItem) => void;
  onDeleteTask: (taskId: string) => void;
  onSaveNote: (task: TaskListItem) => void;
  onCloseNote: () => void;
  onNoteTextChange: (value: string) => void;
  onUpdateDueDate: (task: TaskListItem, date: Date) => void;
  onAssignTask: (task: TaskListItem, assigneeId: string | null) => void;
  resolveAssignedTo: (task: TaskListItem) => string | null;
  editingNameId: string | null;
  editingNameText: string;
  onStartNameEdit: (task: TaskListItem) => void;
  onNameTextChange: (value: string) => void;
  onSaveName: (task: TaskListItem) => void;
  onCancelNameEdit: () => void;
};

export function buildChecklistGroupRows({
  groupLabel,
  subtasks,
  checklistTaskMap,
  highlightedTaskId,
  openNoteId,
  editingNoteText,
  isMutatingTaskId,
  canAssignChecklistTasks,
  assignableMembers,
  onSetTaskStatus,
  onOpenNoteEditor,
  onDeleteTask,
  onSaveNote,
  onCloseNote,
  onNoteTextChange,
  onUpdateDueDate,
  onAssignTask,
  resolveAssignedTo,
  editingNameId,
  editingNameText,
  onStartNameEdit,
  onNameTextChange,
  onSaveName,
  onCancelNameEdit,
}: BuildChecklistGroupRowsParams): TransactionTaskListRow[] {
  return subtasks
    .map((task): TransactionTaskListRow | null => {
      const sourceTask = checklistTaskMap.get(task.id);
      if (!sourceTask) return null;

      const assignedTo = resolveAssignedTo(sourceTask);
      const isTaskMutating = isMutatingTaskId === sourceTask.id;

      return {
        rowKey: task.id,
        task: sourceTask,
        uiStatus: getChecklistUiStatus(sourceTask),
        isNoteOpen: openNoteId === task.id,
        editingNoteText,
        isUpdatingNote: isTaskMutating,
        isDeleting: isTaskMutating,
        isChecklistItem: true,
        rowId: `checklist-task-${task.id}`,
        rowClassName: cn(
          "animate-in fade-in duration-300",
          highlightedTaskId === task.id && "ring-2 ring-primary/40",
          assignedTo && "opacity-95",
          isTaskMutating && "pointer-events-none opacity-70",
        ),
        showEditButton: false,
        showDeleteButton: false,
        titleLabel: groupLabel,
        notePlaceholder: "Type your note here...",
        onEditTask: () => undefined,
        onToggleDontNeed: () => onSetTaskStatus(sourceTask, "dont-need"),
        onToggleDone: () => onSetTaskStatus(sourceTask, "done"),
        onOpenNote: () => onOpenNoteEditor(sourceTask),
        onDeleteTask: () => onDeleteTask(task.id),
        onNoteTextChange,
        onSaveNote: () => onSaveNote(sourceTask),
        onCloseNote,
        onDateChange: (date) => onUpdateDueDate(sourceTask, date),
        isDateUpdating: isTaskMutating,
        isEditingName: editingNameId === sourceTask.id,
        editingNameText,
        isUpdatingName: isTaskMutating,
        onStartNameEdit: () => onStartNameEdit(sourceTask),
        onNameTextChange,
        onSaveName: () => onSaveName(sourceTask),
        onCancelNameEdit,
        extraActions: (
          <ChecklistTaskExtraActions
            assignedTo={assignedTo}
            canAssignChecklistTasks={canAssignChecklistTasks}
            assignableMembers={assignableMembers}
            deleteLabel={task.label}
            onAssign={(assigneeId) => onAssignTask(sourceTask, assigneeId)}
            onDelete={() => onDeleteTask(task.id)}
          />
        ),
      };
    })
    .filter((row): row is TransactionTaskListRow => row !== null);
}
