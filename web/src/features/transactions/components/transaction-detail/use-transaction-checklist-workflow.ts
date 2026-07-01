"use client";

import * as React from "react";

import {
  applyChecklistTemplateToTransaction,
  applyChecklistToTransaction,
} from "@/features/transactions/api/checklist-service";
import type { ChecklistGroup } from "@/features/transactions/components/transaction-detail/checklist-grouping";

type UseTransactionChecklistWorkflowParams = {
  transactionId: string;
  checklistTasksLength: number;
  isLoading: boolean;
  isFetching: boolean;
  currentChecklist: ChecklistGroup[];
  highlightedTaskId?: string | null;
  invalidateTasks: () => Promise<void>;
};

export function useTransactionChecklistWorkflow({
  transactionId,
  checklistTasksLength,
  isLoading,
  isFetching,
  currentChecklist,
  highlightedTaskId,
  invalidateTasks,
}: UseTransactionChecklistWorkflowParams) {
  const [checklistMode, setChecklistMode] = React.useState<
    "selection" | "active"
  >("selection");
  const [openChecklistGroupIds, setOpenChecklistGroupIds] = React.useState<
    string[]
  >([]);
  const [isApplyingChecklist, setIsApplyingChecklist] = React.useState(false);

  React.useEffect(() => {
    if (checklistMode === "selection" && checklistTasksLength > 0) {
      setChecklistMode("active");
    }
    if (
      checklistMode === "active" &&
      checklistTasksLength === 0 &&
      !isLoading &&
      !isFetching &&
      !isApplyingChecklist
    ) {
      setChecklistMode("selection");
    }
  }, [
    checklistMode,
    checklistTasksLength,
    isApplyingChecklist,
    isFetching,
    isLoading,
  ]);

  React.useEffect(() => {
    if (!highlightedTaskId) return;
    if (checklistMode !== "active") return;

    const row = document.getElementById(`checklist-task-${highlightedTaskId}`);
    if (!row) return;

    row.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [checklistMode, highlightedTaskId, checklistTasksLength]);

  React.useEffect(() => {
    setOpenChecklistGroupIds((prev) => {
      if (currentChecklist.length === 0) {
        return prev.length === 0 ? prev : [];
      }

      const currentGroupIds = currentChecklist.map((group) => group.id);
      const currentGroupIdSet = new Set(currentGroupIds);
      const keptOpenGroupIds = prev.filter((id) => currentGroupIdSet.has(id));
      const keptOpenGroupIdSet = new Set(keptOpenGroupIds);
      const newlyAddedGroupIds = currentGroupIds.filter(
        (id) => !keptOpenGroupIdSet.has(id),
      );

      const nextOpenGroupIds = [...keptOpenGroupIds, ...newlyAddedGroupIds];
      const hasChanged =
        nextOpenGroupIds.length !== prev.length ||
        nextOpenGroupIds.some((id, index) => id !== prev[index]);

      return hasChanged ? nextOpenGroupIds : prev;
    });
  }, [currentChecklist]);

  const applyChecklistById = React.useCallback(
    async (checklistId: string) => {
      setIsApplyingChecklist(true);
      try {
        await applyChecklistToTransaction({
          transactionId,
          checklistId,
        });
        await invalidateTasks();
        setChecklistMode("active");
      } finally {
        setIsApplyingChecklist(false);
      }
    },
    [invalidateTasks, transactionId],
  );

  const applyChecklistTemplateById = React.useCallback(
    async (templateId: string) => {
      setIsApplyingChecklist(true);
      try {
        await applyChecklistTemplateToTransaction({
          transactionId,
          checklistTemplateId: templateId,
        });
        await invalidateTasks();
        setChecklistMode("active");
      } finally {
        setIsApplyingChecklist(false);
      }
    },
    [invalidateTasks, transactionId],
  );

  return {
    checklistMode,
    openChecklistGroupIds,
    setOpenChecklistGroupIds,
    applyChecklistById,
    applyChecklistTemplateById,
  };
}
