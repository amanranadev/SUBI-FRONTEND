export const CHECKLIST_NAME_SEPARATOR = " :: ";

export function splitChecklistTaskName(rawName?: string | null): {
  category: string | null;
  taskName: string;
} {
  const raw = (rawName ?? "").trim();
  if (!raw) {
    return { category: null, taskName: "" };
  }

  if (!raw.includes(CHECKLIST_NAME_SEPARATOR)) {
    return { category: null, taskName: raw };
  }

  const [rawCategory, ...taskNameParts] = raw.split(CHECKLIST_NAME_SEPARATOR);
  const category = rawCategory.trim() || null;
  const taskName = taskNameParts.join(CHECKLIST_NAME_SEPARATOR).trim();

  return {
    category,
    taskName: taskName || raw,
  };
}

export function getChecklistTaskDisplayName(
  rawName?: string | null,
  fallback = "Untitled Task",
): string {
  const { taskName } = splitChecklistTaskName(rawName);
  return taskName || fallback;
}
