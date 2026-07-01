import {
  TRANSACTION_TASK_STATUS,
  TRANSACTION_TASK_TYPES,
  type TransactionTaskStatus,
  type TransactionTaskType,
} from "@/features/transactions/types/transaction-type"
import type { RawTransactionTask, TaskListItem } from "../types"
import {
  hasTaskSkipMarker,
  stripTaskSkipMarker,
} from "./task-skip-marker"

function normalizeTaskType(rawTask: RawTransactionTask): TransactionTaskType {
  const rawType = rawTask.type ?? rawTask.transaction_task_type

  if (rawType === TRANSACTION_TASK_TYPES.FORM || rawType === "FORM") {
    return TRANSACTION_TASK_TYPES.FORM
  }

  return TRANSACTION_TASK_TYPES.TASK
}

function normalizeTaskStatus(
  rawStatus: RawTransactionTask["status"],
  completed: boolean,
): TransactionTaskStatus {
  if (completed) {
    return TRANSACTION_TASK_STATUS.COMPLETED
  }

  if (typeof rawStatus === "string") {
    const normalizedStatus = rawStatus.toUpperCase()
    if (normalizedStatus in TRANSACTION_TASK_STATUS) {
      return normalizedStatus as TransactionTaskStatus
    }
  }

  switch (rawStatus) {
    case 0:
      return TRANSACTION_TASK_STATUS.PAST_DUE
    case 1:
      return TRANSACTION_TASK_STATUS.ON_TRACK
    case 2:
      return TRANSACTION_TASK_STATUS.COMING_UP
    case 3:
      return TRANSACTION_TASK_STATUS.COMPLETED
    case 4:
      return TRANSACTION_TASK_STATUS.SKIPPED
    default:
      return TRANSACTION_TASK_STATUS.NOT_STARTED
  }
}

export function normalizeTask(rawTask: RawTransactionTask): TaskListItem {
  const completed = Boolean(rawTask.completed)
  const createdAt = rawTask.created_at ?? rawTask.createdAt ?? undefined
  const skipped =
    !completed &&
    (
      hasTaskSkipMarker(rawTask.description) ||
      hasTaskSkipMarker(rawTask.information) ||
      rawTask.status === TRANSACTION_TASK_STATUS.SKIPPED
    )

  return {
    id: String(rawTask.id ?? ""),
    name: rawTask.name ?? "",
    label: rawTask.label ?? rawTask.task_label ?? undefined,
    description: stripTaskSkipMarker(rawTask.description),
    information: stripTaskSkipMarker(rawTask.information),
    completed,
    dueDate: rawTask.dueDate ?? rawTask.due_date ?? undefined,
    transactionId: rawTask.transactionId ?? rawTask.transaction_id ?? undefined,
    type: normalizeTaskType(rawTask),
    assignedUserId:
      rawTask.assignedUserId ?? rawTask.assigned_user_id ?? undefined,
    assignedTo: rawTask.assignedTo ?? rawTask.assigned_to ?? undefined,
    checklistTaskId:
      rawTask.checklistTaskId ?? rawTask.checklist_task_id ?? undefined,
    checklistId: rawTask.checklistId ?? rawTask.checklist_id ?? undefined,
    fromChecklist:
      rawTask.fromChecklist ?? rawTask.from_checklist ?? undefined,
    address: rawTask.address ?? undefined,
    status:
      skipped ?
        TRANSACTION_TASK_STATUS.SKIPPED
      : normalizeTaskStatus(rawTask.status, completed),
    parentTaskId: rawTask.parentTaskId ?? rawTask.parent_task_id ?? undefined,
    daysAfterParent: rawTask.daysAfterParent ?? rawTask.days_after_parent ?? undefined,
    hasChildren: rawTask.hasChildren ?? rawTask.has_children ?? false,
    createdAt,
  }
}

export function extractTaskRows(payload: unknown): RawTransactionTask[] {
  if (Array.isArray(payload)) {
    return payload as RawTransactionTask[]
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: RawTransactionTask[] }).data
  }

  if (
    payload &&
    typeof payload === "object" &&
    "transaction_tasks" in payload &&
    Array.isArray((payload as { transaction_tasks?: unknown }).transaction_tasks)
  ) {
    return (payload as { transaction_tasks: RawTransactionTask[] }).transaction_tasks
  }

  if (
    payload &&
    typeof payload === "object" &&
    "tasks" in payload &&
    Array.isArray((payload as { tasks?: unknown }).tasks)
  ) {
    return (payload as { tasks: RawTransactionTask[] }).tasks
  }

  return []
}
