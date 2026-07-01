import {
  CONTACT_TYPES,
  CONTACT_TYPES_ARRAY,
  type ContactOrVendorType,
  type ContactRequiredField,
  type ContactType,
  getVendorSubcategories,
  isVendorType,
  VENDOR_TYPES_ARRAY,
  type VendorType,
} from "../constants"
import type {
  Contact,
  ContactFormData,
  ContactListResponse,
  ContactResult,
  CreateContactData,
} from "../types"

const BACKEND_TO_FRONTEND_TYPE: Record<string, string> = {
  LENDER: CONTACT_TYPES.LENDER,
  TITLE_COMPANY: CONTACT_TYPES.TITLING,
  ESCROW_CLOSER: CONTACT_TYPES.CLOSING,
  INSPECTOR: CONTACT_TYPES.INSPECTOR,
  VENDOR: CONTACT_TYPES.VENDOR,
  Lender: CONTACT_TYPES.LENDER,
  "Title company": CONTACT_TYPES.TITLING,
  "Title Company": CONTACT_TYPES.TITLING,
  "Escrow closer": CONTACT_TYPES.CLOSING,
  "Escrow Closer": CONTACT_TYPES.CLOSING,
  Inspector: CONTACT_TYPES.INSPECTOR,
  Vendor: CONTACT_TYPES.VENDOR,
}

const FRONTEND_TO_BACKEND_TYPE: Record<string, string> = {
  [CONTACT_TYPES.LENDER]: "Lender",
  [CONTACT_TYPES.TITLING]: "Title company",
  [CONTACT_TYPES.CLOSING]: "Escrow closer",
  [CONTACT_TYPES.INSPECTOR]: "Inspector",
  [CONTACT_TYPES.VENDOR]: "Vendor",
}

const CONTACT_TYPE_LOOKUP = new Map(
  CONTACT_TYPES_ARRAY.map((value) => [normalizeTypeKey(value), value]),
)

const VENDOR_TYPE_LOOKUP = new Map(
  VENDOR_TYPES_ARRAY.map((value) => [normalizeTypeKey(value), value]),
)

const TYPE_ALIAS_LOOKUP = new Map<string, ContactOrVendorType>([
  ["lender", CONTACT_TYPES.LENDER],
  ["title company", CONTACT_TYPES.TITLING],
  ["title", CONTACT_TYPES.TITLING],
  ["titling", CONTACT_TYPES.TITLING],
  ["escrow closer", CONTACT_TYPES.CLOSING],
  ["closing", CONTACT_TYPES.CLOSING],
  ["inspector", CONTACT_TYPES.INSPECTOR],
  ["vendor", CONTACT_TYPES.VENDOR],
  ["buyer", CONTACT_TYPES.BUYER],
  ["seller", CONTACT_TYPES.SELLER],
])

function normalizeTypeKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, " ")
}

function isKnownContactType(value: string): value is ContactType {
  return CONTACT_TYPE_LOOKUP.has(normalizeTypeKey(value))
}

function isKnownVendorType(value: string): value is VendorType {
  return VENDOR_TYPE_LOOKUP.has(normalizeTypeKey(value))
}

export function mapBackendTypeToFrontendType(type?: string | null): string {
  if (!type) {
    return CONTACT_TYPES.LENDER
  }

  const trimmedType = type.trim()
  const directMatch = BACKEND_TO_FRONTEND_TYPE[trimmedType]
  if (directMatch) {
    return directMatch
  }

  const normalizedType = normalizeTypeKey(trimmedType)
  const aliasMatch = TYPE_ALIAS_LOOKUP.get(normalizedType)
  if (aliasMatch) {
    return aliasMatch
  }

  const contactTypeMatch = CONTACT_TYPE_LOOKUP.get(normalizedType)
  if (contactTypeMatch) {
    return contactTypeMatch
  }

  const vendorTypeMatch = VENDOR_TYPE_LOOKUP.get(normalizedType)
  if (vendorTypeMatch) {
    return vendorTypeMatch
  }

  return trimmedType
}

export function mapFrontendTypeToBackendType(type: string): string {
  return FRONTEND_TO_BACKEND_TYPE[type] || type
}

export function normalizeContactResult(contactResult: ContactResult): Contact {
  return {
    id: contactResult.id,
    userId: contactResult.user?.id || "",
    vendorType: mapBackendTypeToFrontendType(
      contactResult.vendor_type,
    ) as ContactOrVendorType,
    companyName: contactResult.company_name,
    individualName: contactResult.individual_name,
    phoneNumber: contactResult.phone_number,
    email: contactResult.email,
    website: contactResult.website,
    license: contactResult.license,
    notes: contactResult.notes,
    isFavorite: contactResult.is_favorite,
    externalId: contactResult.external_id,
    externalProvider: contactResult.external_provider,
    aiCategorized: contactResult.ai_categorized,
    createdAt: contactResult.created_at,
    updatedAt: contactResult.updated_at,
  }
}

