import { apiClient } from "@/lib/api/client"
import type { CadetActionResolveResult } from "../types"

export async function resolveCadetActionPhrase(
  phrase: string,
): Promise<CadetActionResolveResult | null> {
  const normalized = phrase.trim().toLowerCase().replace(/\s+/g, " ")
  if (!normalized) return null

  try {
    const { data } = await apiClient.get<CadetActionResolveResult>("/cadet_actions/resolve", {
      params: { phrase: normalized },
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
