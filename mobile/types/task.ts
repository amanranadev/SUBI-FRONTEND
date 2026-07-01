import type { Pagination } from "@subi/types";

export interface Task {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  completed: boolean;
  status: "ON_TRACK" | "COMING_UP" | "PAST_DUE" | "COMPLETED";
  transactionId: string;
  type: "TASK" | "MILESTONE";
  transaction_task_type?: "TASK" | "FORM"; // Backend field to distinguish forms from tasks
  information?: string;
  created_at: string;
  updated_at: string;
  taskId: string;
  address: string;
  isCalendarEvent?: boolean;
}

export interface TaskResponse {
  data: Task[];
  pagination: Pagination;
  success: boolean;
}

export interface UrgentTasksResponse {
  urgent_tasks: Task[];
  overdue_count: number;
  due_soon_count: number;
}

// Task filters interface
export interface TaskFilters {
  status?: string;
  transactionId?: string;
  userId?: string;
}

// Create Task Payload (API expects snake_case)
export interface CreateTaskPayload {
  name: string;
  description: string;
  information: string;
  due_date: string; // YYYY-MM-DD format
  completed: boolean; // false for new tasks
  transaction_task_type: "TASK" | "FORM";
  status: "ON_TRACK" | "PAST_DUE" | "COMING_UP" | "NOT_STARTED" | "COMPLETED";
  transaction_id: string;
}

// Task Form Data (camelCase for internal use)
export interface TaskFormData {
  name: string;
  description: string;
  information?: string;
  dueDate: Date | string;
  type: "TASK" | "FORM";
  transactionId: string;
  status?: "ON_TRACK" | "PAST_DUE" | "COMING_UP" | "NOT_STARTED" | "COMPLETED";
}
