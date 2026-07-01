import type {
  ContactOrVendorType,
  ContactType,
  VendorType,
} from "./constants"

export type ContactProvider = "google_oauth2" | "microsoft_graph"

export interface Contact {
  id: string
  userId: string
  vendorType: ContactOrVendorType
  companyName?: string
  individualName?: string
  phoneNumber?: string
  email?: string
  website?: string
  license?: string
  notes?: string
  isFavorite: boolean
  externalId?: string
  externalProvider?: ContactProvider
  aiCategorized?: boolean
  createdAt: string
  updatedAt: string
}

export interface ContactResult {
  id: string
  company_name?: string
  individual_name?: string
  phone_number?: string
  email?: string
  website?: string
  license?: string
  notes?: string
  is_favorite: boolean
  created_at: string
  updated_at: string
  external_id?: string
  external_provider?: ContactProvider
  display_name?: string
  full_name?: string
  is_imported?: boolean
  provider_display_name?: string
  vendor_type: ContactOrVendorType | string
  ai_confidence?: number | string
  ai_categorized?: boolean
  ai_reasoning?: string
  confidence_percentage?: string
  high_confidence_ai?: boolean
  user?: {
    id: string
    name?: string
    email?: string
  }
}

export interface ContactListResponse {
  contacts: ContactResult[]
  count: number
  provider?: string
}

export interface CreateContactData {
  companyName?: string
  individualName?: string
  phoneNumber?: string
  email?: string
  website?: string
  license?: string
  notes?: string
  externalId?: string
  externalProvider?: ContactProvider
  vendorType: ContactOrVendorType | string
  isFavorite?: boolean
}

export interface UpdateContactData extends Partial<CreateContactData> {}

export interface ContactFilters {
  vendorType?: ContactOrVendorType | string
  provider?: ContactProvider
  favorites?: boolean
  search?: string
  sortBy?: "name" | "companyName" | "createdAt"
  sortDirection?: "asc" | "desc"
}

export interface ContactFormData {
  contactType: ContactType
  vendorType?: VendorType
  companyName?: string
  individualName?: string
  phoneNumber?: string
  email?: string
  website?: string
  license?: string
  notes?: string
  isFavorite: boolean
}
