import { useQuery } from "@tanstack/react-query"
import { fetchTasks } from "../api/task-service"
import { TASK_QUERY_KEYS } from "../constants"
import type { TaskListItem, UseAllTasksParams } from "../types"

export function useAllTasks({ search }: UseAllTasksParams = {}) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.list(search),
    queryFn: () => fetchTasks({ search }),
    staleTime: 30 * 1000,
  })
}

export type { TaskListItem }
