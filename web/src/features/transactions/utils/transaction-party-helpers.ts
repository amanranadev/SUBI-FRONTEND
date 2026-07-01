import type {
  RepresentingParty,
  TransactionFormParty,
} from "@/features/transactions/types"

export function emptyParty(): TransactionFormParty {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    representing: false,
  }
}

/** Same logic as review dialog when "I am representing" changes. */
export function applyRepresentingParty(
  party: RepresentingParty | null,
  buyers: TransactionFormParty[],
  sellers: TransactionFormParty[],
): { buyers: TransactionFormParty[]; sellers: TransactionFormParty[] } {
  if (party === "buyer") {
    return {
      buyers: buyers.map((b) => ({ ...b, representing: true })),
      sellers: sellers.map((s) => ({ ...s, representing: false })),
    }
  }
  if (party === "seller") {
    return {
      buyers: buyers.map((b) => ({ ...b, representing: false })),
      sellers: sellers.map((s) => ({ ...s, representing: true })),
    }
  }
  return { buyers, sellers }
}

export function deriveRepresentingPartyFromRows(
  buyers: TransactionFormParty[],
  sellers: TransactionFormParty[],
): RepresentingParty | null {
  const hasBuyerRepresenting = buyers.some((b) => b.representing)
  const hasSellerRepresenting = sellers.some((s) => s.representing)
  if (hasBuyerRepresenting) return "buyer"
  if (hasSellerRepresenting) return "seller"
  return null
}

export function formatPartyRowsToSummary(
  parties: TransactionFormParty[],
): string {
  return parties
    .filter((p) => p.firstName.trim() || p.lastName.trim())
    .map((p) => [p.firstName, p.lastName].filter(Boolean).join(" ").trim())
    .filter(Boolean)
    .join(", ")
}

/** Fallback when API only provided comma-separated display strings. */
export function parseSummaryLineToParties(
  line: string | undefined,
  representing: boolean,
): TransactionFormParty[] {
  if (!line?.trim()) return []
  return line.split(",").map((segment) => {
    const t = segment.trim()
    const i = t.lastIndexOf(" ")
    if (i <= 0) {
      return {
        firstName: t,
        lastName: "",
        email: "",
        phone: "",
        representing,
      }
    }
    return {
      firstName: t.slice(0, i).trim(),
      lastName: t.slice(i + 1).trim(),
      email: "",
      phone: "",
      representing,
    }
  })
}
