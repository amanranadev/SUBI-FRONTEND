import { BuyerSeller, BuyersAndSellers } from "@/types/transaction";
import { ListingFormData, PSAFormData, TransactionSubmissionData, ValidationResult } from "@/types/transactionForm";
import { formatDateForAPI } from "./dateFormatUtils";
import { parseCurrency } from "./currencyUtils";

/**
 * Normalizes listing form data to API format
 * @param data - Listing form data
 * @returns Normalized transaction submission data
 */
export function normalizeListingFormData(data: ListingFormData): TransactionSubmissionData {
  const amount = parseCurrency(data.listingPrice?.toString() || "0");
  const listingPrice = amount;

  // Format dates - validate required dates
  const listingDate = formatDateForAPI(data.listingDate);
  const expirationDate = formatDateForAPI(data.expirationDate);
  
  if (!listingDate) {
    throw new Error("Listing date is required and must be valid");
  }
  if (!expirationDate) {
    throw new Error("Expiration date is required and must be valid");
  }

  // Build address with additional info
  let fullAddress = data.address || "";
  const addressParts: string[] = [];
  
  if (data.county) addressParts.push(data.county);
  if (data.area) addressParts.push(data.area);
  if (data.communityDistrict) addressParts.push(data.communityDistrict);
  
  if (addressParts.length > 0) {
    fullAddress = `${fullAddress}, ${addressParts.join(", ")}`;
  }

  // Serialize buyers and sellers
  const buyersAndSellers: BuyersAndSellers = {
    buyers: data.buyers || [],
    sellers: data.sellers || [],
  };

  const earnestMoney = data.earnestMoney ? parseCurrency(data.earnestMoney.toString()) : undefined;

  return {
    amount,
    listing_price: listingPrice,
    earnest_money: earnestMoney,
    date: listingDate,
    pend_date: listingDate,
    close_date: expirationDate,
    address: fullAddress,
    city_state: data.cityState,
    listing_type: data.listingType || null,
    nwmls_number: data.taxId || undefined,
    description: data.description || `Listing for $${amount.toLocaleString()}`,
    buyers_and_sellers: JSON.stringify(buyersAndSellers),
    selected_tasks: [],
    transaction_category: "LISTING",
    user_upload_ids: data.userUploadIds || [],
  };
}

/**
 * Normalizes PSA form data to API format
 * @param data - PSA form data
 * @returns Normalized transaction submission data
 */
