import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import type { Transaction } from "@/features/workspace/types";
import type { TransactionFormData } from "@/features/transactions/types";
import { TRANSACTION_STATUS } from "@/features/workspace/status";
import {
  createEmptySectionErrors,
  EMPTY_FORM,
  formatPartyNames,
  INITIAL_VERIFIED_SECTIONS,
  SECTION_VALIDATORS,
  transactionDialogSchema,
  type SectionId,
} from "./shared";
import { useEffect, useState } from "react";
import { toast } from "@/shared/hooks/use-toast";
import { parseDateToISO } from "@/shared/utils/format";
import {
  cascadeDependentTaskDates,
  recalculateTaskDate,
} from "@/features/transactions/utils/task-dependency-cascade";

type UseTransactionDialogFormArgs = {
  initialData?: TransactionFormData | null;
  isOpen: boolean;
  onSave: (
    transaction: Transaction,
    formData?: TransactionFormData,
  ) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
};

export function useTransactionDialogForm({
  initialData,
  isOpen,
  onSave,
  onOpenChange,
}: UseTransactionDialogFormArgs) {
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionDialogSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      ...EMPTY_FORM,
      ...initialData,
    },
  });

  const formData = useWatch({ control: form.control }) as TransactionFormData;

  const [verifiedSections, setVerifiedSections] = useState<
    Record<SectionId, boolean>
  >({
    ...INITIAL_VERIFIED_SECTIONS,
  });
  const [sectionErrors, setSectionErrors] = useState(createEmptySectionErrors);
  const prevIsOpenRef = React.useRef(false);

  useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;

    if (justOpened) {
      form.reset({ ...EMPTY_FORM, ...(initialData ?? {}) });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVerifiedSections({ ...INITIAL_VERIFIED_SECTIONS });
      setSectionErrors(createEmptySectionErrors());
    }
  }, [form, initialData, isOpen]);

  useEffect(() => {
    const sectionsToInvalidate = (
      Object.keys(verifiedSections) as SectionId[]
    ).reduce<Array<{ id: SectionId; errors: Record<string, string> }>>(
      (acc, id) => {
        if (!verifiedSections[id]) return acc;

        const errors = SECTION_VALIDATORS[id](formData);
        if (Object.keys(errors).length > 0) {
          acc.push({ id, errors });
        }

        return acc;
      },
      [],
    );

    if (sectionsToInvalidate.length === 0) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVerifiedSections((prev) => {
      const next = { ...prev };
      sectionsToInvalidate.forEach(({ id }) => {
        next[id] = false;
      });
      return next;
    });

    setSectionErrors((prev) => {
      const next = { ...prev };
      sectionsToInvalidate.forEach(({ id, errors }) => {
        next[id] = errors;
      });
      return next;
    });
  }, [formData, verifiedSections]);

  const toggleVerified = (id: SectionId) => {
    const validator = SECTION_VALIDATORS[id];
    const errors = validator(form.getValues());

    if (verifiedSections[id]) {
      setVerifiedSections((prev) => ({ ...prev, [id]: false }));
      setSectionErrors((prev) => ({ ...prev, [id]: {} }));
      return false;
    }

    if (Object.keys(errors).length > 0) {
      setSectionErrors((prev) => ({ ...prev, [id]: errors }));
      const firstMessage = Object.values(errors)[0];
      if (firstMessage) {
        toast({
          title: "Section has errors",
          description: firstMessage,
          variant: "destructive",
        });
      }
      return false;
    }

    setSectionErrors((prev) => ({ ...prev, [id]: {} }));
    setVerifiedSections((prev) => ({ ...prev, [id]: true }));
    return true;
  };

  const handleTaskToggle = (taskId: string) => {
    const tasks = form.getValues("tasks");
    const nextTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, isSelected: !task.isSelected } : task,
    );
    form.setValue("tasks", nextTasks, { shouldDirty: true });
  };

  const handleTaskDateChange = (taskId: string, date: string) => {
    const tasks = form.getValues("tasks");
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, date } : task,
    );
    const nextTasks = cascadeDependentTaskDates(updatedTasks, taskId);
    form.setValue("tasks", nextTasks, { shouldDirty: true });
  };

  const handleTaskNoteChange = (taskId: string, note: string) => {
    const tasks = form.getValues("tasks");
    const nextTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, note } : task,
    );
    form.setValue("tasks", nextTasks, { shouldDirty: true });
  };

  const handleChecklistIdChange = (checklistId: string | null) => {
    form.setValue("checklistId", checklistId, { shouldDirty: true });
    if (checklistId) {
      form.setValue("checklistTemplateId", null, { shouldDirty: true });
    }
  };

  const handleChecklistTemplateIdChange = (checklistTemplateId: string | null) => {
    form.setValue("checklistTemplateId", checklistTemplateId, {
      shouldDirty: true,
    });
    if (checklistTemplateId) {
      form.setValue("checklistId", null, { shouldDirty: true });
    }
  };

  const handleDateCascade = React.useCallback(
    (fieldName: "closeDate" | "mutualAcceptanceDate", newDate: string) => {
      const newDateISO = parseDateToISO(newDate);
      if (!newDateISO) return;

      const tasks = form.getValues("tasks");
      if (!tasks?.length) return;

      const changedTaskIds: string[] = [];
      const baseRecalculatedTasks = tasks.map((task) => {
        const updated = recalculateTaskDate(task, fieldName, newDateISO);
        if (updated !== task) changedTaskIds.push(task.id);
        return updated;
      });

      if (changedTaskIds.length > 0) {
        let nextTasks = baseRecalculatedTasks;
        for (const taskId of changedTaskIds) {
          nextTasks = cascadeDependentTaskDates(nextTasks, taskId);
        }
        form.setValue("tasks", nextTasks, {
          shouldDirty: true,
          shouldValidate: false,
        });
      }
    },
    [form],
  );

  const allVerified = Object.values(verifiedSections).every(Boolean);

  const handleSave = () => {
    if (!allVerified) return;

    const values = form.getValues();

    onSave(
      {
        id: Date.now().toString(),
        address: values.address,
        price: values.price,
        status: TRANSACTION_STATUS.PENDING_INSPECTION,
        date: values.closeDate,
        buyers: formatPartyNames(values.buyers),
        sellers: formatPartyNames(values.sellers),
        buyerAgent: values.buyerAgent,
        sellerAgent: values.sellerAgent,
        parcelNumber: values.parcelNumber,
        mutualAcceptanceDate: values.mutualAcceptanceDate,
        progress: 0,
        hasTasks: false,
      },
      values,
    );

    setVerifiedSections({ ...INITIAL_VERIFIED_SECTIONS });
    setSectionErrors(createEmptySectionErrors());
  };

  const handleDiscard = () => {
    onOpenChange(false);
    setVerifiedSections({ ...INITIAL_VERIFIED_SECTIONS });
    setSectionErrors(createEmptySectionErrors());
  };

  return {
    form,
    formData,
    verifiedSections,
    sectionErrors,
    allVerified,
    handleSave,
    handleDiscard,
    handleTaskToggle,
    handleTaskDateChange,
    handleTaskNoteChange,
    handleChecklistIdChange,
    handleChecklistTemplateIdChange,
    handleDateCascade,
    toggleVerified,
  };
}