export function normalizeContact(
  contact:
    | Contact
    | ContactResult
    | CreateContactData
    | ContactFormData
    | null
    | undefined,
): Contact | null {
  if (!contact) {
    return null
  }

  if ("userId" in contact && "createdAt" in contact) {
    return contact as Contact
  }

  if ("vendor_type" in contact) {
    return normalizeContactResult(contact as ContactResult)
  }

  let createData = contact as CreateContactData
  if ("contactType" in contact) {
    const formData = contact as ContactFormData
    const finalType =
      formData.contactType === CONTACT_TYPES.VENDOR && formData.vendorType
        ? formData.vendorType
        : formData.contactType

    createData = {
      companyName: formData.companyName,
      individualName: formData.individualName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      website: formData.website,
      license: formData.license,
      notes: formData.notes,
      isFavorite: formData.isFavorite,
      vendorType: mapFrontendTypeToBackendType(finalType),
    }
  }

  return {
    id: "",
    userId: "",
    vendorType: (createData.vendorType ||
      CONTACT_TYPES.LENDER) as ContactOrVendorType,
    companyName: createData.companyName,
    individualName: createData.individualName,
    phoneNumber: createData.phoneNumber,
    email: createData.email,
    website: createData.website,
    license: createData.license,
    notes: createData.notes,
    isFavorite: createData.isFavorite || false,
    externalId: createData.externalId,
    externalProvider: createData.externalProvider,
    createdAt: "",
    updatedAt: "",
  }
}

export function mapContactToFormData(
  contact: Contact | ContactResult | CreateContactData | null | undefined,
): ContactFormData | null {
  const normalizedContact = normalizeContact(contact)
  if (!normalizedContact) {
    return null
  }

  const { contactType, vendorType } = getContactFormType(
    normalizedContact.vendorType,
  )

  return {
    contactType,
    vendorType,
    companyName: normalizedContact.companyName || "",
    individualName: normalizedContact.individualName || "",
    phoneNumber: normalizedContact.phoneNumber || "",
    email: normalizedContact.email || "",
    website: normalizedContact.website || "",
    license: normalizedContact.license || "",
    notes: normalizedContact.notes || "",
    isFavorite: normalizedContact.isFavorite,
  }
}

export function normalizeContactFormData(
  values: ContactFormData,
): CreateContactData {
  const finalType =
    values.contactType === CONTACT_TYPES.VENDOR && values.vendorType
      ? values.vendorType
      : values.contactType

  return {
    companyName: values.companyName?.trim() || undefined,
    individualName: values.individualName?.trim() || undefined,
    phoneNumber: values.phoneNumber?.trim() || undefined,
    email: values.email?.trim() || undefined,
    website: values.website?.trim() || undefined,
    license: values.license?.trim() || undefined,
    notes: values.notes?.trim() || undefined,
    isFavorite: values.isFavorite || false,
    vendorType: mapFrontendTypeToBackendType(finalType),
  }
}

export function mapContactDataToApiPayload(
  data: Partial<CreateContactData>,
): Record<string, unknown> {
  return {
    vendor_type: data.vendorType,
    company_name: data.companyName,
    individual_name: data.individualName,
    phone_number: data.phoneNumber,
    email: data.email,
    website: data.website,
    license: data.license,
    notes: data.notes,
    is_favorite: data.isFavorite,
    external_id: data.externalId,
    external_provider: data.externalProvider,
  }
}

export function extractContactsListResponse(
  payload: unknown,
): ContactListResponse {
  if (
    payload &&
    typeof payload === "object" &&
    "contacts" in payload &&
    Array.isArray((payload as { contacts?: unknown }).contacts)
  ) {
    const data = payload as {
      contacts: ContactResult[]
      count?: number
      provider?: string
    }

    return {
      contacts: data.contacts,
      count: data.count ?? data.contacts.length,
      provider: data.provider,
    }
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    const data = payload as { data: ContactResult[]; count?: number }
    return {
      contacts: data.data,
      count: data.count ?? data.data.length,
    }
  }

  if (Array.isArray(payload)) {
    return {
      contacts: payload as ContactResult[],
      count: payload.length,
    }
  }

  return {
    contacts: [],
    count: 0,
  }
}

export function extractContactResult(payload: unknown): ContactResult | null {
  if (!payload || typeof payload !== "object") {
    return null
  }

  if ("data" in payload && payload.data && typeof payload.data === "object") {
    return payload.data as ContactResult
  }

  if ("id" in payload) {
    return payload as ContactResult
  }

  return null
}

export function getContactDisplayName(contact: ContactResult): string {
  return (
    contact.individual_name ||
    contact.company_name ||
    contact.display_name ||
    contact.full_name ||
    "Unnamed Contact"
  )
}

export function getContactSubtitle(contact: ContactResult): string {
  const parts = [contact.phone_number, contact.email].filter(Boolean)
  return parts.length > 0 ? parts.join(" • ") : "No contact details"
}

export function getContactBadgeLabel(contact: ContactResult): string {
  return mapBackendTypeToFrontendType(contact.vendor_type)
}

export function getContactFormType(
  value: string | undefined,
): { contactType: ContactType; vendorType?: VendorType } {
  const normalizedValue = mapBackendTypeToFrontendType(value)

  if (isVendorType(normalizedValue)) {
    return {
      contactType: CONTACT_TYPES.VENDOR,
      vendorType: normalizedValue as VendorType,
    }
  }

  if (isKnownContactType(normalizedValue)) {
    return {
      contactType: normalizedValue,
    }
  }

  return {
    contactType: CONTACT_TYPES.LENDER,
  }
}
