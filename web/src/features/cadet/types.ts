export type CadetFillStatus =
  | "pending"
  | "running"
  | "success"
  | "error"
  | "extension_missing"
  | "no_dotloop_tab"

export interface CadetFillReport {
  filledCount?: number
  skippedCount?: number
  missingFields?: string[]
  saveClicked?: boolean
  saveClickCount?: number
  saveErrors?: string[]
}

export interface CadetFillRequest {
  id: string
  chatId?: string
  transactionId: string
  cadetCommand?: string
  address?: string
  platform: string
  status: CadetFillStatus
  message?: string
  report?: CadetFillReport
  timestamp: Date
}

export interface CadetFillRequestedPayload {
  type: "cadet_fill_requested"
  chat_id?: string
  transaction_id: string
  cadet_command?: string
  address?: string
  platform?: string
  timestamp?: string
}
