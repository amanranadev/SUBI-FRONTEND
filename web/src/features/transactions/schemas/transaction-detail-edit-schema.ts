import { z } from "zod"
import {
  FIELD_LIMITS,
  itemsThatStayItemSchema,
  optionalTrimmedString,
  requiredEscrowEmailSchema,
  requiredTrimmedString,
  transactionDetailAgentSchema,
  transactionDetailPartySchema,
} from "./transaction-detail-validation"

/** Mirrors transaction dialog review (no checklist / tasks). */
export const transactionDetailEditSchema = z
  .object({
    address: requiredTrimmedString("Address", FIELD_LIMITS.ADDRESS),
    price: requiredTrimmedString("Price", FIELD_LIMITS.CURRENCY),
    closeDate: requiredTrimmedString("Closing date", FIELD_LIMITS.DATE),
    mutualAcceptanceDate: requiredTrimmedString(
      "Mutual acceptance date",
      FIELD_LIMITS.DATE,
    ),
    earnestMoney: optionalTrimmedString("Earnest money", FIELD_LIMITS.CURRENCY),
    psaType: requiredTrimmedString("PSA type", FIELD_LIMITS.SHORT_TEXT),
    representingParty: z.enum(["buyer", "seller"]).nullable(),
    buyers: z.array(transactionDetailPartySchema),
    sellers: z.array(transactionDetailPartySchema),
    buyerAgent: transactionDetailAgentSchema,
    sellerAgent: transactionDetailAgentSchema,
    parcelNumber: optionalTrimmedString("Parcel number", FIELD_LIMITS.PARCEL_NUMBER),
    city: optionalTrimmedString("City", FIELD_LIMITS.SHORT_TEXT),
    state: optionalTrimmedString("State", FIELD_LIMITS.SHORT_TEXT),
    county: optionalTrimmedString("County", FIELD_LIMITS.SHORT_TEXT),
    titleCompany: optionalTrimmedString("Title company", FIELD_LIMITS.SHORT_TEXT),
    closingAgent: optionalTrimmedString("Closing agent", FIELD_LIMITS.SHORT_TEXT),
    escrowEmail: requiredEscrowEmailSchema,
    lender: optionalTrimmedString("Lender", FIELD_LIMITS.SHORT_TEXT),
    nwmlsNumber: optionalTrimmedString("NWMLS number", FIELD_LIMITS.NWMLS_NUMBER),
    description: optionalTrimmedString("Description", FIELD_LIMITS.DESCRIPTION),
    itemsThatStay: z.array(itemsThatStayItemSchema),
    itemsThatStayDraft: optionalTrimmedString(
      "Items that stay draft",
      FIELD_LIMITS.ITEM_TEXT,
    ),
  })
  .superRefine((data, ctx) => {
    if (data.representingParty == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["representingParty"],
        message: "Select who you are representing.",
      })
    }
    const hasBuyer = data.buyers.some(
      (b) => b.firstName.trim() || b.lastName.trim(),
    )
    const hasSeller = data.sellers.some(
      (s) => s.firstName.trim() || s.lastName.trim(),
    )
    if (!hasBuyer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["buyers"],
        message: "Add at least one buyer.",
      })
    }
    if (!hasSeller) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sellers"],
        message: "Add at least one seller.",
      })
    }
  })

export type TransactionDetailEditValues = z.infer<typeof transactionDetailEditSchema>
export { itemsThatStayItemSchema }