export function normalizePSAFormData(data: PSAFormData): TransactionSubmissionData {
  const amount = parseCurrency(data.salePrice?.toString() || "0");
  const earnestMoney = data.earnestMoney ? parseCurrency(data.earnestMoney.toString()) : undefined;

  // Format dates - validate required dates
  const pendDate = formatDateForAPI(data.pendDate);
  const closeDate = formatDateForAPI(data.closeDate);
  
  const dateLogData = {location:'transactionFormUtils.ts:72',message:'normalizePSAFormData - date formatting',data:{pendDateRaw:data.pendDate,pendDateFormatted:pendDate,closeDateRaw:data.closeDate,closeDateFormatted:closeDate,pendDateType:typeof data.pendDate,closeDateType:typeof data.closeDate},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'};
  console.log('🔍 normalizePSAFormData - date formatting:', dateLogData);
  
  if (!pendDate) {
    throw new Error("Pending date is required and must be valid");
  }
  if (!closeDate) {
    throw new Error("Closing date is required and must be valid");
  }

  // Build address
  let fullAddress = data.propertyAddress || "";
  if (data.cityState) {
    fullAddress = `${fullAddress}, ${data.cityState}`;
  }

  // Handle items that stay
  let itemsThatStay: string | undefined;
  if (data.itemsThatStay && data.itemsThatStay.length > 0) {
    if (Array.isArray(data.itemsThatStay)) {
      itemsThatStay = JSON.stringify(data.itemsThatStay);
    } else {
      try {
        JSON.parse(data.itemsThatStay as any);
        itemsThatStay = data.itemsThatStay as any;
      } catch {
        itemsThatStay = JSON.stringify([data.itemsThatStay]);
      }
    }
  }

  // Serialize buyers and sellers
  const buyersAndSellers: BuyersAndSellers = {
    buyers: data.buyers || [],
    sellers: data.sellers || [],
  };

  const normalizedData = {
    amount,
    earnest_money: earnestMoney,
    date: pendDate, // Backend requires 'date' field - use pendDate as the primary date
    pend_date: pendDate,
    close_date: closeDate,
    address: fullAddress,
    city_state: data.cityState,
    psa_type: data.propertyType || null,
    parcel_number: data.parcelNumber,
    items_that_stay: itemsThatStay,
    lender: data.lender,
    title_co: data.titleCompany,
    title_officer: data.titleOfficer,
    title_number: data.titleNumber,
    escrow_officer: data.closingOfficer,
    escrow_agent_email: data.escrowAgentEmail,
    nwmls_number: data.nwmlsNumber,
    description: data.description || `Transaction for $${amount.toLocaleString()}`,
    buyers_and_sellers: JSON.stringify(buyersAndSellers),
    selected_tasks: data.selectedTasks || [],
    transaction_category: "PSA",
    user_upload_ids: data.userUploadIds || [],
  };
  
  const logData = {location:'transactionFormUtils.ts:137',message:'normalizePSAFormData - final normalized data',data:{hasAmount:!!normalizedData.amount,amount:normalizedData.amount,hasDate:!!normalizedData.date,date:normalizedData.date,hasAddress:!!normalizedData.address,address:normalizedData.address,hasTransactionCategory:!!normalizedData.transaction_category,transactionCategory:normalizedData.transaction_category,allKeys:Object.keys(normalizedData)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'};
  console.log('🔍 normalizePSAFormData - final normalized data:', logData);
  
  return normalizedData;
}

/**
 * Validates a single buyer or seller entry
 * Note: Email is not required per person - we only require at least one email across all buyers/sellers
 */
function validateBuyerSeller(person: BuyerSeller, type: string, index: number): string[] {
  const errors: string[] = [];
  const label = `${type} ${index + 1}`;

  if (!person.firstName || person.firstName.trim() === "") {
    errors.push(`${label}: First name is required`);
  }

  if (!person.lastName || person.lastName.trim() === "") {
    errors.push(`${label}: Last name is required`);
  }

  // Only validate email format if email is provided (email is optional per person)
  if (person.email && person.email.trim() !== "" && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(person.email)) {
    errors.push(`${label}: Invalid email format`);
  }

  return errors;
}

/**
 * Validates listing form data
 * @param data - Partial listing form data to validate
 * @returns Validation result with errors
 */
export function validateListingFormData(data: Partial<ListingFormData>): ValidationResult {
  const errors: Record<string, string> = {};

  // Listing type is always provided from initial selection, no need to validate

  if (!data.listingPrice || parseCurrency(data.listingPrice.toString()) <= 0) {
    errors.listingPrice = "Listing price is required and must be greater than 0";
  }

  if (!data.listingDate) {
    errors.listingDate = "Listing date is required";
  }

  if (!data.expirationDate) {
    errors.expirationDate = "Expiration date is required";
  }
  // Removed validation that expiration date must be after listing date
  // as per requirements: expiration date can be before listing date

  if (!data.taxId || data.taxId.trim() === "") {
    errors.taxId = "Tax ID is required";
  }

  if (!data.address || data.address.trim() === "") {
    errors.address = "Address is required";
  }

  if (!data.county || data.county.trim() === "") {
    errors.county = "County is required";
  }

  // Validate buyers
  if (data.buyers && data.buyers.length > 0) {
    const buyerErrors: string[] = [];
    data.buyers.forEach((buyer, index) => {
      buyerErrors.push(...validateBuyerSeller(buyer, "Buyer", index));
    });
    if (buyerErrors.length > 0) {
      errors.buyers = buyerErrors.join("; ");
    }
  }

  // Validate sellers
  if (data.sellers && data.sellers.length > 0) {
    const sellerErrors: string[] = [];
    data.sellers.forEach((seller, index) => {
      sellerErrors.push(...validateBuyerSeller(seller, "Seller", index));
    });
    if (sellerErrors.length > 0) {
      errors.sellers = sellerErrors.join("; ");
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates PSA form data
 * @param data - Partial PSA form data to validate
 * @returns Validation result with errors
 */
export function validatePSAFormData(data: Partial<PSAFormData>): ValidationResult {
  const errors: Record<string, string> = {};

  // Required fields
  if (!data.pendDate) {
    errors.pendDate = "Pending date is required";
  }

  if (!data.closeDate) {
    errors.closeDate = "Closing date is required";
  } else if (data.pendDate && data.closeDate && data.closeDate <= data.pendDate) {
    errors.closeDate = "Closing date must be after pending date";
  }

  if (!data.salePrice || parseCurrency(data.salePrice.toString()) <= 0) {
    errors.salePrice = "Sale price is required and must be greater than 0";
  }

  if (!data.propertyAddress || data.propertyAddress.trim() === "") {
    errors.propertyAddress = "Property address is required";
  }

  if (!data.county || data.county.trim() === "") {
    errors.county = "County is required";
  }

  if (!data.propertyType || data.propertyType.trim() === "") {
    errors.propertyType = "Property type is required";
  }

  // Escrow agent email is required and must be valid format
  if (!data.escrowAgentEmail || data.escrowAgentEmail.trim() === "") {
    errors.escrowAgentEmail = "Escrow agent email is required";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.escrowAgentEmail)) {
    errors.escrowAgentEmail = "Invalid escrow agent email format";
  }

  // Validate buyers
  if (data.buyers && data.buyers.length > 0) {
    const buyerErrors: string[] = [];
    data.buyers.forEach((buyer, index) => {
      buyerErrors.push(...validateBuyerSeller(buyer, "Buyer", index));
    });
    if (buyerErrors.length > 0) {
      errors.buyers = buyerErrors.join("; ");
    }
  }

  // Validate sellers
  if (data.sellers && data.sellers.length > 0) {
    const sellerErrors: string[] = [];
    data.sellers.forEach((seller, index) => {
      sellerErrors.push(...validateBuyerSeller(seller, "Seller", index));
    });
    if (sellerErrors.length > 0) {
      errors.sellers = sellerErrors.join("; ");
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Parses buyers and sellers from JSON string
 * @param jsonString - JSON string from API
 * @returns BuyersAndSellers object or empty arrays
 */
export function parseBuyersAndSellers(jsonString: string | null | undefined): BuyersAndSellers {
  if (!jsonString) {
    return { buyers: [], sellers: [] };
  }

  try {
    const parsed = JSON.parse(jsonString);
    return {
      buyers: Array.isArray(parsed.buyers) ? parsed.buyers : [],
      sellers: Array.isArray(parsed.sellers) ? parsed.sellers : [],
    };
  } catch (error) {
    console.error("❌ Error parsing buyers and sellers:", error);
    return { buyers: [], sellers: [] };
  }
}
