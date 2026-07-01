import { CHECKLIST_NAME_SEPARATOR } from "@/features/transactions/utils/checklist-name";

export type ChecklistDraftItem = {
  category?: string;
  task: string;
};

export type ChecklistTemplateSaveDraft = {
  checklistName: string;
  description?: string;
  items: ChecklistDraftItem[];
};

export function buildTemplateTaskName(task: ChecklistDraftItem): string {
  const category = task.category?.trim();
  const label = task.task.trim();
  if (!category) return label;
  return `${category}${CHECKLIST_NAME_SEPARATOR}${label}`;
}
