import { BuyerSeller } from "./transaction";

/**
 * Listing form data structure
 */
export interface ListingFormData {
  // Listing Summary
  listingType: string;
  listingPrice: string | number;
  listingDate: Date | null;
  expirationDate: Date | null;
  taxId: string;
  earnestMoney?: string | number;

  // Seller Info
  representing?: string;
  buyers: BuyerSeller[];
  sellers: BuyerSeller[];

  // Property Info
  address: string;
  county: string;
  area?: string;
  communityDistrict?: string;

  // Optional fields
  description?: string;
  userUploadIds?: string[];
}

/**
 * PSA form data structure
 */
export interface PSAFormData {
  // Transaction Summary
  pendDate: Date | null;
  closeDate: Date | null;
  salePrice: string | number;
  earnestMoney?: string | number;

  // Client Information
  representing?: string;
  buyers: BuyerSeller[];
  sellers: BuyerSeller[];

  // Property Information
  propertyAddress: string;
  cityState?: string;
  county: string;
  propertyType: string;
  parcelNumber?: string;
  nwmlsNumber?: string;
  description?: string;
  itemsThatStay?: string[];

  // Lender and Title Information
  lender?: string;
  titleCompany?: string;
  titleOfficer?: string;
  titleNumber?: string;
  closingOfficer?: string;
  escrowAgentEmail?: string;
  firmDocumentEmail?: string;

  // Forms and Tasks
  selectedTasks?: any[];

  // Optional fields
  userUploadIds?: string[];
}

/**
 * Transaction submission data for API
 */
export interface TransactionSubmissionData {
  amount: number;
  listing_price?: number;
  earnest_money?: number;
  description?: string;
  age?: string;
  date?: string;
  pend_date: string;
  close_date: string;
  address: string;
  city_state?: string;
  psa_type?: string | null;
  listing_type?: string | null;
  parcel_number?: string;
  items_that_stay?: string;
  lender?: string;
  title_co?: string;
  title_officer?: string;
  title_number?: string;
  escrow_officer?: string;
  nwmls_number?: string;
  buyers_and_sellers: string;
  selected_tasks?: any[];
  transaction_category: "PSA" | "LISTING";
  checklist_id?: string;
  team_id?: string;
  user_upload_ids?: string[];
  escrow_agent_email?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
