import { TRANSACTION_DETAIL_TAB } from "@/features/transactions/constants/transaction-detail-tabs"

export const TRANSACTIONS_ROUTES = {
  ROOT: "/transactions",
  SUCCESS: "/transactions/success",
  detail: (id: string) => `/transactions/${id}`,
  detailFormsAndTasks: (transactionId: string) =>
    `/transactions/${transactionId}?tab=${TRANSACTION_DETAIL_TAB.DETAILS}#forms-and-tasks`,
  detailChecklist: (transactionId: string, taskId: string) =>
    `/transactions/${transactionId}?tab=${TRANSACTION_DETAIL_TAB.CHECKLIST}&taskId=${encodeURIComponent(taskId)}`,
} as const

