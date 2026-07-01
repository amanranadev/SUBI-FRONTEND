export const EXTRACTION_STATUS = {
  PENDING: "pending",
  EXTRACTING: "extracting",
  EXTRACTED: "extracted",
  FAILED: "extraction_failed",
} as const

export type ExtractionStatus =
  (typeof EXTRACTION_STATUS)[keyof typeof EXTRACTION_STATUS]

export const AI_PROCESSING_STATUS = {
  NOT_PROCESSED: "not_processed",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const

export type AiProcessingStatus =
  (typeof AI_PROCESSING_STATUS)[keyof typeof AI_PROCESSING_STATUS]

export const PROCESSING_STEP = {
  IDLE: "idle",
  UPLOADING: "uploading",
  EXTRACTING: "extracting",
  ANALYZING: "analyzing",
  COMPLETE: "complete",
  ERROR: "error",
} as const

export type ProcessingStep =
  (typeof PROCESSING_STEP)[keyof typeof PROCESSING_STEP]

export const TRANSACTION_CATEGORY = {
  PSA: "PSA",
  LISTING: "LISTING",
} as const

export type TransactionCategory =
  (typeof TRANSACTION_CATEGORY)[keyof typeof TRANSACTION_CATEGORY]

export const TRANSACTION_API_STATUS = {
  STARTED: "STARTED",
  PENDING_INSPECTION: "PENDING_INSPECTION",
} as const

export type TransactionApiStatus =
  (typeof TRANSACTION_API_STATUS)[keyof typeof TRANSACTION_API_STATUS]

// Mirrors legacy Web typing to keep category/listing_type integration consistent.
export const TRANSACTION_LISTING_TYPE = {
  RESIDENTIAL: "RESIDENTIAL",
  VACANT_LAND: "VACANT_LAND",
  MANUFACTURED_HOME_LEASED_LAND: "MANUFACTURED_HOME_LEASED_LAND",
  CONDOMINIUM: "CONDOMINIUM",
  MULTI_FAMILY: "MULTI_FAMILY",
  COMMERCIAL: "COMMERCIAL",
} as const

export type TransactionListingType =
  (typeof TRANSACTION_LISTING_TYPE)[keyof typeof TRANSACTION_LISTING_TYPE]

export const PSA_TYPE = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
  LAND: "Land",
} as const

export const PROCESSOR_VERSION = {
  BUILT_IN: "2.0",
  THIRD_PARTY: "2.5",
} as const

export const STEP_STATE = {
  DONE: "done",
  ACTIVE: "active",
  PENDING: "pending",
} as const

export type StepState = (typeof STEP_STATE)[keyof typeof STEP_STATE]

// --- API payload / query constants (transaction service) ---

export const REPRESENTING_PARTY_API = {
  BUYER: "BUYER",
  SELLER: "SELLER",
} as const

export const TRANSACTION_TASK_TYPE = {
  FORM: "FORM",
  TASK: "TASK",
} as const

export const FETCH_USER_TRANSACTIONS_FILTER = {
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const

export type FetchUserTransactionsFilter =
  (typeof FETCH_USER_TRANSACTIONS_FILTER)[keyof typeof FETCH_USER_TRANSACTIONS_FILTER]
