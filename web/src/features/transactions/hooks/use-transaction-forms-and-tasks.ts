import { useCallback, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import type { Transaction } from "@/features/workspace/types";
import {
  createTask,
  deleteTask,
  updateTask,
} from "@/features/tasks/api/task-service";
import { TASK_QUERY_KEYS } from "@/features/tasks/constants";
import { useTransactionTasks } from "@/features/tasks/hooks/use-transaction-tasks";
import type { TaskListItem, CreateTaskDto, UpdateTaskDto } from "@/features/tasks/types";
import {
  TRANSACTION_TASK_STATUS,
  TRANSACTION_TASK_TYPES,
} from "@/features/transactions/types/transaction-type";
import { WORKSPACE_TRANSACTIONS_QUERY_KEY } from "@/features/workspace/constants";
import type TransactionTask from "@/features/transactions/types/transaction-task";
import {
  buildTransactionTaskPayload,
  getChecklistUiStatus,
  mapTransactionDetailTaskToTaskListItem,
  standaloneModalDueDateForPayload,
} from "@/features/transactions/components/transaction-detail/transaction-detail-task-helpers";
import { useToast } from "@/shared/hooks/use-toast";
import { parseDateValue } from "@/shared/utils/dateUtils";
import { CONFIRM_MODAL_VARIANT, type ConfirmModalRef } from "@/shared/ui";
import type { TransactionTaskListRow } from "@/features/transactions/components/transaction-detail/transaction-task-list";

type UseTransactionFormsAndTasksProps = {
  transaction: Transaction;
};

export function useTransactionFormsAndTasks({
  transaction,
}: UseTransactionFormsAndTasksProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: transactionTasks = [], isLoading } = useTransactionTasks({
    transactionId: transaction.id,
  });

  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [isUpdatingNote, setIsUpdatingNote] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TransactionTask | null>(null);
  const confirmModalRef = useRef<ConfirmModalRef>(null);
  const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState<string | null>(null);
  const [updatingDateTaskId, setUpdatingDateTaskId] = useState<string | null>(null);

  const tasks = useMemo(() => {
    const isChecklistTask = (task: TaskListItem) => {
      return (
        Boolean(task.fromChecklist) ||
        Boolean(task.checklistTaskId) ||
        Boolean(task.checklistId)
      );
    };

    const sourceTasks =
      transactionTasks.length > 0
        ? transactionTasks
        : (transaction.transactionTasks ?? [])
          .filter((task) => task.transactionId === transaction.id)
          .map(mapTransactionDetailTaskToTaskListItem);

    return sourceTasks
      .filter((task) => !isChecklistTask(task))
      .sort((left, right) => {
        const leftDate = parseDateValue(left.dueDate);
        const rightDate = parseDateValue(right.dueDate);

        if (!leftDate && !rightDate) return 0;
        if (!leftDate) return 1;
        if (!rightDate) return -1;

        return leftDate.getTime() - rightDate.getTime();
      });
  }, [transaction.id, transaction.transactionTasks, transactionTasks]);

  const taskTitleLabel = transaction.address?.trim() || "Transaction";

  const invalidateTasks = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
    await queryClient.invalidateQueries({
      queryKey: ["transaction-detail", transaction.id],
    });
    await queryClient.invalidateQueries({
      queryKey: WORKSPACE_TRANSACTIONS_QUERY_KEY,
    });
  }, [queryClient, transaction.id]);

  const handleToggleDone = useCallback(
    async (task: TaskListItem) => {
      const nextCompleted = !task.completed;
      try {
        await updateTask(
          task.id,
          buildTransactionTaskPayload(task, {
            completed: nextCompleted,
            status: nextCompleted
              ? TRANSACTION_TASK_STATUS.COMPLETED
              : TRANSACTION_TASK_STATUS.ON_TRACK,
          }),
        );
        await invalidateTasks();
        toast({
          title: nextCompleted ? "Marked done" : "Reopened",
          description: "Item updated successfully.",
        });
      } catch {
        toast({
          title: "Update failed",
          description: "Could not update this item.",
          variant: "destructive",
        });
      }
    },
    [invalidateTasks, toast],
  );

  const handleToggleDontNeed = useCallback(
    async (task: TaskListItem) => {
      const isSkipped = task.status === TRANSACTION_TASK_STATUS.SKIPPED;
      try {
        await updateTask(
          task.id,
          buildTransactionTaskPayload(task, {
            completed: false,
            status: isSkipped
              ? TRANSACTION_TASK_STATUS.ON_TRACK
              : TRANSACTION_TASK_STATUS.SKIPPED,
          }),
        );
        await invalidateTasks();
      } catch {
        toast({
          title: "Update failed",
          description: "Could not update this item.",
          variant: "destructive",
        });
      }
    },
    [invalidateTasks, toast],
  );

  const handleEditTask = useCallback(
    (task: TaskListItem) => {
      setEditingTask({
        id: task.id,
        name: task.name,
        description: task.description ?? "",
        information: task.information ?? "",
        completed: task.completed,
        dueDate: task.dueDate,
        transactionId: transaction.id,
        type: task.type ?? TRANSACTION_TASK_TYPES.TASK,
        parentTaskId: task.parentTaskId ?? null,
        daysAfterParent: task.daysAfterParent ?? null,
        hasChildren: task.hasChildren ?? false,
      });
      setIsModalOpen(true);
    },
    [transaction.id],
  );

  const handleSaveTask = useCallback(
    async (task: TransactionTask) => {
      try {
        const hasDependency = Boolean(task.parentTaskId);
        const payload: UpdateTaskDto = {
          name: task.name || "",
          description: task.description || "",
          information: task.information || "",
          completed: task.completed ?? false,
          transaction_id: transaction.id,
          transaction_task_type: task.type || TRANSACTION_TASK_TYPES.TASK,
          status: task.completed
            ? TRANSACTION_TASK_STATUS.COMPLETED
            : TRANSACTION_TASK_STATUS.ON_TRACK,
        };

        if (!hasDependency) {
          payload.due_date = standaloneModalDueDateForPayload(
            task.type,
            task.dueDate,
          );
        }

        if (task.parentTaskId !== undefined) {
          payload.parent_task_id = task.parentTaskId || null;
          payload.days_after_parent = task.parentTaskId ? (task.daysAfterParent ?? null) : null;
        }

        if (task.id) {
          await updateTask(task.id, payload);
        } else {
          await createTask(payload as CreateTaskDto);
        }

        await invalidateTasks();
        toast({
          title: task.id ? "Item updated" : "Item added",
          description: "Saved successfully.",
        });
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const axiosData = (err as { response?: { data?: unknown } })?.response?.data;
        console.error("[FormsAndTasks] save error:", msg, axiosData);
        toast({
          title: "Save failed",
          description: typeof axiosData === 'object' && axiosData && 'error' in axiosData
            ? String((axiosData as { error: string }).error)
            : "Could not save this item.",
          variant: "destructive",
        });
        return false;
      }
    },
    [invalidateTasks, toast, transaction.id],
  );

  const handleSaveNote = useCallback(
    async (task: TaskListItem) => {
      setIsUpdatingNote(true);
      try {
        await updateTask(
          task.id,
          buildTransactionTaskPayload(task, {
            description: editingNoteText.trim(),
          }),
        );
        await invalidateTasks();
        setOpenNoteId(null);
        toast({ title: "Note saved" });
      } catch {
        toast({
          title: "Could not save note",
          variant: "destructive",
        });
      } finally {
        setIsUpdatingNote(false);
      }
    },
    [editingNoteText, invalidateTasks, toast],
  );

  const handleDeleteTask = useCallback(
    async (taskToDelete: TaskListItem) => {
      setPendingDeleteTaskId(taskToDelete.id);
      try {
        await deleteTask(taskToDelete.id);
        if (openNoteId === taskToDelete.id) {
          setOpenNoteId(null);
        }
        await invalidateTasks();
        toast({ title: "Item deleted" });
      } catch {
        toast({
          title: "Delete failed",
          description: "Could not delete this item.",
          variant: "destructive",
        });
      } finally {
        setPendingDeleteTaskId(null);
      }
    },
    [invalidateTasks, openNoteId, toast],
  );

  const handleRequestDeleteTask = useCallback(
    async (task: TaskListItem) => {
      const confirmed =
        (await confirmModalRef.current?.confirm({
          title: "Delete item",
          description:
            "Do you want to delete this item? This action cannot be undone.",
          confirmLabel: "Delete",
          variant: CONFIRM_MODAL_VARIANT.DANGER,
        })) ?? false;

      if (!confirmed) return;
      await handleDeleteTask(task);
    },
    [handleDeleteTask],
  );

  const handleUpdateDueDate = useCallback(
    async (task: TaskListItem, date: Date) => {
      setUpdatingDateTaskId(task.id);
      try {
        await updateTask(
          task.id,
          buildTransactionTaskPayload(task, {
            dueDate: format(date, "yyyy-MM-dd"),
          }),
        );
        await invalidateTasks();
        toast({ title: "Date saved" });
      } catch {
        toast({
          title: "Date update failed",
          description: "Could not update this date.",
          variant: "destructive",
        });
      } finally {
        setUpdatingDateTaskId(null);
      }
    },
    [invalidateTasks, toast],
  );

  const taskRows = useMemo<TransactionTaskListRow[]>(
    () =>
      tasks.map((task) => {
        const canEditDateInline = !task.parentTaskId;
        return {
          rowKey: task.id,
          task,
          titleLabel: taskTitleLabel,
          uiStatus: getChecklistUiStatus(task),
          isNoteOpen: openNoteId === task.id,
          editingNoteText,
          isUpdatingNote,
          isDeleting: pendingDeleteTaskId === task.id,
          onEditTask: () => handleEditTask(task),
          onToggleDontNeed: () => void handleToggleDontNeed(task),
          onToggleDone: () => void handleToggleDone(task),
          onOpenNote: () => {
            if (openNoteId === task.id) {
              setOpenNoteId(null);
              return;
            }
            setEditingNoteText(task.description ?? "");
            setOpenNoteId(task.id);
          },
          onDeleteTask: () => {
            void handleRequestDeleteTask(task);
          },
          onNoteTextChange: setEditingNoteText,
          onSaveNote: () => void handleSaveNote(task),
          onCloseNote: () => setOpenNoteId(null),
          notePlaceholder: "Add notes...",
          onDateChange: canEditDateInline
            ? (date) => {
                void handleUpdateDueDate(task, date);
              }
            : undefined,
          isDateUpdating: updatingDateTaskId === task.id,
        };
      }),
    [
      editingNoteText,
      handleEditTask,
      handleRequestDeleteTask,
      handleSaveNote,
      handleToggleDone,
      handleToggleDontNeed,
      handleUpdateDueDate,
      isUpdatingNote,
      openNoteId,
      pendingDeleteTaskId,
      taskTitleLabel,
      tasks,
      updatingDateTaskId,
    ],
  );

  return {
    tasks,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    editingTask,
    setEditingTask,
    confirmModalRef,
    handleSaveTask,
    taskRows,
  };
}
