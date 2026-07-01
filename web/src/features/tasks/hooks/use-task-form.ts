"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  TRANSACTION_TASK_TYPES,
  type TransactionTask,
} from "@/features/transactions/types/transaction-task";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import { dateToInputFormat } from "@/shared/utils/dateUtils";
import { parseDateToISO } from "@/shared/utils/format";
import type { TaskListItem } from "@/features/tasks/types";

const baseTaskSchema = z.object({
  name: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional().default(""),
  type: z.enum([TRANSACTION_TASK_TYPES.TASK, TRANSACTION_TASK_TYPES.FORM]),
  transactionId: z.string().optional(),
  parentTaskId: z.string().optional().default(""),
  daysAfterParent: z.coerce.number().optional(),
});

export type TaskFormData = z.infer<typeof baseTaskSchema>;

function getInitialDueDate(dueDate?: string | Date) {
  if (!dueDate) return "";
  if (dueDate instanceof Date) return dateToInputFormat(dueDate);
  return parseDateToISO(dueDate);
}

interface UseTaskFormProps {
  isOpen: boolean;
  initialData?: Partial<TransactionTask> | null;
  onSave: (task: TransactionTask) => Promise<boolean | void> | boolean | void;
  onClose: () => void;
  needToValidate?: boolean;
  showTransactionSelector?: boolean;
  availableTasks?: TaskListItem[];
}

export function useTaskForm({
  isOpen,
  initialData,
  onSave,
  onClose,
  needToValidate = true,
  showTransactionSelector = false,
  availableTasks = [],
}: UseTaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = useMemo(() => {
    if (showTransactionSelector) {
      return baseTaskSchema.extend({
        transactionId: z.string().min(1, "Property name is required"),
      });
    }
    return baseTaskSchema;
  }, [showTransactionSelector]);

  const form = useForm<TaskFormData>({
    mode: needToValidate ? "onChange" : "onSubmit",
    resolver: needToValidate ? zodResolver(validationSchema) : undefined,
    defaultValues: {
      name: "",
      description: "",
      dueDate: "",
      type: TRANSACTION_TASK_TYPES.TASK,
      transactionId: "",
      parentTaskId: "",
      daysAfterParent: 0,
    },
  });

  const parentTaskId = useWatch({ control: form.control, name: "parentTaskId" });
  const hasDependency = Boolean(parentTaskId) && parentTaskId !== "__none__";

  const parentTaskOptions = useMemo(() => {
    const currentId = initialData?.id;
    return availableTasks
      .filter((t) => t.id !== currentId && t.name)
      .map((t) => ({
        value: t.id,
        label: t.name || "Untitled",
      }));
  }, [availableTasks, initialData?.id]);

  const selectedParentName = useMemo(() => {
    if (!parentTaskId) return null;
    return availableTasks.find((t) => t.id === parentTaskId)?.name ?? null;
  }, [parentTaskId, availableTasks]);

  const { data: transactions = [], isLoading: isLoadingTransactions } =
    useTransactions();

  const handleClearDependency = useCallback(() => {
    form.setValue("parentTaskId", "__none__");
    form.setValue("daysAfterParent", 0);
  }, [form]);

  const onSubmit = async (formValues: TaskFormData) => {
    const task: Partial<TransactionTask> = {
      ...formValues,
      ...(initialData?.id && { id: initialData.id }),
      completed: initialData?.completed || false,
      transactionId: formValues.transactionId || initialData?.transactionId,
      type: initialData?.type || TRANSACTION_TASK_TYPES.TASK,
      parentTaskId:
        formValues.parentTaskId && formValues.parentTaskId !== "__none__"
          ? formValues.parentTaskId
          : null,
      daysAfterParent:
        formValues.parentTaskId && formValues.parentTaskId !== "__none__"
          ? (formValues.daysAfterParent ?? null)
          : null,
    };

    if (formValues.parentTaskId && formValues.parentTaskId !== "__none__") {
      delete (task as Record<string, unknown>).dueDate;
    }

    setIsSubmitting(true);

    try {
      const result = await onSave(task as TransactionTask);
      if (result !== false) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const hasInitialData = !!initialData && Object.keys(initialData).length > 0;

    if (hasInitialData) {
      form.reset({
        name: initialData?.name || "",
        description: initialData?.description || "",
        dueDate: getInitialDueDate(initialData?.dueDate),
        type:
          initialData?.type === TRANSACTION_TASK_TYPES.FORM
            ? TRANSACTION_TASK_TYPES.FORM
            : TRANSACTION_TASK_TYPES.TASK,
        transactionId: initialData?.transactionId || "",
        parentTaskId: initialData?.parentTaskId || "__none__",
        daysAfterParent: initialData?.daysAfterParent ?? 0,
      });
      return;
    }

    form.reset({
      name: "",
      description: "",
      dueDate: "",
      type: TRANSACTION_TASK_TYPES.TASK,
      transactionId: "",
      parentTaskId: "__none__",
      daysAfterParent: 0,
    });
  }, [form, initialData, isOpen]);

  return {
    form,
    state: {
      isSubmitting,
      isLoadingTransactions,
      hasDependency,
      parentTaskOptions,
      selectedParentName,
      transactions,
    },
    actions: {
      onSubmit: form.handleSubmit(onSubmit),
      handleClearDependency,
    },
  };
}
