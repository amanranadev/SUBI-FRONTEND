"use client";

import type { TaskListItem } from "@/features/tasks/types";
import type { TransactionDetailTask } from "@/features/workspace/types";
import {
  TRANSACTION_TASK_STATUS,
  TRANSACTION_TASK_TYPES,
} from "@/features/transactions/types/transaction-type";
import {
  TRANSACTION_CHECKLIST_UI_STATUS,
  type ChecklistUiStatus,
} from "@/features/transactions/components/transaction-detail/checklist-task-row";
import { splitChecklistTaskName } from "@/features/transactions/utils/checklist-name";
import { dateToInputFormat } from "@/shared/utils/dateUtils";
import { getCurrentISODate } from "@/shared/utils/format";

type TaskPayloadOverrides = Partial<{
  completed: boolean;
  description: string;
  information: string;
  name: string;
  status: string;
  assignedUserId: string | null;
  dueDate: string;
}>;

function todayIsoDate(): string {
  return getCurrentISODate();
}

export function taskDueDateIso(task: TaskListItem): string {
  const dueDate = task.dueDate;
  if (!dueDate) return todayIsoDate();
  return dateToInputFormat(dueDate) || todayIsoDate();
}

/** User or API input → `YYYY-MM-DD`, or `""` when there is no date. */
function dueDateInputToIsoDay(
  value: string | Date | null | undefined,
): string {
  return dateToInputFormat(value ?? null);
}

export function isChecklistLinkedTask(task: TaskListItem): boolean {
  const { category } = splitChecklistTaskName(task.name);
  const hasLabel = Boolean((task.label ?? "").trim());
  const info = String(task.information ?? "").toLowerCase();
  const hasTemplateInfoMarker =
    info.includes("checklist_template_item_id:") || info.includes("label:");
  return Boolean(
    task.fromChecklist ||
      task.checklistTaskId ||
      task.checklistId ||
      category ||
      hasLabel ||
      hasTemplateInfoMarker,
  );
}

/** Stored task due date as `YYYY-MM-DD`, or `undefined` if none (never fabricated). */
function storedDueDateIsoDay(task: TaskListItem): string | undefined {
  const day = dueDateInputToIsoDay(task.dueDate);
  return day || undefined;
}

function buildDueDatePayloadPart(
  task: TaskListItem,
  overrides: TaskPayloadOverrides,
): Record<string, string | null> {
  // Checklist rows: unchanged — always send a concrete due_date (today fallback).
  if (isChecklistLinkedTask(task)) {
    return { due_date: overrides.dueDate ?? taskDueDateIso(task) };
  }

  const type = task.type ?? TRANSACTION_TASK_TYPES.TASK;

  // Standalone task row: empty input still maps to a date (today).
  if (type !== TRANSACTION_TASK_TYPES.FORM) {
    return { due_date: overrides.dueDate ?? taskDueDateIso(task) };
  }

  // Standalone PSA form: optional date; partial updates must not invent one.
  if (overrides.dueDate !== undefined) {
    const day = dueDateInputToIsoDay(overrides.dueDate);
    return { due_date: day || null };
  }

  const existing = storedDueDateIsoDay(task);
  return existing ? { due_date: existing } : {};
}

/**
 * GenericTaskModal save: FORM → `null` when cleared; TASK → today when empty.
 */
export function standaloneModalDueDateForPayload(
  taskType: string | undefined,
  dueDate: string | Date | null | undefined,
): string | null {
  const day = dueDateInputToIsoDay(dueDate);
  const isForm =
    (taskType ?? TRANSACTION_TASK_TYPES.TASK) === TRANSACTION_TASK_TYPES.FORM;

  if (isForm) {
    return day || null;
  }
  return day || todayIsoDate();
}

export function buildTransactionTaskPayload(
  task: TaskListItem,
  overrides: TaskPayloadOverrides = {},
) {
  const completed = overrides.completed ?? task.completed;

  return {
    name: overrides.name ?? task.name ?? "",
    description: overrides.description ?? task.description ?? "",
    information: overrides.information ?? task.information ?? "",
    ...buildDueDatePayloadPart(task, overrides),
    completed,
    transaction_id: task.transactionId,
    transaction_task_type: task.type ?? TRANSACTION_TASK_TYPES.TASK,
    ...(task.checklistTaskId ? { checklist_task_id: task.checklistTaskId } : {}),
    ...(overrides.assignedUserId !== undefined
      ? { assigned_user_id: overrides.assignedUserId }
      : task.assignedUserId !== undefined
        ? { assigned_user_id: task.assignedUserId }
        : {}),
    status:
      overrides.status ??
      (completed
        ? TRANSACTION_TASK_STATUS.COMPLETED
        : TRANSACTION_TASK_STATUS.ON_TRACK),
  };
}

export function getChecklistUiStatus(task: TaskListItem): ChecklistUiStatus {
  if (task.status === TRANSACTION_TASK_STATUS.SKIPPED) {
    return TRANSACTION_CHECKLIST_UI_STATUS.DONT_NEED;
  }
  if (task.completed) {
    return TRANSACTION_CHECKLIST_UI_STATUS.DONE;
  }
  return TRANSACTION_CHECKLIST_UI_STATUS.NONE;
}

export function groupTransactionTasksByType(tasks: TaskListItem[]) {
  const nonChecklistTasks = tasks.filter(
    (task) =>
      !isChecklistLinkedTask(task),
  );
  const forms = nonChecklistTasks.filter(
    (task) => task.type === TRANSACTION_TASK_TYPES.FORM,
  );
  const regularTasks = nonChecklistTasks.filter(
    (task) => task.type !== TRANSACTION_TASK_TYPES.FORM,
  );

  return [
    { key: "forms", label: "Forms", items: forms },
    { key: "tasks", label: "Tasks", items: regularTasks },
  ] as const;
}

export function mapTransactionDetailTaskToTaskListItem(
  task: TransactionDetailTask,
): TaskListItem {
  return {
    id: task.id,
    name: task.name,
    description: task.description ?? "",
    information: task.information ?? "",
    completed: Boolean(task.completed),
    dueDate: task.dueDate,
    transactionId: task.transactionId,
    checklistTaskId:
      (task as unknown as { checklistTaskId?: string | null }).checklistTaskId ??
      undefined,
    checklistId:
      (task as unknown as { checklistId?: string | null }).checklistId ??
      undefined,
    fromChecklist:
      (task as unknown as { fromChecklist?: boolean | null }).fromChecklist ??
      undefined,
    assignedUserId:
      (task as unknown as { assignedUserId?: string | null }).assignedUserId ??
      undefined,
    type:
      task.type === TRANSACTION_TASK_TYPES.FORM
        ? TRANSACTION_TASK_TYPES.FORM
        : TRANSACTION_TASK_TYPES.TASK,
    status: (task.status as TaskListItem["status"]) ?? undefined,
  };
}
