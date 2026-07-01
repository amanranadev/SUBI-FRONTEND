import { useQuery } from "@tanstack/react-query"
import { fetchTasks } from "../api/task-service"
import { TASK_QUERY_KEYS } from "../constants"

type UseTransactionTasksParams = {
  transactionId?: string | null
}

export function useTransactionTasks({ transactionId }: UseTransactionTasksParams) {
  const normalizedTransactionId = transactionId?.trim()

  return useQuery({
    queryKey: TASK_QUERY_KEYS.byTransaction(normalizedTransactionId || ""),
    queryFn: () =>
      fetchTasks({
        transactionId: normalizedTransactionId || "",
        sortBy: "DUE_DATE",
        sortDirection: "ASC",
        perPage: 100,
      }),
    enabled: Boolean(normalizedTransactionId),
    staleTime: 30 * 1000,
  })
}
