import type { AxiosResponse } from "axios"
import { apiClient } from "@/lib/api/client"
import type { TaskListItem, CreateTaskDto, UpdateTaskDto } from "../types"
import { extractTaskRows, normalizeTask } from "../utils/normalize-task"
import { TASK_ENDPOINTS } from "./endpoints"

export type FetchTasksParams = {
  search?: string
  transactionId?: string
  sortBy?: string
  sortDirection?: "ASC" | "DESC"
  page?: number
  perPage?: number
}

export async function fetchTasks({
  search,
  transactionId,
  sortBy,
  sortDirection,
  page,
  perPage,
}: FetchTasksParams = {}): Promise<TaskListItem[]> {
  const normalizedSearch = search?.trim()
  const normalizedTransactionId = transactionId?.trim()
  const normalizedPage =
    typeof page === "number" && Number.isFinite(page) && page > 0
      ? Math.floor(page)
      : undefined
  const normalizedPerPage =
    typeof perPage === "number" && Number.isFinite(perPage) && perPage > 0
      ? Math.floor(perPage)
      : undefined

  const params =
    normalizedSearch ||
      normalizedTransactionId ||
      sortBy ||
      sortDirection ||
      normalizedPage ||
      normalizedPerPage
      ? {
        ...(normalizedSearch ? { search: normalizedSearch } : {}),
        ...(normalizedTransactionId ? { transaction_id: normalizedTransactionId } : {}),
        ...(sortBy ? { sort_by: sortBy } : {}),
        ...(sortDirection ? { sort_direction: sortDirection } : {}),
        ...(normalizedPage ? { page: normalizedPage } : {}),
        ...(normalizedPerPage ? { per_page: normalizedPerPage } : {}),
      }
      : undefined

  const { data } = await apiClient.get<unknown>(
    TASK_ENDPOINTS.list,
    params ? { params } : undefined,
  )

  return extractTaskRows(data).map(normalizeTask).filter((task) => task.id)
}

export function createTask(data: CreateTaskDto): Promise<AxiosResponse> {
  return apiClient.post(TASK_ENDPOINTS.create, data)
}

export function fetchTask(id: string | number): Promise<AxiosResponse> {
  return apiClient.get(TASK_ENDPOINTS.get(id))
}

export function updateTask(
  id: string | number,
  data: UpdateTaskDto,
): Promise<AxiosResponse> {
  return apiClient.put(TASK_ENDPOINTS.update(id), data)
}

export function deleteTask(id: string | number): Promise<AxiosResponse> {
  return apiClient.delete(TASK_ENDPOINTS.delete(id))
}
