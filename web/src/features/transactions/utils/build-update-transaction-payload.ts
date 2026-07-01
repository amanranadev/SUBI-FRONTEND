import type { Transaction } from "@/features/workspace/types"
import {
  REPRESENTING_PARTY_API,
  TRANSACTION_LISTING_TYPE,
} from "@/features/transactions/constants"
import { mapFormPartyToApiParty } from "@/features/transactions/api/build-create-payload"
import { parseSummaryLineToParties } from "@/features/transactions/utils/transaction-party-helpers"
import { parseCurrencyToNumber, parseDateToISO } from "@/shared/utils/format"

function normalizeAgentContact(contact: Transaction["buyerAgent"]) {
  return {
    firstName: contact?.firstName?.trim() ?? "",
    lastName: contact?.lastName?.trim() ?? "",
    email: contact?.email?.trim() ?? "",
    phone: contact?.phone?.trim() ?? "",
  }
}

function buildRepresenting(
  party: Transaction["representingParty"],
): string[] {
  const out: string[] = []
  if (party === "buyer") out.push(REPRESENTING_PARTY_API.BUYER)
  if (party === "seller") out.push(REPRESENTING_PARTY_API.SELLER)
  return out
}

/** Body for `PUT /transactions/:id` — aligns with create payload field names. */
export function buildUpdateTransactionPayload(
  transaction: Transaction,
): Record<string, unknown> {
  const buyerParties = transaction.buyerParties
  const sellerParties = transaction.sellerParties
  const useStructuredParties =
    buyerParties != null && sellerParties != null

  const buyers = useStructuredParties
    ? buyerParties.map(mapFormPartyToApiParty)
    : parseSummaryLineToParties(transaction.buyers, true).map(mapFormPartyToApiParty)

  const sellers = useStructuredParties
    ? sellerParties.map(mapFormPartyToApiParty)
    : parseSummaryLineToParties(transaction.sellers, false).map(mapFormPartyToApiParty)

  const cityState = [transaction.city, transaction.state, transaction.county]
    .map((value) => value?.trim() ?? "")
    .filter(Boolean)
    .join(", ")
  const psaRaw = transaction.psaType?.trim()
  const psa_type = psaRaw
    ? psaRaw.toUpperCase().replace(/\s+/g, "_")
    : TRANSACTION_LISTING_TYPE.RESIDENTIAL
  const serializedItemsThatStay = JSON.stringify(transaction.itemsThatStay ?? [])
  const buyerAgent = normalizeAgentContact(transaction.buyerAgent)
  const sellerAgent = normalizeAgentContact(transaction.sellerAgent)

  return {
    address: transaction.address,
    amount: parseCurrencyToNumber(transaction.price),
    closeDate: parseDateToISO(transaction.date),
    pendDate: parseDateToISO(transaction.mutualAcceptanceDate ?? "") || null,
    parcel_number: transaction.parcelNumber?.trim() ?? "",
    earnestMoney: parseCurrencyToNumber(transaction.earnestMoney),
    city_state: cityState,
    psa_type,
    // Keep payload aligned with transaction_params camelCase mapping.
    itemsThatStay: serializedItemsThatStay,
    title_co: transaction.titleCompany?.trim() ?? "",
    escrow_officer: transaction.closingAgent?.trim() ?? "",
    escrow_agent_email: transaction.escrowEmail?.trim() ?? "",
    lender: transaction.lender?.trim() ?? "",
    nwmls_number: transaction.nwmlsNumber?.trim() ?? "",
    description: transaction.description?.trim() ?? "",
    status: transaction.status,
    buyersandsellers: {
      buyers,
      sellers,
    },
    representing: buildRepresenting(transaction.representingParty ?? null),
    buyerAgent,
    buyer_agent: buyerAgent,
    sellerAgent,
    seller_agent: sellerAgent,
  }
}
