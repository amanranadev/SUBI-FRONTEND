export const TASK_QUERY_KEYS = {
  all: ["all-tasks"] as const,
  list: (search?: string) => ["all-tasks", search?.trim() || ""] as const,
  byTransaction: (transactionId: string) =>
    ["all-tasks", "transaction", transactionId] as const,
} as const
