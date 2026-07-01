import type { Transaction } from "@/features/workspace/types"
import type { TransactionFormData, TransactionFormParty } from "@/features/transactions/types"
import { z } from "zod"

export type TransactionDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSave: (
    transaction: Transaction,
    formData?: TransactionFormData,
  ) => void | Promise<void>
  initialData?: TransactionFormData | null
  sourceFileId?: string | null
  isSaving?: boolean
  discardButtonLabel?: string
  saveButtonLabel?: string
  saveButtonLoadingLabel?: string
}

export const TRANSACTION_DIALOG_SECTION = {
  SUMMARY: "summary",
  CLIENTS: "clients",
  PROPERTY: "property",
  FORMS: "forms",
} as const

export type SectionId =
  (typeof TRANSACTION_DIALOG_SECTION)[keyof typeof TRANSACTION_DIALOG_SECTION]

export const TRANSACTION_DIALOG_DEFAULT_OPEN_SECTIONS: SectionId[] = [
  TRANSACTION_DIALOG_SECTION.SUMMARY,
  TRANSACTION_DIALOG_SECTION.CLIENTS,
  TRANSACTION_DIALOG_SECTION.PROPERTY,
  TRANSACTION_DIALOG_SECTION.FORMS,
]

export const TRANSACTION_DIALOG_PARTY_TYPE = {
  BUYERS: "buyers",
  SELLERS: "sellers",
} as const

export type TransactionDialogPartyType =
  (typeof TRANSACTION_DIALOG_PARTY_TYPE)[keyof typeof TRANSACTION_DIALOG_PARTY_TYPE]

export type ValidationErrors = Record<string, string>

const optionalEmailSchema = z.union([z.literal(""), z.string().email("Invalid email")])
const requiredEmailSchema = z
  .string()
  .trim()
  .min(1, "Escrow email is required")
  .email("Invalid email")
const optionalPhoneSchema = z.string().refine(
  (value) => value.trim().length === 0 || value.replace(/\D/g, "").length === 10,
  "Invalid phone number",
)

const partySchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
  representing: z.boolean(),
})

const agentContactSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
})

const clientsSectionSchema = z
  .object({
    buyers: z.array(partySchema),
    sellers: z.array(partySchema),
  })
  .superRefine((data, ctx) => {
    const hasBuyer = data.buyers.some((buyer) => buyer.firstName.trim() || buyer.lastName.trim())
    const hasSeller = data.sellers.some((seller) => seller.firstName.trim() || seller.lastName.trim())

    if (!hasBuyer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["buyers"],
        message: "At least one buyer is required",
      })
    }

    if (!hasSeller) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sellers"],
        message: "At least one seller is required",
      })
    }
  })

export const REPRESENTING_PARTY_OPTIONS = ["buyer", "seller"] as const;

export const transactionDialogSchema = z.object({
  checklistId: z.string().nullable().optional(),
  checklistTemplateId: z.string().nullable().optional(),
  address: z.string().trim().min(1, "Address is required"),
  price: z.string().trim().min(1, "Price is required"),
  representingParty: z.enum(REPRESENTING_PARTY_OPTIONS).nullable(),
  buyers: z.array(partySchema),
  sellers: z.array(partySchema),
  buyerAgent: agentContactSchema,
  sellerAgent: agentContactSchema,
  parcelNumber: z.string(),
  closeDate: z.string().trim().min(1, "Closing date is required"),
  mutualAcceptanceDate: z.string().trim().min(1, "Mutual acceptance date is required"),
  earnestMoney: z.string(),
  city: z.string(),
  state: z.string(),
  county: z.string(),
  psaType: z.string(),
  itemsThatStay: z.array(z.string()),
  itemsThatStayDraft: z.string(),
  titleCompany: z.string(),
  closingAgent: z.string(),
  escrowEmail: requiredEmailSchema,
  lender: z.string(),
  nwmlsNumber: z.string(),
  description: z.string(),
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      date: z.string(),
      calculation: z.string(),
      formName: z.string(),
      isSelected: z.boolean(),
      note: z.string().optional(),
    }),
  ),
})

