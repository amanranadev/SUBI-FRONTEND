export const TRANSACTION_DETAIL_TAB = {
  DETAILS: "details",
  DOCUMENTS: "documents",
  CHECKLIST: "checklist",
  NOTES: "notes",
  COMMUNICATION: "communication",
} as const

export type TransactionDetailTab =
  (typeof TRANSACTION_DETAIL_TAB)[keyof typeof TRANSACTION_DETAIL_TAB]
