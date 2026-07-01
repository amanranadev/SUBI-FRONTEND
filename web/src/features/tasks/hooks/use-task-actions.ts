"use client";

import * as React from "react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";
import {
  deleteTask,
  updateTask,
  createTask,
} from "@/features/tasks/api/task-service";
import { TASK_QUERY_KEYS } from "@/features/tasks/constants";
import { WORKSPACE_TRANSACTIONS_QUERY_KEY } from "@/features/workspace/constants";
import { useDeleteGoogleCalendarEvent } from "@/features/calendar/hooks/use-delete-google-calendar-event";
import { useUpdateGoogleCalendarEvent } from "@/features/calendar/hooks/use-update-google-calendar-event";
import { isGoogleCalendarTask } from "@/features/calendar/utils/is-google-calendar-task";
import {
  buildGoogleEventNotePayload,
  buildGoogleEventUpdatePayload,
} from "@/features/calendar/utils/build-google-event-update-payload";
import { applyTaskSkipMarker } from "@/features/tasks/utils/task-skip-marker";
import { TRANSACTION_TASK_TYPES } from "@/features/transactions/types/transaction-task";
import { TRANSACTION_TASK_STATUS } from "@/features/transactions/types/transaction-type";
import type { TransactionTask } from "@/features/transactions/types/transaction-task";
import type {
  TaskListItem,
  TasksViewTask,
  TasksViewPendingTaskAction,
} from "@/features/tasks/types";
import type { GoogleCalendarEventMapped } from "@/features/calendar/types/google-calendar-event";
import { TaskMapper } from "@/features/tasks/api/task-mapper";


interface UseTaskActionsProps {
  taskDetailsById: Map<string, TaskListItem | GoogleCalendarEventMapped>;
  openNoteId: string | null;
  setOpenNoteId: (id: string | null) => void;
  editingNoteText: string;
  setEditingNoteText: (text: string) => void;
  setStatusOverride: (taskId: string, status?: any) => void;
  setNoteOverride: (taskId: string, note: string) => void;
  clearNoteOverride: (taskId: string) => void;
}

