import * as React from "react";
import { format } from "date-fns";
import type { TaskListItem } from "@/features/tasks/types";
import type { Transaction } from "@/features/workspace/types";
import { TRANSACTION_TASK_STATUS } from "@/features/transactions/types/transaction-type";
import { isChecklistLinkedTask } from "@/features/transactions/components/transaction-detail/transaction-detail-task-helpers";
import {
  buildChecklistGroups,
  type ChecklistGroup,
} from "@/features/transactions/components/transaction-detail/checklist-grouping";
import type { ChecklistTemplate } from "@/features/transactions/api/checklist-service";

export type ChecklistMode = "selection" | "active";

interface UseChecklistGroupingProps {
  transaction: Transaction;
  transactionTasks: TaskListItem[];
  checklistTemplates: ChecklistTemplate[];
  isLoading: boolean;
  isFetching: boolean;
  highlightedTaskId?: string | null;
}

export function useChecklistGrouping({
  transaction,
  transactionTasks,
  checklistTemplates,
  isLoading,
  isFetching,
  highlightedTaskId,
}: UseChecklistGroupingProps) {
  const [checklistMode, setChecklistMode] = React.useState<ChecklistMode>("selection");
  const [isApplyingChecklist, setIsApplyingChecklist] = React.useState(false);
  const [openChecklistGroupIds, setOpenChecklistGroupIds] = React.useState<string[]>([]);

  const checklistCandidates = React.useMemo(
    () => transactionTasks.filter((task) => isChecklistLinkedTask(task)),
    [transactionTasks]
  );

  const checklistTasks = React.useMemo(
    () =>
      checklistCandidates.filter(
        (task) => task.status !== TRANSACTION_TASK_STATUS.SKIPPED
      ),
    [checklistCandidates]
  );

  const checklistTemplateById = React.useMemo(
    () => new Map(checklistTemplates.map((template) => [template.id, template])),
    [checklistTemplates]
  );

  const currentChecklist = React.useMemo<ChecklistGroup[]>(
    () =>
      buildChecklistGroups({
        checklistTasks,
        checklistTemplateById,
      }),
    [checklistTasks, checklistTemplateById]
  );

  const checklistTaskMap = React.useMemo(
    () => new Map(checklistTasks.map((task) => [task.id, task])),
    [checklistTasks]
  );

  const currentChecklistId = React.useMemo(
    () => checklistTasks[0]?.checklistId ?? null,
    [checklistTasks]
  );

  const currentChecklistTemplate = React.useMemo(
    () =>
      currentChecklistId
        ? checklistTemplateById.get(currentChecklistId)
        : undefined,
    [checklistTemplateById, currentChecklistId]
  );

  // Auto-mode switching logic
  React.useEffect(() => {
    if (checklistMode === "selection" && checklistTasks.length > 0) {
      setChecklistMode("active");
    }
    if (
      checklistMode === "active" &&
      checklistTasks.length === 0 &&
      !isLoading &&
      !isFetching &&
      !isApplyingChecklist
    ) {
      setChecklistMode("selection");
    }
  }, [
    checklistMode,
    checklistTasks.length,
    isApplyingChecklist,
    isFetching,
    isLoading,
  ]);

  // Scroll to highlighted task logic
  React.useEffect(() => {
    if (!highlightedTaskId) return;
    if (checklistMode !== "active") return;

    const row = document.getElementById(`checklist-task-${highlightedTaskId}`);
    if (!row) return;

    row.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [checklistMode, highlightedTaskId, checklistTasks.length]);

  // Accordion state synchronization logic
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
        (id) => !keptOpenGroupIdSet.has(id)
      );

      const nextOpenGroupIds = [...keptOpenGroupIds, ...newlyAddedGroupIds];
      const hasChanged =
        nextOpenGroupIds.length !== prev.length ||
        nextOpenGroupIds.some((id, index) => id !== prev[index]);

      return hasChanged ? nextOpenGroupIds : prev;
    });
  }, [currentChecklist]);

  return {
    checklistMode,
    setChecklistMode,
    checklistTasks,
    currentChecklist,
    checklistTaskMap,
    currentChecklistTemplate,
    openChecklistGroupIds,
    setOpenChecklistGroupIds,
    isApplyingChecklist,
    setIsApplyingChecklist,
  };
}
