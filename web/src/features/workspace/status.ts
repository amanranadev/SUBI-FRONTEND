/**
 * Transaction status values (backend enum).
 * Order reflects pipeline: Pending Inspection → … → Closed.
 */
export const TRANSACTION_STATUS = {
  STARTED: "STARTED",
  PENDING_INSPECTION: "PENDING_INSPECTION",
  PENDING_APPRAISAL: "PENDING_APPRAISAL",
  CLEAR_TO_CLOSE: "CLEAR_TO_CLOSE",
  CLOSED: "CLOSED",
  CANCELLED: "CANCELLED",
  ARCHIVE: "ARCHIVE",
} as const

export type TransactionStatus =
  (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS]

export const ARCHIVED_TRANSACTION_STATUSES: readonly TransactionStatus[] = [
  TRANSACTION_STATUS.ARCHIVE,
  TRANSACTION_STATUS.CLOSED,
  TRANSACTION_STATUS.CANCELLED,
]

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  [TRANSACTION_STATUS.STARTED]: "Started",
  [TRANSACTION_STATUS.PENDING_INSPECTION]: "Pending Inspection",
  [TRANSACTION_STATUS.PENDING_APPRAISAL]: "Pending Appraisal",
  [TRANSACTION_STATUS.CLEAR_TO_CLOSE]: "Clear to Close",
  [TRANSACTION_STATUS.CLOSED]: "Closed",
  [TRANSACTION_STATUS.CANCELLED]: "Cancelled",
  [TRANSACTION_STATUS.ARCHIVE]: "Archive",
}