export function useTaskActions({
  taskDetailsById,
  openNoteId,
  setOpenNoteId,
  editingNoteText,
  setEditingNoteText,
  setStatusOverride,
  setNoteOverride,
  clearNoteOverride,
}: UseTaskActionsProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { deleteGoogleEvent } = useDeleteGoogleCalendarEvent();
  const { updateGoogleEvent } = useUpdateGoogleCalendarEvent();

  const [pendingTaskActions, setPendingTaskActions] = React.useState<
    Record<string, TasksViewPendingTaskAction | undefined>
  >({});
  const [isUpdatingNote, setIsUpdatingNote] = React.useState(false);

  const invalidateTasks = React.useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: TASK_QUERY_KEYS.all,
    });
    await queryClient.invalidateQueries({
      queryKey: ["transaction-detail"],
    });
    await queryClient.invalidateQueries({
      queryKey: WORKSPACE_TRANSACTIONS_QUERY_KEY,
    });
  }, [queryClient]);

  const setTaskPendingAction = React.useCallback(
    (taskId: string, action?: TasksViewPendingTaskAction) => {
      setPendingTaskActions((prev) => {
        if (!action) {
          if (!prev[taskId]) return prev;
          const next = { ...prev };
          delete next[taskId];
          return next;
        }
        return { ...prev, [taskId]: action };
      });
    },
    [],
  );


  const handleToggleDone = async (task: TasksViewTask) => {
    const sourceTask = taskDetailsById.get(task.id);
    if (!sourceTask) {
      toast({
        title: "Task unavailable",
        description: "Could not load the latest task details.",
        variant: "destructive",
      });
      return;
    }

    const nextCompleted = !sourceTask.completed;
    setTaskPendingAction(task.id, "done");

    try {
      await updateTask(
        task.id,
        TaskMapper.toPayload(sourceTask, {
          completed: nextCompleted,
          status: nextCompleted
            ? TRANSACTION_TASK_STATUS.COMPLETED
            : TRANSACTION_TASK_STATUS.ON_TRACK,
        }),
      );
      setStatusOverride(task.id);
      await invalidateTasks();
      toast({
        title: nextCompleted ? "Task completed" : "Task reopened",
      });
    } catch {
      toast({
        title: "Update failed",
        description: "Unable to update the task status right now.",
        variant: "destructive",
      });
    } finally {
      setTaskPendingAction(task.id);
    }
  };

  const handleToggleDontNeed = async (task: TasksViewTask) => {
    const sourceTask = taskDetailsById.get(task.id);
    if (!sourceTask) {
      toast({
        title: "Task unavailable",
        description: "Could not load the latest task details.",
        variant: "destructive",
      });
      return;
    }
    if (isGoogleCalendarTask(sourceTask)) {
      toast({
        title: "Action unavailable",
        description: "Skipping Google Calendar tasks is not supported.",
        variant: "destructive",
      });
      return;
    }

    const nextIsSkipped = sourceTask.status !== TRANSACTION_TASK_STATUS.SKIPPED;
    setTaskPendingAction(task.id, "dont-need");

    try {
      await updateTask(
        task.id,
        TaskMapper.toPayload(sourceTask, {
          completed: false,
          skipped: nextIsSkipped,
          status: nextIsSkipped
            ? TRANSACTION_TASK_STATUS.SKIPPED
            : TRANSACTION_TASK_STATUS.ON_TRACK,
        }),
      );
      setStatusOverride(task.id);
      await invalidateTasks();
      if (openNoteId === task.id) setOpenNoteId(null);
      toast({
        title: nextIsSkipped ? "Task skipped" : "Task reopened",
      });
    } catch {
      toast({
        title: "Update failed",
        description: "Unable to update the task status right now.",
        variant: "destructive",
      });
    } finally {
      setTaskPendingAction(task.id);
    }
  };

  const handleUpdateTaskDate = async (task: TasksViewTask, nextDate: Date) => {
    const sourceTask = taskDetailsById.get(task.id);
    if (!sourceTask) {
      toast({
        title: "Task unavailable",
        description: "Could not load the latest task details.",
        variant: "destructive",
      });
      return;
    }

    const nextDueDate = format(nextDate, "yyyy-MM-dd");
    setTaskPendingAction(task.id, "date");

    try {
      if (isGoogleCalendarTask(sourceTask)) {
        const updated = await updateGoogleEvent({
          eventId: sourceTask.googleEventId,
          payload: buildGoogleEventUpdatePayload(sourceTask, {
            dueDate: nextDueDate,
          }),
        });
        if (!updated) {
          toast({
            title: "Date update failed",
            description: "Unable to update the Google Calendar task date.",
            variant: "destructive",
          });
          return;
        }
      } else {
        await updateTask(
          task.id,
          TaskMapper.toPayload(sourceTask, { dueDate: nextDueDate }),
        );
      }
      await invalidateTasks();
      toast({ title: "Date updated" });
    } catch {
      toast({
        title: "Date update failed",
        description: "Unable to save the task date right now.",
        variant: "destructive",
      });
    } finally {
      setTaskPendingAction(task.id);
    }
  };

  const handleDeleteTask = async (task: TasksViewTask) => {
    setTaskPendingAction(task.id, "delete");
    try {
      if (task.isCalendarEvent) {
        const sourceTask = task.sourceTask;
        if (isGoogleCalendarTask(sourceTask)) {
          const deleted = await deleteGoogleEvent(sourceTask.googleEventId);
          if (!deleted) {
            toast({
              title: "Delete failed",
              description: "Unable to delete the task right now.",
              variant: "destructive",
            });
            return;
          }
        }
      } else {
        await deleteTask(task.id);
      }
      clearNoteOverride(task.id);
      setStatusOverride(task.id);
      if (openNoteId === task.id) setOpenNoteId(null);
      await invalidateTasks();
      toast({ title: "Task deleted" });
    } catch {
      toast({
        title: "Delete failed",
        description: "Unable to delete the task right now.",
        variant: "destructive",
      });
    } finally {
      setTaskPendingAction(task.id);
    }
  };

  const handleUpdateNote = async (task: TasksViewTask) => {
    const nextNote = editingNoteText.trim();
    setIsUpdatingNote(true);
    try {
      const sourceTask = task.sourceTask;
      if (isGoogleCalendarTask(sourceTask)) {
        const updated = await updateGoogleEvent({
          eventId: sourceTask.googleEventId,
          payload: buildGoogleEventNotePayload(nextNote),
        });
        if (!updated) {
          toast({
            title: "Update failed",
            description: "Unable to update the Google Calendar task note.",
            variant: "destructive",
          });
          return;
        }
      } else {
        await updateTask(
          task.id,
          TaskMapper.toPayload(sourceTask, { description: nextNote }),
        );
      }
      setNoteOverride(task.id, nextNote);
      await invalidateTasks();
      if (openNoteId === task.id) setOpenNoteId(null);
      toast({ title: "Note updated" });
    } catch {
      toast({
        title: "Update failed",
        description: "Unable to update the task note right now.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingNote(false);
    }
  };

  const handleSaveTask = async (task: TransactionTask) => {
    const sourceTask = task.id ? taskDetailsById.get(task.id) : undefined;
    const googleSourceTask =
      sourceTask && isGoogleCalendarTask(sourceTask) ? sourceTask : null;

    try {
      if (googleSourceTask) {
        const payload = buildGoogleEventUpdatePayload(googleSourceTask, {
          name: task.name ?? "",
          description: task.description ?? "",
          dueDate: typeof task.dueDate === "string" ? task.dueDate : undefined,
        });
        if (Object.keys(payload).length > 0) {
          const updated = await updateGoogleEvent({
            eventId: googleSourceTask.googleEventId,
            payload,
          });
          if (!updated) {
            toast({
              title: "Save failed",
              description:
                "Unable to update this Google Calendar event right now.",
              variant: "destructive",
            });
            return false;
          }
        }
      } else {
        const completed = sourceTask?.completed ?? task.completed ?? false;
        
        if (task.id) {
          const payload = TaskMapper.toPayload(
            {
              ...task,
              id: task.id,
              completed,
              status: sourceTask?.status,
            } as any,
            {
              completed,
              description: task.description || "",
              name: task.name || "",
              skipped: sourceTask?.status === TRANSACTION_TASK_STATUS.SKIPPED,
              parentTaskId: task.parentTaskId || null,
              daysAfterParent: task.daysAfterParent ?? null,
            },
          );
          await updateTask(task.id, payload);
        } else {
          if (!task.transactionId) return false;
          const payload = TaskMapper.toCreatePayload({
            name: task.name || "",
            description: task.description || "",
            completed,
            transaction_id: task.transactionId,
            transaction_task_type: String(task.type || TRANSACTION_TASK_TYPES.TASK),
            status: TRANSACTION_TASK_STATUS.ON_TRACK,
            parent_task_id: task.parentTaskId || null,
            days_after_parent: task.daysAfterParent ?? null,
          });
          await createTask(payload);
        }
      }

      await invalidateTasks();
      toast({ title: task.id ? "Task updated" : "Task saved" });
      return true;
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
      return false;
    }
  };

  return {
    state: {
      pendingTaskActions,
      isUpdatingNote,
    },
    actions: {
      handleToggleDone,
      handleToggleDontNeed,
      handleUpdateTaskDate,
      handleDeleteTask,
      handleUpdateNote,
      handleSaveTask,
      invalidateTasks,
    },
  };
}
