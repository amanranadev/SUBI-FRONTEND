import {
  CreateTaskPayload,
  Task,
  TaskFormData,
  TaskResponse,
  UrgentTasksResponse,
} from "../types/task";
import { formatDateForAPI } from "../utils/taskUtils";
import apiClient from "./api";

export const taskService = {
  getTasks: async (): Promise<Task[]> => {
    const response = await apiClient.get<TaskResponse>("/transaction_tasks");
    if (Array.isArray(response.data.data)) {
      return response.data.data;
    }
    console.warn("⚠️ Unexpected API response structure:", response.data);
    return [];
  },

  getTask: async (taskId: string): Promise<Task> => {
    const response = await apiClient.get(`/transaction_tasks/${taskId}`);
    return response.data;
  },

  getTransactionTasks: async (transactionId: string): Promise<Task[]> => {
    const response = await apiClient.get(
      `/transactions/${transactionId}/tasks`
    );
    return response.data.data;
  },

  getUserUrgentTasks: async (userId: string): Promise<UrgentTasksResponse> => {
    const response = await apiClient.get(
      `/transactions/user/${userId}/tasks-urgent`
    );
    return response.data;
  },

  createTask: async (taskData: TaskFormData): Promise<Task> => {
    // Map form data to API payload format (camelCase to snake_case)
    const payload: CreateTaskPayload = {
      name: taskData.name,
      description: taskData.description || "",
      information: taskData.information || "",
      due_date:
        typeof taskData.dueDate === "string"
          ? taskData.dueDate
          : formatDateForAPI(taskData.dueDate),
      completed: false, // New tasks are always incomplete
      transaction_task_type: taskData.type,
      status: taskData.status || "ON_TRACK", // Default to ON_TRACK for new tasks
      transaction_id: taskData.transactionId,
    };

    const response = await apiClient.post("/transaction_tasks", payload);
    return response.data;
  },

  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const payload: any = { ...updates };
    if (payload.dueDate) {
      payload.due_date = payload.dueDate;
      delete payload.dueDate;
    }

    const response = await apiClient.put(
      `/transaction_tasks/${taskId}`,
      payload
    );
    return response.data;
  },

  completeTask: async (taskId: string): Promise<Task> => {
    const response = await apiClient.patch(
      `/transaction_tasks/${taskId}/complete`
    );
    return response.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/transaction_tasks/${taskId}`);
  },
};
