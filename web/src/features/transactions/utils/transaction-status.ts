import type { Transaction } from "@/features/workspace/types"
import { TRANSACTION_STATUS } from "@/features/workspace/status"

/** Pipeline order for sorting (earliest first). */
export function getStatusRank(status: Transaction["status"]): number {
  switch (status) {
    case TRANSACTION_STATUS.STARTED:
      return 0
    case TRANSACTION_STATUS.PENDING_INSPECTION:
      return 1
    case TRANSACTION_STATUS.PENDING_APPRAISAL:
      return 2
    case TRANSACTION_STATUS.CLEAR_TO_CLOSE:
      return 3
    case TRANSACTION_STATUS.CLOSED:
      return 4
    case TRANSACTION_STATUS.CANCELLED:
      return 5
    case TRANSACTION_STATUS.ARCHIVE:
      return 6
    default:
      return 99
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case TRANSACTION_STATUS.STARTED:
      return "bg-muted text-muted-foreground border-border"
    case TRANSACTION_STATUS.PENDING_INSPECTION:
      return "bg-amber-500/10 text-amber-600 border-amber-500/20"
    case TRANSACTION_STATUS.PENDING_APPRAISAL:
      return "bg-blue-500/10 text-blue-600 border-blue-500/20"
    case TRANSACTION_STATUS.CLEAR_TO_CLOSE:
      return "bg-violet-500/10 text-violet-600 border-violet-500/20"
    case TRANSACTION_STATUS.CLOSED:
      return "bg-green-500/10 text-green-600 border-green-500/20"
    case TRANSACTION_STATUS.CANCELLED:
      return "bg-red-500/10 text-red-600 border-red-500/20"
    case TRANSACTION_STATUS.ARCHIVE:
      return "bg-muted text-muted-foreground border-border"
    default:
      return "bg-primary/10 text-primary border-primary/20"
  }
}

/**
 * Progress % by pipeline stage when task-based progress is not available.
 * Started → 0%, Pending Inspection → 15%, Pending Appraisal → 35%, Clear to Close → 65%, Closed → 100%.
 */
export function getProgressFromStatus(status: Transaction["status"]): number {
  switch (status) {
    case TRANSACTION_STATUS.STARTED:
      return 0
    case TRANSACTION_STATUS.PENDING_INSPECTION:
      return 15
    case TRANSACTION_STATUS.PENDING_APPRAISAL:
      return 35
    case TRANSACTION_STATUS.CLEAR_TO_CLOSE:
      return 65
    case TRANSACTION_STATUS.CLOSED:
      return 100
    case TRANSACTION_STATUS.CANCELLED:
    case TRANSACTION_STATUS.ARCHIVE:
    default:
      return 0
  }
}
