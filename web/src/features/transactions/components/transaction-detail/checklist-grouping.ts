import type { TaskListItem } from "@/features/tasks/types";
import type { ChecklistTemplate } from "@/features/transactions/api/checklist-service";
import { splitChecklistTaskName } from "@/features/transactions/utils/checklist-name";

export type ChecklistGroup = {
  id: string;
  label: string;
  subtasks: Array<{ id: string; label: string }>;
};

export const DEFAULT_CHECKLIST_GROUP_LABEL = "Checklist Items";

export const CHECKLIST_SECTION_ORDER: Record<string, number> = {
  "initial listing & agency": 0,
  "marketing & property access": 1,
  "offer & contract management": 2,
};

function deriveCategoryFromTaskName(taskName: string): string | null {
  const normalized = taskName.trim();
  if (!normalized) return null;

  const dottedMatch = normalized.match(/^(\d+)\.\d+(?:\.\d+)*$/);
  return dottedMatch?.[1] ?? null;
}

export function buildChecklistGroups(params: {
  checklistTasks: TaskListItem[];
  checklistTemplateById: Map<string, ChecklistTemplate>;
}): ChecklistGroup[] {
  const { checklistTasks, checklistTemplateById } = params;
  if (checklistTasks.length === 0) return [];

  const groups = new Map<string, ChecklistGroup>();

  checklistTasks.forEach((task) => {
    const rawTaskName = (task.name ?? "").trim();
    const { category, taskName } = splitChecklistTaskName(rawTaskName);
    const taskLabelCategory = (task.label ?? "").trim() || null;
    const inferredCategory = !category ? deriveCategoryFromTaskName(taskName || rawTaskName) : null;
    const taskChecklistName =
      (task.checklistId ? checklistTemplateById.get(task.checklistId)?.name : undefined) ??
      DEFAULT_CHECKLIST_GROUP_LABEL;
    const groupLabel = category ?? taskLabelCategory ?? inferredCategory ?? taskChecklistName;
    const taskLabel = taskName || rawTaskName || "Checklist Item";

    if (!groups.has(groupLabel)) {
      groups.set(groupLabel, {
        id: `group-${groupLabel.toLowerCase().replaceAll(" ", "-")}`,
        label: groupLabel,
        subtasks: [],
      });
    }

    groups.get(groupLabel)?.subtasks.push({
      id: task.id,
      label: taskLabel,
    });
  });

  return Array.from(groups.values()).sort((left, right) => {
    const leftOrder =
      CHECKLIST_SECTION_ORDER[left.label.trim().toLowerCase()] ??
      Number.MAX_SAFE_INTEGER;
    const rightOrder =
      CHECKLIST_SECTION_ORDER[right.label.trim().toLowerCase()] ??
      Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    return left.label.localeCompare(right.label);
  });
}
