/**
 * Local UI state for transaction checklist rows (overlay on API `completed` + “don’t need”).
 * `DONT_NEED` is kept in tab state only until toggled off.
 */
export const TRANSACTION_CHECKLIST_UI_STATUS = {
  NONE: "none",
  DONT_NEED: "dont-need",
  DONE: "done",
} as const

export type TransactionChecklistUiStatus =
  (typeof TRANSACTION_CHECKLIST_UI_STATUS)[keyof typeof TRANSACTION_CHECKLIST_UI_STATUS]
