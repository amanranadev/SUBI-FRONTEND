import type {
  TransactionAgentContact,
  TransactionFormData,
  TransactionFormParty,
} from "../types"
import {
  TRANSACTION_CATEGORY,
  TRANSACTION_LISTING_TYPE,
  REPRESENTING_PARTY_API,
  TRANSACTION_TASK_TYPE,
  type TransactionCategory,
  type TransactionListingType,
} from "../constants"
import {
  getCurrentISODate,
  parseCurrencyToNumber,
  parseDateToISO,
} from "@/shared/utils/format"
import { defaultTransactionDescription } from "./transaction-service-messages"

export type CreateTransactionDraftOptions = {
  transactionCategory?: TransactionCategory
  listingType?: TransactionListingType
  agentName?: string
  teamId?: string | null
}

export function mapFormPartyToApiParty(p: TransactionFormParty) {
  return {
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email || null,
    phone: p.phone || null,
    representing: p.representing,
  }
}

function normalizeAgentContact(
  contact: TransactionAgentContact,
): TransactionAgentContact | undefined {
  const normalized = {
    firstName: contact.firstName.trim(),
    lastName: contact.lastName.trim(),
    email: contact.email.trim(),
    phone: contact.phone.trim(),
  }
  const hasValue = Object.values(normalized).some(Boolean)
  return hasValue ? normalized : undefined
}

function buildRepresenting(representingParty: TransactionFormData["representingParty"]): string[] {
  const representing: string[] = []
  if (representingParty === "buyer") representing.push(REPRESENTING_PARTY_API.BUYER)
  if (representingParty === "seller") representing.push(REPRESENTING_PARTY_API.SELLER)
  return representing
}

import { parseCalculationTrigger } from "@/features/transactions/utils/task-date-cascade"

function buildSelectedTasks(formData: TransactionFormData) {
  return formData.tasks
    .filter((t) => t.isSelected)
    .map((t) => {
      const parsed = parseCalculationTrigger(t.calculation)
      const note = t.note?.trim() ?? ""
      return {
        name: t.title,
        description: note,
        information: t.calculation || "",
        transaction_task_type: TRANSACTION_TASK_TYPE.FORM,
        dueDate: t.date ? parseDateToISO(t.date) : null,
        ...(parsed ? { days_offset: parsed.daysOffset, trigger_event: parsed.trigger } : {}),
      }
    })
}

export function buildCreatePayload(
  formData: TransactionFormData,
  userUploadId?: string | null,
  options?: CreateTransactionDraftOptions,
): Record<string, unknown> {
  const transactionCategory =
    options?.transactionCategory ?? TRANSACTION_CATEGORY.PSA
  const listingType =
    options?.listingType ?? TRANSACTION_LISTING_TYPE.RESIDENTIAL

  const amount = parseCurrencyToNumber(formData.price)
  const cityState = [formData.city, formData.state, formData.county]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(", ")
  const buyersAndSellers = {
    buyers: formData.buyers.map(mapFormPartyToApiParty),
    sellers: formData.sellers.map(mapFormPartyToApiParty),
  }
  const representing = buildRepresenting(formData.representingParty)
  const selectedTasks = buildSelectedTasks(formData)
  const buyerAgent = normalizeAgentContact(formData.buyerAgent)
  const sellerAgent = normalizeAgentContact(formData.sellerAgent)

  const description =
    formData.description || defaultTransactionDescription(formData.address)
  const date =
    parseDateToISO(formData.closeDate) ||
    getCurrentISODate()
  const serializedItemsThatStay = JSON.stringify(formData.itemsThatStay ?? [])

  return {
    address: formData.address,
    amount,
    description,
    date,
    transaction_category: transactionCategory,
    ...(userUploadId ? { user_upload_id: userUploadId } : {}),
    closeDate: parseDateToISO(formData.closeDate),
    pendDate: parseDateToISO(formData.mutualAcceptanceDate),
    earnestMoney: parseCurrencyToNumber(formData.earnestMoney),
    parcel_number: formData.parcelNumber,
    city_state: cityState,
    psa_type:
      formData.psaType?.toUpperCase?.() || TRANSACTION_LISTING_TYPE.RESIDENTIAL,
    // Backend transaction_params maps camelCase `itemsThatStay` into persisted `items_that_stay`.
    // Send as serialized JSON string so strong params treat it as scalar text.
    itemsThatStay: serializedItemsThatStay,
    title_co: formData.titleCompany,
    escrow_officer: formData.closingAgent,
    escrow_agent_email: formData.escrowEmail,
    lender: formData.lender,
    nwmls_number: formData.nwmlsNumber,
    buyersandsellers: buyersAndSellers,
    representing,
    ...(transactionCategory === TRANSACTION_CATEGORY.LISTING && {
      listing_type: listingType,
    }),
    ...(selectedTasks.length > 0 && {
      selected_tasks: selectedTasks,
    }),
    ...(options?.agentName ? { agent_name: options.agentName } : {}),
    ...(options?.teamId ? { team_id: options.teamId } : {}),
    ...(buyerAgent ? { buyerAgent } : {}),
    ...(sellerAgent ? { sellerAgent } : {}),
  }
}
