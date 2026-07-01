import type { StepperItem } from "@/components/Stepper";

export const EXTRACTION_STATUS = {
  PENDING: "pending",
  EXTRACTING: "extracting",
  EXTRACTED: "extracted",
  FAILED: "extraction_failed",
} as const;

export type ExtractionStatus =
  (typeof EXTRACTION_STATUS)[keyof typeof EXTRACTION_STATUS];

export const AI_PROCESSING_STATUS = {
  NOT_PROCESSED: "not_processed",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type AiProcessingStatus =
  (typeof AI_PROCESSING_STATUS)[keyof typeof AI_PROCESSING_STATUS];

export const PROCESSING_STATE = {
  IDLE: "idle",
  UPLOADING: "uploading",
  EXTRACTING: "extracting",
  ANALYZING: "analyzing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type ProcessingState =
  (typeof PROCESSING_STATE)[keyof typeof PROCESSING_STATE];

export const TRANSACTION_CATEGORY = {
  PSA: "PSA",
  LISTING: "LISTING",
} as const;

export type TransactionCategory =
  (typeof TRANSACTION_CATEGORY)[keyof typeof TRANSACTION_CATEGORY];

export const PROCESSOR_VERSION = {
  BUILT_IN: "2.0",
  THIRD_PARTY: "2.5",
} as const;

export const FILE_ENDPOINTS = {
  upload: "/file/upload",
  status: (id: string | number) => `/file/${id}/status`,
  analyze: (id: string | number) => `/file/${id}/analyze`,
} as const;

export const MAX_CONSECUTIVE_POLL_FAILURES = 3;
export const DEFAULT_POLL_INTERVAL_MS = 1_500;
export const DEFAULT_POLL_TIMEOUT_MS = 5 * 60 * 1_000;
export const EXTRACTION_WAIT_TIMEOUT_MS = 90_000;
export const UPLOAD_TIMEOUT_MS = 300_000;

/** Home upload stepper labels — presentation only. */
export const PROCESSING_WORKFLOW_STEPS: StepperItem[] = [
  {
    id: "upload",
    label: "Upload",
    icon: "check-circle",
  },
  {
    id: "text-extraction",
    label: "Text Extraction",
    icon: "document",
  },
  {
    id: "ai-analysis",
    label: "AI Analysis",
    icon: "ai-analysis",
  },
];
