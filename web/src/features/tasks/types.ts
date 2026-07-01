import type { TransactionTask } from "@/features/transactions/types/transaction-type"
import type { TransactionTaskType } from "@/features/transactions/types/transaction-task";

export interface RawTransactionTask {
  id?: string | number | null
  name?: string | null
  description?: string | null
  information?: string | null
  label?: string | null
  task_label?: string | null
  completed?: boolean | null
  dueDate?: string | Date | null
  due_date?: string | null
  transactionId?: string | null
  transaction_id?: string | null
  type?: string | null
  transaction_task_type?: string | number | null
  status?: string | number | null
  createdAt?: string | null
  created_at?: string | null
  checklistTaskId?: string | null
  checklist_task_id?: string | null
  checklistId?: string | null
  checklist_id?: string | null
  fromChecklist?: boolean | null
  from_checklist?: boolean | null
  assignedUserId?: string | null
  assigned_user_id?: string | null
  assignedTo?: string | null
  assigned_to?: string | null
  address?: string | null
  parentTaskId?: string | null
  parent_task_id?: string | null
  daysAfterParent?: number | null
  days_after_parent?: number | null
  daysOffset?: number | null
  days_offset?: number | null
  triggerEvent?: string | null
  trigger_event?: string | null
  hasChildren?: boolean | null
  has_children?: boolean | null
}

export interface TaskListItem extends TransactionTask {
  createdAt?: string
}

export interface UseAllTasksParams {
  search?: string
}

export type TasksViewTaskStatus = "none" | "dont-need" | "done";
export type TasksViewPendingTaskAction = "delete" | "done" | "dont-need" | "date";

export interface TasksViewTask {
  id: string;
  sourceTask: TaskListItem;
  property: string;
  title: string;
  date: Date;
  status: TasksViewTaskStatus;
  note?: string;
  information?: string;
  transactionId?: string;
  dueDate?: string | Date;
  completed: boolean;
  name: string;
  description?: string | null;
  type?: TransactionTaskType;
  isCalendarEvent?: boolean;
  googleEventId?: string;
  allDay?: boolean;
}

export interface CreateTaskDto {
  name: string;
  description?: string;
  information?: string;
  due_date: string | null;
  completed: boolean;
  transaction_id: string;
  transaction_task_type: string;
  status: string;
  parent_task_id?: string | null;
  days_after_parent?: number | null;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {}
