import type { User } from "@/lib/auth/types";
import type { TaskListItem } from "@/features/tasks/types";

type ResolveChecklistAssigneeLabelInput = {
  task: TaskListItem;
  assigneeById: Map<string, string>;
  currentUser: User | null;
};

export function resolveChecklistAssigneeLabel({
  task,
  assigneeById,
  currentUser,
}: ResolveChecklistAssigneeLabelInput): string | undefined {
  const assignedToBase =
    (task.assignedUserId ? assigneeById.get(task.assignedUserId) : null) ??
    task.assignedTo ??
    undefined;

  if (!assignedToBase) return assignedToBase;

  const normalizedAssignedTo = assignedToBase.trim().toLowerCase();
  const currentUserFullName = [currentUser?.name, currentUser?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim()
    .toLowerCase();
  const isAssignedToCurrentUser =
    String(task.assignedUserId ?? "") === String(currentUser?.id ?? "") ||
    (Boolean(currentUser?.email) &&
      normalizedAssignedTo === currentUser?.email.trim().toLowerCase()) ||
    (Boolean(currentUserFullName) &&
      normalizedAssignedTo === currentUserFullName);

  if (isAssignedToCurrentUser && !assignedToBase.endsWith(" (You)")) {
    return `${assignedToBase} (You)`;
  }

  return assignedToBase;
}
