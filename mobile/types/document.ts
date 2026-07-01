/**
 * Domain types for document upload, analysis output, and form auto-fill.
 */

export const SUPPORTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;

export type SupportedFileType = (typeof SUPPORTED_FILE_TYPES)[number];

export interface DocumentUploadFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface DocumentUploadResult {
  fileId: string;
  filename: string;
  size: number;
  type: string;
  userUploadId?: string;
}

/** Legacy UI compatibility for inline uploaders. */
export interface AnalysisStatus {
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  error?: string;
  message?: string;
  filename: string;
}

export interface ExtractedFact {
  field_key: string;
  value: unknown;
  normalized?: unknown;
  confidence?: number;
  evidence?: {
    page?: number;
    text?: string;
    coordinates?: { x: number; y: number; width: number; height: number };
  };
}

export interface Form {
  id: string;
  name: string;
  description?: string;
  type: "FORM" | "TASK";
  dueDate?: string;
  calculated?: string;
  priority?: "low" | "medium" | "high";
  information?: string;
}

export interface DealSummary {
  propertyAddress?: string;
  cityState?: string;
  county?: string;
  psaType?: string;
  closingDate?: string;
  titleCompany?: string;
  purchasePrice?: number | string;
  earnestMoney?: number | string;
  mutualAcceptance?: string;
  closingOfficer?: string;
  closingAgentCompany?: string;
}

export interface ExtractedDataMetadata {
  extracted_facts?: ExtractedFact[];
  [key: string]: unknown;
}

/** Normalized extraction payload consumed by the Home upload flow and drawer. */
export interface ExtractedData {
  filename: string;
  data: Record<string, any>;
  confidence?: number | Record<string, number>;
  extractedFields?: string[];
  warnings?: string[];
  metadata?: ExtractedDataMetadata;
  forms?: Form[];
  dealSummary?: DealSummary;
}
