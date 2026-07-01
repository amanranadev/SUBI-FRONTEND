import { formatCurrency } from "@/shared/utils/format"
import type { Transaction } from "@/features/workspace/types"

function joinNames(maybeArray: any): string | undefined {
  if (!maybeArray) return undefined
  if (Array.isArray(maybeArray)) {
    const parts = maybeArray
      .map((p) => {
        if (!p) return ""
        if (typeof p === "string") return p
        const first = p.firstName || p.first_name || p.first || ""
        const last = p.lastName || p.last_name || p.last || ""
        return [first, last].filter(Boolean).join(" ")
      })
      .filter(Boolean)
    return parts.length ? parts.join(", ") : undefined
  }

  if (typeof maybeArray === "string") return maybeArray
  return undefined
}

export function normalizeTransactionFromAPI(raw: any): Transaction {
  const id = String(raw?.id ?? raw?.transaction_id ?? raw?._id ?? "")
  const address = raw?.address ?? raw?.property_address ?? raw?.address_line ?? ""
  const price = formatCurrency(raw?.amount ?? raw?.price ?? null)
  const status = (raw?.status ?? raw?.state ?? "STARTED") as any
  const date = raw?.date ?? raw?.created_at ?? raw?.closeDate ?? ""
  const progress = typeof raw?.progress === "number" ? raw.progress : 0
  const totalTasks = raw?.totalTasks ?? 0
  const hasTasks = totalTasks > 0 || progress > 0

  const buyers = joinNames(raw?.buyers ?? raw?.buyersandsellers?.[0]?.buyers)
  const sellers = joinNames(raw?.sellers ?? raw?.buyersandsellers?.[0]?.sellers)
  const parcelNumber = raw?.parcelNumber ?? raw?.parcel_number ?? raw?.parcel
  const mutualAcceptanceDate = raw?.pendDate ?? raw?.mutualAcceptanceDate ?? undefined
  const agentName = raw?.agentName ?? raw?.agent?.name ?? undefined
  const userId = raw?.user_id ?? raw?.userId ?? undefined

  return {
    id,
    address,
    price,
    status,
    date,
    progress,
    hasTasks,
    buyers,
    sellers,
    parcelNumber,
    mutualAcceptanceDate,
    agentName,
    userId,
  }
}

export default normalizeTransactionFromAPI
