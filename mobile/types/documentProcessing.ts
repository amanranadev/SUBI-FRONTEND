import type { DocumentUploadFile, ExtractedData, AnalysisStatus } from "@/types/document";
import type { ApiError } from "@/types/auth";
import type {
  AiProcessingStatus,
  ExtractionStatus,
  ProcessingState,
  TransactionCategory,
} from "@/constants/documentProcessing";

/** API / orchestration layer types (not form domain). */

export type RawTransactionData = Record<string, unknown>;

export type FileUploadResponse = {
  success?: boolean;
  file?: {
    id: string | number;
    filename?: string;
    user_upload_id?: string;
    size?: number;
    type?: string;
  };
  fileId?: string;
  filename?: string;
};

export type FileStatusFile = {
  id: number | string;
  filename?: string;
  extraction_status?: ExtractionStatus;
  ai_processing_status?: AiProcessingStatus;
  analysis_status?: AiProcessingStatus;
  ai_processing_error_message?: string | null;
  transaction_data?: RawTransactionData;
  user_upload_id?: string;
};

export type FileStatusResponse = {
  success?: boolean;
  file?: FileStatusFile;
};

export type AnalysisMetadata = {
  transaction_category?: TransactionCategory;
  processor_version?: string;
  psa_type?: string;
  skip_cache?: boolean;
};

export type UploadParams = {
  uri: string;
  name: string;
  type: string;
  size?: number;
  transactionCategory: TransactionCategory;
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
};

export type UploadResult = {
  fileId: string;
  filename: string;
  size: number;
  type: string;
  userUploadId?: string;
};

export type PollOptions = {
  intervalMs?: number;
  timeoutMs?: number;
  onProgress?: (percent: number, message: string) => void;
  signal?: AbortSignal;
};

export type PollResult = {
  transactionData: RawTransactionData;
  fileId: string;
  userUploadId?: string;
};

export type ProcessingProgress = {
  percent: number;
  message: string;
};

export type ProcessingContext = {
  state: ProcessingState;
  fileId: string | null;
  filename: string | null;
  userUploadId: string | null;
  progress: ProcessingProgress;
  extractedData: ExtractedData | null;
  error: ApiError | null;
};

export type ProcessingCallbacks = {
  onStateChange?: (state: ProcessingState) => void;
  onProgress?: (progress: ProcessingProgress) => void;
  onUploadComplete?: (fileId: string) => void;
  onExtractionComplete?: (data: ExtractedData) => void;
  onError?: (error: ApiError) => void;
};

export interface UseDocumentProcessingOptions {
  transactionCategory?: TransactionCategory;
  maxDuration?: number;
  onUploadComplete?: (fileId: string) => void;
  onExtractionComplete?: (data: ExtractedData) => void;
  onError?: (error: ApiError) => void;
  onTimeout?: () => void;
  onProcessingStateChange?: (isProcessing: boolean) => void;
}

export interface UseDocumentProcessingReturn {
  processDocument: (file: DocumentUploadFile) => Promise<void>;
  retryAnalysis: () => Promise<void>;
  cancel: () => void;
  reset: () => void;
  state: ProcessingState;
  fileId: string | null;
  filename: string | null;
  extractedData: ExtractedData | null;
  error: ApiError | null;
  uploadProgress: number;
  analysisProgress: number;
  overallProgress: number;
  progressMessage: string;
  analysisStatus: AnalysisStatus | null;
  isUploading: boolean;
  isAnalyzing: boolean;
  isComplete: boolean;
  isFailed: boolean;
}
