export const CONTACT_TYPES = {
  LENDER: "Lender",
  TITLING: "Titling",
  CLOSING: "Closing",
  INSPECTOR: "Inspector",
  VENDOR: "Vendor",
  BUYER: "Buyer",
  SELLER: "Seller",
} as const

export const VENDOR_TYPES = {
  SEPTIC_COMPANY: "Septic Company",
  GENERAL_CONTRACTOR: "General Contractor",
  WELL_INSPECTOR: "Well Inspector",
  ELECTRICIAN: "Electrician",
  HVAC: "Hvac",
  PEST_CONTROL: "Pest Control",
  HOME_INSURANCE_AGENT: "Home Insurance Agent",
} as const

export const CONTACT_TYPES_ARRAY = Object.values(CONTACT_TYPES)
export const VENDOR_TYPES_ARRAY = Object.values(VENDOR_TYPES)

export type ContactType = (typeof CONTACT_TYPES)[keyof typeof CONTACT_TYPES]
export type VendorType = (typeof VENDOR_TYPES)[keyof typeof VENDOR_TYPES]
export type ContactOrVendorType = ContactType | VendorType

export type ContactRequiredField =
  | "contactType"
  | "vendorType"
  | "companyName"
  | "individualName"
  | "email"
  | "phoneNumber"
  | "website"
  | "notes"
  | "license"

export interface ContactTypeConfig {
  type: ContactOrVendorType
  subcategories?: ContactTypeConfig[]
  requiredFields: ContactRequiredField[]
}

const defaultRequiredFields: ContactRequiredField[] = [
  "contactType",
  "companyName",
  "individualName",
  "email",
]

export const contactTypesConfig: ContactTypeConfig[] = [
  {
    type: CONTACT_TYPES.LENDER,
    requiredFields: [
      "contactType",
      "companyName",
      "individualName",
      "email",
    ],
  },
  {
    type: CONTACT_TYPES.TITLING,
    requiredFields: [
      "contactType",
      "companyName",
      "individualName",
      "email",
    ],
  },
  {
    type: CONTACT_TYPES.CLOSING,
    requiredFields: [
      "contactType",
      "companyName",
      "individualName",
      "email",
    ],
  },
  {
    type: CONTACT_TYPES.INSPECTOR,
    requiredFields: [
      "contactType",
      "companyName",
      "individualName",
      "email",
    ],
  },
  {
    type: CONTACT_TYPES.VENDOR,
    requiredFields: ["contactType", "companyName", "individualName", "email"],
    subcategories: [
      {
        type: VENDOR_TYPES.SEPTIC_COMPANY,
        requiredFields: defaultRequiredFields,
      },
      {
        type: VENDOR_TYPES.GENERAL_CONTRACTOR,
        requiredFields: defaultRequiredFields,
      },
      {
        type: VENDOR_TYPES.WELL_INSPECTOR,
        requiredFields: defaultRequiredFields,
      },
      {
        type: VENDOR_TYPES.ELECTRICIAN,
        requiredFields: defaultRequiredFields,
      },
      {
        type: VENDOR_TYPES.HVAC,
        requiredFields: defaultRequiredFields,
      },
      {
        type: VENDOR_TYPES.PEST_CONTROL,
        requiredFields: defaultRequiredFields,
      },
      {
        type: VENDOR_TYPES.HOME_INSURANCE_AGENT,
        requiredFields: defaultRequiredFields,
      },
    ],
  },
]

export const CONTACT_VIEW_MODES = {
  GRID: "GRID",
  LIST: "LIST",
} as const

export const ALL_VENDOR_TYPE = "all"

export const CONTACT_QUERY_KEYS = {
  all: ["contacts"] as const,
  lists: () => [...CONTACT_QUERY_KEYS.all, "list"] as const,
  list: (search?: string, vendorType?: string) =>
    [
      ...CONTACT_QUERY_KEYS.lists(),
      search?.trim() || "",
      vendorType || ALL_VENDOR_TYPE,
    ] as const,
} as const

export const getVendorSubcategories = (): ContactTypeConfig[] => {
  const vendorConfig = contactTypesConfig.find(
    (config) => config.type === CONTACT_TYPES.VENDOR,
  )

  return vendorConfig?.subcategories || []
}

export const getContactTypeConfig = (type: string): ContactTypeConfig => {
  const mainConfig = contactTypesConfig.find((config) => config.type === type)
  if (mainConfig) {
    return mainConfig
  }

  const vendorConfig = getVendorSubcategories().find(
    (config) => config.type === type,
  )
  if (vendorConfig) {
    return vendorConfig
  }

  return {
    type: CONTACT_TYPES.LENDER,
    requiredFields: defaultRequiredFields,
  }
}

export const isVendorType = (type: string): boolean => {
  return getVendorSubcategories().some((config) => config.type === type)
}
