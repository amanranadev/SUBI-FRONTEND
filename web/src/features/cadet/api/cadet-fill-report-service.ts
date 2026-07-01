import { apiClient } from "@/lib/api/client"
import type { CadetFillReport } from "../types"

export async function reportCadetFill(params: {
  transactionId: string
  chatId?: string
  platform?: string
  report?: CadetFillReport
}): Promise<void> {
  await apiClient.post("/cadet_fill_reports", {
    transaction_id: params.transactionId,
    chat_id: params.chatId,
    platform: params.platform ?? "dotloop",
    filled_count: params.report?.filledCount,
    skipped_count: params.report?.skippedCount,
    missing_fields: params.report?.missingFields ?? [],
  })
}