export const EMPTY_FORM: TransactionFormData = {
  checklistId: null,
  checklistTemplateId: null,
  address: "",
  price: "",
  representingParty: null,
  buyers: [],
  sellers: [],
  buyerAgent: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  },
  sellerAgent: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  },
  parcelNumber: "",
  closeDate: "",
  mutualAcceptanceDate: "",
  earnestMoney: "",
  city: "",
  state: "",
  county: "",
  psaType: "Residential",
  itemsThatStay: [],
  itemsThatStayDraft: "",
  titleCompany: "",
  closingAgent: "",
  escrowEmail: "",
  lender: "",
  nwmlsNumber: "",
  description: "",
  tasks: [],
}

export const INITIAL_VERIFIED_SECTIONS: Record<SectionId, boolean> = {
  [TRANSACTION_DIALOG_SECTION.SUMMARY]: false,
  [TRANSACTION_DIALOG_SECTION.CLIENTS]: false,
  [TRANSACTION_DIALOG_SECTION.PROPERTY]: false,
  [TRANSACTION_DIALOG_SECTION.FORMS]: false,
}

export function createEmptySectionErrors(): Record<SectionId, ValidationErrors> {
  return {
    [TRANSACTION_DIALOG_SECTION.SUMMARY]: {},
    [TRANSACTION_DIALOG_SECTION.CLIENTS]: {},
    [TRANSACTION_DIALOG_SECTION.PROPERTY]: {},
    [TRANSACTION_DIALOG_SECTION.FORMS]: {},
  }
}

const summarySectionSchema = transactionDialogSchema.pick({
  address: true,
  price: true,
  closeDate: true,
  mutualAcceptanceDate: true,
})

const propertySectionSchema = transactionDialogSchema.pick({
  escrowEmail: true,
})

function buildValidationErrors(error: z.ZodError): ValidationErrors {
  return error.issues.reduce<ValidationErrors>((acc, issue) => {
    const [root, index, leaf] = issue.path

    if (
      (root === TRANSACTION_DIALOG_PARTY_TYPE.BUYERS ||
        root === TRANSACTION_DIALOG_PARTY_TYPE.SELLERS) &&
      typeof index === "number" &&
      (leaf === "email" || leaf === "phone")
    ) {
      const prefix = root === TRANSACTION_DIALOG_PARTY_TYPE.BUYERS ? "buyer" : "seller"
      const key = `${prefix}_${index}_${leaf}`
      if (!acc[key]) acc[key] = issue.message
      return acc
    }

    if (typeof root === "string") {
      if (!acc[root]) acc[root] = issue.message
    }

    return acc
  }, {})
}

function validateWithSchema<T>(schema: z.ZodType<T>, data: T): ValidationErrors {
  const result = schema.safeParse(data)
  if (result.success) return {}
  return buildValidationErrors(result.error)
}

export const SECTION_VALIDATORS: Record<
  SectionId,
  (data: TransactionFormData) => ValidationErrors
> = {
  [TRANSACTION_DIALOG_SECTION.SUMMARY]: (data) => validateWithSchema(summarySectionSchema, data),
  [TRANSACTION_DIALOG_SECTION.CLIENTS]: (data) => validateWithSchema(clientsSectionSchema, data),
  [TRANSACTION_DIALOG_SECTION.PROPERTY]: (data) => validateWithSchema(propertySectionSchema, data),
  [TRANSACTION_DIALOG_SECTION.FORMS]: (data) => {
    const hasSelectedTask = data.tasks.some((task) => task.isSelected);
    if (!hasSelectedTask) {
      return { tasks: "At least one task must be selected" };
    }
    return {} as ValidationErrors;
  },
}

export function formatPartyNames(parties: TransactionFormParty[]): string {
  return parties
    .map((party) => `${party.firstName} ${party.lastName}`.trim())
    .filter(Boolean)
    .join(", ")
}
