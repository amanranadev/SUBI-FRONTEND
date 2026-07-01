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

export type CadetActionStatus =
  | "pending"
  | "running"
  | "success"
  | "error"
  | "extension_missing"
  | "no_platform_tab"

export interface CadetActionReport {
  completedSteps?: number
  skippedSteps?: number
  failedSteps?: number
  filledCount?: number
  skippedCount?: number
  missingFields?: string[]
}

export interface CadetActionRequest {
  id: string
  chatId?: string
  actionId: string
  actionName: string
  triggerPhrase: string
  platform: string
  status: CadetActionStatus
  message?: string
  report?: CadetActionReport
  timestamp: Date
}

export interface CadetActionRequestedPayload {
  type: "cadet_action_requested"
  chat_id?: string
  action_id: string
  action_name?: string
  trigger_phrase?: string
  platform?: string
  timestamp?: string
}

export interface CadetActionResolveResult {
  action_id: string
  name: string
  trigger_phrase: string
  platform: string
  step_count: number
}
