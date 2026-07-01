import { z } from "zod"

export const FIELD_LIMITS = {
  SHORT_TEXT: 120,
  NAME: 80,
  EMAIL: 254,
  PHONE: 20,
  ADDRESS: 255,
  CURRENCY: 32,
  DATE: 32,
  PARCEL_NUMBER: 64,
  NWMLS_NUMBER: 25,
  CADET_COMMAND: 80,
  DESCRIPTION: 5000,
  ITEM_TEXT: 200,
} as const

export const VALIDATION_PATTERNS = {
  PERSON_NAME: /^[\p{L} '-]+$/u,
  CITY_OR_STATE: /^[\p{L} .'-]+$/u,
  COMPANY_OR_LENDER: /^[\p{L}\p{N} .,&'/-]+$/u,
  PARCEL_NUMBER: /^[\p{L}\p{N} \-\/]+$/u,
  NWMLS_NUMBER: /^[\p{L}\p{N} \-\/]+$/u,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ITEM_TEXT: /^[\p{L}\p{N} .,&'()/-]+$/u,
  CADET_COMMAND: /^[a-zA-Z0-9][a-zA-Z0-9\s-]*$/,
} as const

export const VALIDATION_MESSAGES = {
  required: (label: string) => `${label} is required.`,
  maxLength: (label: string, max: number) =>
    `${label} must be ${max} characters or less.`,
  invalidEmail: "Invalid email.",
  invalidPersonName: (label: string) =>
    `${label} can only contain letters, spaces, apostrophes, and hyphens.`,
  invalidCityOrState: (label: string) =>
    `${label} can only contain letters, spaces, periods, apostrophes, and hyphens.`,
  invalidCompanyOrLender: (label: string) =>
    `${label} can only contain letters, numbers, spaces, and . , & ' / - characters.`,
  invalidParcelNumber:
    "Parcel number can only contain letters, numbers, spaces, hyphens, and slashes.",
  invalidNwmlsNumber:
    "NWMLS number can only contain letters, numbers, spaces, hyphens, and slashes.",
  invalidItemsThatStay:
    "Items that stay can only contain letters, numbers, spaces, and . , & ' ( ) / - characters.",
} as const

export const RULES = {
  firstName: {
    label: "First name",
    max: FIELD_LIMITS.NAME,
    pattern: VALIDATION_PATTERNS.PERSON_NAME,
    invalidMessage: VALIDATION_MESSAGES.invalidPersonName("First name"),
  },
  lastName: {
    label: "Last name",
    max: FIELD_LIMITS.NAME,
    pattern: VALIDATION_PATTERNS.PERSON_NAME,
    invalidMessage: VALIDATION_MESSAGES.invalidPersonName("Last name"),
  },
  city: {
    label: "City",
    max: FIELD_LIMITS.SHORT_TEXT,
    pattern: VALIDATION_PATTERNS.CITY_OR_STATE,
    invalidMessage: VALIDATION_MESSAGES.invalidCityOrState("City"),
  },
  state: {
    label: "State",
    max: FIELD_LIMITS.SHORT_TEXT,
    pattern: VALIDATION_PATTERNS.CITY_OR_STATE,
    invalidMessage: VALIDATION_MESSAGES.invalidCityOrState("State"),
  },
  county: {
    label: "County",
    max: FIELD_LIMITS.SHORT_TEXT,
    pattern: VALIDATION_PATTERNS.CITY_OR_STATE,
    invalidMessage: VALIDATION_MESSAGES.invalidCityOrState("County"),
  },
  titleCompany: {
    label: "Title company",
    max: FIELD_LIMITS.SHORT_TEXT,
    pattern: VALIDATION_PATTERNS.COMPANY_OR_LENDER,
    invalidMessage: VALIDATION_MESSAGES.invalidCompanyOrLender("Title company"),
  },
  closingAgent: {
    label: "Closing agent",
    max: FIELD_LIMITS.SHORT_TEXT,
    pattern: VALIDATION_PATTERNS.PERSON_NAME,
    invalidMessage: VALIDATION_MESSAGES.invalidPersonName("Closing agent"),
  },
  lender: {
    label: "Lender",
    max: FIELD_LIMITS.SHORT_TEXT,
    pattern: VALIDATION_PATTERNS.COMPANY_OR_LENDER,
    invalidMessage: VALIDATION_MESSAGES.invalidCompanyOrLender("Lender"),
  },
} as const

export const optionalTrimmedString = (label: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, VALIDATION_MESSAGES.maxLength(label, max))

export const requiredTrimmedString = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, VALIDATION_MESSAGES.required(label))
    .max(max, VALIDATION_MESSAGES.maxLength(label, max))

export const optionalPatternString = (
  label: string,
  max: number,
  pattern: RegExp,
  invalidMessage: string,
) =>
  optionalTrimmedString(label, max).refine(
    (value) => value.length === 0 || pattern.test(value),
    invalidMessage,
  )

export const requiredPatternString = (
  label: string,
  max: number,
  pattern: RegExp,
  invalidMessage: string,
) =>
  requiredTrimmedString(label, max).refine(
    (value) => pattern.test(value),
    invalidMessage,
  )

export const itemsThatStayItemSchema = requiredTrimmedString(
  "Items that stay",
  FIELD_LIMITS.ITEM_TEXT,
)

const optionalEmailSchema = optionalPatternString(
  "Email",
  FIELD_LIMITS.EMAIL,
  VALIDATION_PATTERNS.EMAIL,
  VALIDATION_MESSAGES.invalidEmail,
)

const requiredEscrowEmailSchema = requiredPatternString(
  "Escrow email",
  FIELD_LIMITS.EMAIL,
  VALIDATION_PATTERNS.EMAIL,
  VALIDATION_MESSAGES.invalidEmail,
)

const optionalPhoneSchema = z
  .string()
  .trim()
  .max(
    FIELD_LIMITS.PHONE,
    VALIDATION_MESSAGES.maxLength("Phone", FIELD_LIMITS.PHONE),
  )
  .refine(
    (value) => value.length === 0 || value.replace(/\D/g, "").length === 10,
    "Phone must be 10 digits.",
  )

export const transactionDetailPartySchema = z.object({
  firstName: optionalTrimmedString("First name", FIELD_LIMITS.NAME),
  lastName: optionalTrimmedString("Last name", FIELD_LIMITS.NAME),
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
  representing: z.boolean(),
})

export const transactionDetailAgentSchema = z.object({
  firstName: optionalTrimmedString("First name", FIELD_LIMITS.NAME),
  lastName: optionalTrimmedString("Last name", FIELD_LIMITS.NAME),
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
})

export { requiredEscrowEmailSchema }
