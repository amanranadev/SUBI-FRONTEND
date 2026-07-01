import * as React from "react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";
import { createTask, deleteTask, updateTask } from "@/features/tasks/api/task-service";
import { TASK_QUERY_KEYS } from "@/features/tasks/constants";
import { WORKSPACE_TRANSACTIONS_QUERY_KEY } from "@/features/workspace/constants";
import {
  TRANSACTION_TASK_STATUS,
  TRANSACTION_TASK_TYPES,
} from "@/features/transactions/types/transaction-type";
import {
  applyChecklistTemplateToTransaction,
  applyChecklistToTransaction,
  createChecklistTemplateRecord,
} from "@/features/transactions/api/checklist-service";
import { buildTransactionTaskPayload } from "@/features/transactions/components/transaction-detail/transaction-detail-task-helpers";
import {
  CHECKLIST_NAME_SEPARATOR,
  splitChecklistTaskName,
} from "@/features/transactions/utils/checklist-name";
import { getCurrentISODate } from "@/shared/utils/format";
import type { TaskListItem } from "@/features/tasks/types";
import type { Transaction } from "@/features/workspace/types";
import type { ChecklistTemplate } from "@/features/transactions/api/checklist-service";

interface UseChecklistActionsProps {
  transaction: Transaction;
  checklistTasks: TaskListItem[];
  currentChecklistTemplate: ChecklistTemplate | undefined;
  setIsApplyingChecklist: (applying: boolean) => void;
}

export type ChecklistStatus = "none" | "dont-need" | "done";

