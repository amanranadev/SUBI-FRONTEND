import { TRANSACTION_TASK_TYPES } from "@/features/transactions/types/transaction-task";
import { TRANSACTION_TASK_STATUS } from "@/features/transactions/types/transaction-type";
import { applyTaskSkipMarker } from "@/features/tasks/utils/task-skip-marker";
import { dateToInputFormat } from "@/shared/utils/dateUtils";
import { getCurrentISODate } from "@/shared/utils/format";
import type { TaskListItem, CreateTaskDto, UpdateTaskDto } from "../types";

function taskDueDateIso(task: TaskListItem): string {
  const dueDate = task.dueDate;
  if (!dueDate) return getCurrentISODate();
  return dateToInputFormat(dueDate) || getCurrentISODate();
}

export const TaskMapper = {
  toPayload(
    task: TaskListItem,
    overrides: Partial<{
      completed: boolean;
      description: string;
      dueDate: string;
      information: string;
      name: string;
      skipped: boolean;
      status: string;
      parentTaskId: string | null;
      daysAfterParent: number | null;
    }> = {},
  ): UpdateTaskDto {
    const completed = overrides.completed ?? task.completed ?? false;
    const skipped =
      overrides.skipped ?? task.status === TRANSACTION_TASK_STATUS.SKIPPED;

    return {
      name: overrides.name ?? task.name ?? "",
      description: overrides.description ?? task.description ?? "",
      information: applyTaskSkipMarker(
        overrides.information ?? task.information ?? "",
        skipped,
      ),
      due_date: overrides.dueDate ?? taskDueDateIso(task),
      completed,
      transaction_id: task.transactionId ?? "",
      transaction_task_type: String(task.type ?? TRANSACTION_TASK_TYPES.TASK),
      ...(task.checklistTaskId
        ? { checklist_task_id: task.checklistTaskId }
        : {}),
      ...(task.assignedUserId !== undefined
        ? { assigned_user_id: task.assignedUserId }
        : {}),
      status:
        overrides.status ??
        (completed
          ? TRANSACTION_TASK_STATUS.COMPLETED
          : skipped
            ? TRANSACTION_TASK_STATUS.NOT_STARTED
            : task.status && task.status !== TRANSACTION_TASK_STATUS.SKIPPED
              ? String(task.status)
              : TRANSACTION_TASK_STATUS.ON_TRACK),
      ...(overrides.parentTaskId !== undefined
        ? { parent_task_id: overrides.parentTaskId }
        : {}),
      ...(overrides.daysAfterParent !== undefined
        ? { days_after_parent: overrides.daysAfterParent }
        : {}),
    };
  },

  toCreatePayload(
    data: Partial<CreateTaskDto> & { transaction_id: string },
  ): CreateTaskDto {
    return {
      name: data.name ?? "",
      description: data.description ?? "",
      information: data.information ?? "",
      due_date: data.due_date ?? getCurrentISODate(),
      completed: data.completed ?? false,
      transaction_id: data.transaction_id,
      transaction_task_type: data.transaction_task_type ?? TRANSACTION_TASK_TYPES.TASK,
      status: data.status ?? TRANSACTION_TASK_STATUS.ON_TRACK,
      parent_task_id: data.parent_task_id,
      days_after_parent: data.days_after_parent,
    };
  },
};
