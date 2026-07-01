"use client";

import * as React from "react";
import { format } from "date-fns";

import { deleteTask, updateTask } from "@/features/tasks/api/task-service";
import type { TaskListItem } from "@/features/tasks/types";
import { TRANSACTION_TASK_STATUS } from "@/features/transactions/types/transaction-type";
import { buildTransactionTaskPayload } from "@/features/transactions/components/transaction-detail/transaction-detail-task-helpers";
import { useToast } from "@/shared/hooks/use-toast";

type ChecklistStatus = "none" | "dont-need" | "done";

type UseTransactionChecklistTaskMutationsParams = {
  invalidateTasks: () => Promise<void>;
};

export function useTransactionChecklistTaskMutations({
  invalidateTasks,
}: UseTransactionChecklistTaskMutationsParams) {
  const { toast } = useToast();
  const [openNoteId, setOpenNoteId] = React.useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = React.useState("");
  const [isMutatingTaskId, setIsMutatingTaskId] = React.useState<string | null>(
    null,
  );

  const getTaskUiStatus = React.useCallback((task: TaskListItem): ChecklistStatus => {
    if (task.status === TRANSACTION_TASK_STATUS.SKIPPED) return "dont-need";
    if (task.completed) return "done";
    return "none";
  }, []);

  const handleOpenNoteEditor = React.useCallback(
    (task: TaskListItem) => {
      const nextTaskId = openNoteId === task.id ? null : task.id;
      setOpenNoteId(nextTaskId);
      if (!nextTaskId) return;
      setEditingNoteText(task.description ?? "");
    },
    [openNoteId],
  );

  const handleCloseNoteEditor = React.useCallback(() => {
    setOpenNoteId(null);
  }, []);

  const handleSaveNote = React.useCallback(
    async (task: TaskListItem) => {
      setIsMutatingTaskId(task.id);
      try {
        await updateTask(
          task.id,
          buildTransactionTaskPayload(task, {
            description: editingNoteText,
          }),
        );
        await invalidateTasks();
        setOpenNoteId(null);
      } catch {
        toast({
          title: "Could not save note",
          description: "Try again in a moment.",
          variant: "destructive",
        });
      } finally {
        setIsMutatingTaskId(null);
      }
    },
    [editingNoteText, invalidateTasks, toast],
  );

  const handleUpdateDueDate = React.useCallback(
    async (task: TaskListItem, date: Date) => {
      setIsMutatingTaskId(task.id);
      try {
        await updateTask(
          task.id,
          buildTransactionTaskPayload(task, {
            dueDate: format(date, "yyyy-MM-dd"),
          }),
        );
        await invalidateTasks();
      } catch {
        toast({
          title: "Could not update due date",
          description: "Try again in a moment.",
          variant: "destructive",
        });
      } finally {
        setIsMutatingTaskId(null);
      }
    },
    [invalidateTasks, toast],
  );

  const handleAssignTask = React.useCallback(
    async (task: TaskListItem, assigneeId: string | null) => {
      setIsMutatingTaskId(task.id);
      try {
        await updateTask(
          task.id,
          buildTransactionTaskPayload(task, {
            assignedUserId: assigneeId,
          }),
        );
        await invalidateTasks();
      } catch {
        toast({
          title: "Could not assign item",
          description: "Try again in a moment.",
          variant: "destructive",
        });
      } finally {
        setIsMutatingTaskId(null);
      }
    },
    [invalidateTasks, toast],
  );

  const handleSetTaskStatus = React.useCallback(
    async (task: TaskListItem, status: Exclude<ChecklistStatus, "none">) => {
      const currentStatus = getTaskUiStatus(task);
      const nextStatus: ChecklistStatus =
        currentStatus === status ? "none" : status;

      const nextCompleted = nextStatus === "done";
      const nextApiStatus =
        nextStatus === "dont-need"
          ? TRANSACTION_TASK_STATUS.SKIPPED
          : nextCompleted
            ? TRANSACTION_TASK_STATUS.COMPLETED
            : TRANSACTION_TASK_STATUS.ON_TRACK;

      setIsMutatingTaskId(task.id);
      try {
        await updateTask(
          task.id,
          buildTransactionTaskPayload(task, {
            completed: nextCompleted,
            status: nextApiStatus,
          }),
        );
        await invalidateTasks();
      } catch {
        toast({
          title: "Could not update item",
          description: "Try again in a moment.",
          variant: "destructive",
        });
      } finally {
        setIsMutatingTaskId(null);
      }
    },
    [getTaskUiStatus, invalidateTasks, toast],
  );

  const handleDeleteTask = React.useCallback(
    async (taskId: string) => {
      setIsMutatingTaskId(taskId);
      try {
        await deleteTask(taskId);
        await invalidateTasks();
        if (openNoteId === taskId) {
          setOpenNoteId(null);
        }
      } catch {
        toast({
          title: "Could not delete item",
          description: "Try again in a moment.",
          variant: "destructive",
        });
      } finally {
        setIsMutatingTaskId(null);
      }
    },
    [invalidateTasks, openNoteId, toast],
  );

  return {
    openNoteId,
    editingNoteText,
    isMutatingTaskId,
    setEditingNoteText,
    handleOpenNoteEditor,
    handleCloseNoteEditor,
    handleSaveNote,
    handleUpdateDueDate,
    handleAssignTask,
    handleSetTaskStatus,
    handleDeleteTask,
  };
}
