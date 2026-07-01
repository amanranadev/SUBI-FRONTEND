import { ListingFormData } from "@/types/transactionForm";
import { ExtractedData } from "@/services/documentService";

export type ListingWizardStep = "type" | "upload" | "form";

export interface CreateListingModalProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export interface ListingWizardState {
  currentStep: ListingWizardStep;
  listingType: string | null;
  uploadedFileId: string | null;
  extractedData: ExtractedData | null;
  formData: Partial<ListingFormData>;
}

export const LISTING_TYPES = {
  RESIDENTIAL: "RESIDENTIAL",
  VACANT_LAND: "VACANT_LAND",
  MANUFACTURED_HOME_LEASED_LAND: "MANUFACTURED_HOME_LEASED_LAND",
  CONDOMINIUM: "CONDOMINIUM",
  MULTI_FAMILY: "MULTI_FAMILY",
  COMMERCIAL: "COMMERCIAL",
} as const;

export type ListingType = typeof LISTING_TYPES[keyof typeof LISTING_TYPES];

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  RESIDENTIAL: "Residential",
  VACANT_LAND: "Vacant Land",
  MANUFACTURED_HOME_LEASED_LAND: "Manufactured Home",
  CONDOMINIUM: "Condo",
  MULTI_FAMILY: "Multifamily",
  COMMERCIAL: "Commercial",
};
