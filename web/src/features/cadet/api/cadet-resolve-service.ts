import { apiClient } from "@/lib/api/client"

export interface CadetResolveResult {
  transaction_id: string
  address: string
  cadet_command: string
  platform: string
}

export interface CadetResolveError {
  error: string
  available_commands?: Array<{
    transaction_id: string | number
    address: string
    cadet_command: string
  }>
}

export async function resolveCadetPhrase(
  phrase: string,
  contextTransactionId?: string | null,
): Promise<CadetResolveResult | null> {
  try {
    const { data } = await apiClient.get<CadetResolveResult>("/cadet_fills/resolve", {
      params: {
        phrase,
        ...(contextTransactionId ? { context_transaction_id: contextTransactionId } : {}),
      },
    })
    return data
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status === 404
    ) {
      return null
    }
    throw error
  }
}