export function useChecklistActions({
  transaction,
  checklistTasks,
  currentChecklistTemplate,
  setIsApplyingChecklist,
}: UseChecklistActionsProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [openNoteId, setOpenNoteId] = React.useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = React.useState("");
  const [editingNameId, setEditingNameId] = React.useState<string | null>(null);
  const [editingNameText, setEditingNameText] = React.useState("");
  const [isMutatingTaskId, setIsMutatingTaskId] = React.useState<string | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = React.useState(false);
  const [templateName, setTemplateName] = React.useState("");
  const [templateNameError, setTemplateNameError] = React.useState<string | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = React.useState(false);
  const [isCreatingChecklistItem, setIsCreatingChecklistItem] = React.useState(false);

  const invalidateTasks = React.useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: TASK_QUERY_KEYS.all,
    });
    await queryClient.invalidateQueries({
      queryKey: TASK_QUERY_KEYS.byTransaction(transaction.id),
    });
    await queryClient.invalidateQueries({
      queryKey: ["transaction-detail", transaction.id],
    });
    await queryClient.invalidateQueries({
      queryKey: WORKSPACE_TRANSACTIONS_QUERY_KEY,
    });
  }, [queryClient, transaction.id]);

  const handleOpenNoteEditor = (task: TaskListItem) => {
    const nextTaskId = openNoteId === task.id ? null : task.id;
    setOpenNoteId(nextTaskId);
    setEditingNameId(null);
    if (!nextTaskId) return;
    setEditingNoteText(task.description ?? "");
  };

  const handleStartNameEdit = (task: TaskListItem) => {
    if (isMutatingTaskId === task.id) return;
    const { taskName } = splitChecklistTaskName(task.name);
    setEditingNameId(task.id);
    setEditingNameText(taskName);
  };

  const handleCancelNameEdit = () => {
    setEditingNameId(null);
    setEditingNameText("");
  };

  const handleSaveName = async (task: TaskListItem) => {
    if (editingNameId !== task.id) return;

    const trimmedNextName = editingNameText.trim();
    if (!trimmedNextName) {
      handleCancelNameEdit();
      return;
    }

    const parsedCurrentName = splitChecklistTaskName(task.name);
    const currentTaskName = parsedCurrentName.taskName.trim();
    if (trimmedNextName === currentTaskName) {
      handleCancelNameEdit();
      return;
    }

    const nextName = parsedCurrentName.category?.trim()
      ? `${parsedCurrentName.category.trim()}${CHECKLIST_NAME_SEPARATOR}${trimmedNextName}`
      : trimmedNextName;

    setIsMutatingTaskId(task.id);
    try {
      await updateTask(
        task.id,
        buildTransactionTaskPayload(task, {
          name: nextName,
        }),
      );
      await invalidateTasks();
      handleCancelNameEdit();
    } catch {
      toast({
        title: "Could not rename item",
        description: "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsMutatingTaskId(null);
    }
  };

  const handleSaveNote = async (task: TaskListItem) => {
    setIsMutatingTaskId(task.id);
    try {
      await updateTask(
        task.id,
        buildTransactionTaskPayload(task, {
          description: editingNoteText,
        })
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
  };

  const handleUpdateDueDate = async (task: TaskListItem, date: Date) => {
    setIsMutatingTaskId(task.id);
    try {
      await updateTask(
        task.id,
        buildTransactionTaskPayload(task, {
          dueDate: format(date, "yyyy-MM-dd"),
        })
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
  };

  const handleAssignTask = async (task: TaskListItem, assigneeId: string | null) => {
    setIsMutatingTaskId(task.id);
    try {
      await updateTask(
        task.id,
        buildTransactionTaskPayload(task, {
          assignedUserId: assigneeId,
        })
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
  };

  const getTaskUiStatus = (task: TaskListItem): ChecklistStatus => {
    if (task.status === TRANSACTION_TASK_STATUS.SKIPPED) return "dont-need";
    if (task.completed) return "done";
    return "none";
  };

  const handleSetTaskStatus = async (
    task: TaskListItem,
    status: Exclude<ChecklistStatus, "none">
  ) => {
    const currentStatus = getTaskUiStatus(task);
    const nextStatus: ChecklistStatus = currentStatus === status ? "none" : status;

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
        })
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
  };

  const deleteTaskItem = async (taskId: string) => {
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
  };

  const applyChecklistById = async (checklistId: string) => {
    setIsApplyingChecklist(true);
    try {
      await applyChecklistToTransaction({
        transactionId: transaction.id,
        checklistId,
      });
      await invalidateTasks();
    } finally {
      setIsApplyingChecklist(false);
    }
  };

  const applyChecklistTemplateById = async (templateId: string) => {
    setIsApplyingChecklist(true);
    try {
      await applyChecklistTemplateToTransaction({
        transactionId: transaction.id,
        checklistTemplateId: templateId,
      });
      await invalidateTasks();
    } finally {
      setIsApplyingChecklist(false);
    }
  };

  const createChecklistItem = async ({
    groupLabel,
    itemName,
  }: {
    groupLabel: string;
    itemName: string;
  }) => {
    const trimmedItemName = itemName.trim();
    const trimmedGroupLabel = groupLabel.trim();

    if (!trimmedItemName) {
      return false;
    }

    const checklistTaskName = trimmedGroupLabel
      ? `${trimmedGroupLabel}${CHECKLIST_NAME_SEPARATOR}${trimmedItemName}`
      : trimmedItemName;
    const information = trimmedGroupLabel ? `Label: ${trimmedGroupLabel}` : "Label:";

    setIsCreatingChecklistItem(true);
    try {
      await createTask({
        name: checklistTaskName,
        description: "",
        information,
        due_date: getCurrentISODate(),
        completed: false,
        transaction_id: transaction.id,
        transaction_task_type: TRANSACTION_TASK_TYPES.TASK,
        status: TRANSACTION_TASK_STATUS.ON_TRACK,
      });
      await invalidateTasks();
      return true;
    } catch {
      toast({
        title: "Could not add item",
        description: "Try again in a moment.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsCreatingChecklistItem(false);
    }
  };

  const handleSaveChecklistAsTemplate = async () => {
    const nextTemplateName = templateName.trim();
    if (!nextTemplateName) {
      setTemplateNameError("Template name is required.");
      return;
    }

    if (checklistTasks.length === 0) {
      toast({
        title: "Checklist is empty",
        description: "Add at least one checklist item before saving template.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingTemplate(true);
    try {
      const checklistName = currentChecklistTemplate?.name ?? "Checklist";
      await createChecklistTemplateRecord({
        checklist_template: {
          name: nextTemplateName,
          checklistName: checklistName,
          description: currentChecklistTemplate?.description,
          checklist_tasks_attributes: checklistTasks.map((task, index) => {
            const parsed = splitChecklistTaskName((task.name ?? "").trim());
            const taskName =
              parsed.taskName || (task.name ?? "").trim() || "Checklist Item";
            return {
              name: parsed.category?.trim()
                ? `${parsed.category.trim()} :: ${taskName}`
                : taskName,
              days_offset: 0,
              priority: "MEDIUM",
              position: index,
            };
          }),
        },
      });

      setTemplateDialogOpen(false);
      setTemplateName("");
      setTemplateNameError(null);
      toast({
        title: "Checklist template saved",
        description: "You can now apply this template to other transactions.",
      });
    } catch {
      toast({
        title: "Could not save checklist template",
        description: "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  return {
    state: {
      openNoteId,
      editingNoteText,
      editingNameId,
      editingNameText,
      isMutatingTaskId,
      templateDialogOpen,
      templateName,
      templateNameError,
      isSavingTemplate,
      isCreatingChecklistItem,
    },
    actions: {
      setOpenNoteId,
      setEditingNoteText,
      setEditingNameText,
      setTemplateDialogOpen,
      setTemplateName,
      handleOpenNoteEditor,
      handleStartNameEdit,
      handleCancelNameEdit,
      handleSaveName,
      handleSaveNote,
      handleUpdateDueDate,
      handleAssignTask,
      handleSetTaskStatus,
      deleteTaskItem,
      applyChecklistById,
      applyChecklistTemplateById,
      createChecklistItem,
      handleSaveChecklistAsTemplate,
    },
  };
}
