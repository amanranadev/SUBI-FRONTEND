import type {
  AiProcessingStatus,
  ExtractionStatus,
} from "@/features/transactions/constants";

export type DocumentFileRecord = {
  filename: string;
  contentType: string;
  byteSize: number;
  url: string;
  downloadUrl: string | null;
  createdAt: string | null;
};

export type DocumentRecord = {
  id: string;
  userId: string | null;
  uploadedBy: string | null;
  relatedTransactionId: string | null;
  relatedTransactionAddress: string | null;
  aiProcessingStatus: AiProcessingStatus;
  extractionStatus: ExtractionStatus;
  aiProcessingResult: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  file: DocumentFileRecord | null;
};

export type UserUploadApiFile = {
  filename?: string | null;
  contentType?: string | null;
  content_type?: string | null;
  byteSize?: number | null;
  byte_size?: number | null;
  url?: string | null;
  downloadUrl?: string | null;
  download_url?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
};

export type UserUploadApiRecord = {
  id?: string | number | null;
  userId?: string | number | null;
  user_id?: string | number | null;
  uploadedBy?: string | null;
  uploaded_by?: string | null;
  relatedTransactionId?: string | number | null;
  related_transaction_id?: string | number | null;
  relatedTransactionAddress?: string | null;
  related_transaction_address?: string | null;
  aiProcessingStatus?: string | null;
  ai_processing_status?: string | null;
  extractionStatus?: string | null;
  extraction_status?: string | null;
  aiProcessingResult?: Record<string, unknown> | null;
  ai_processing_result?: Record<string, unknown> | null;
  createdAt?: string | null;
  created_at?: string | null;
  updatedAt?: string | null;
  updated_at?: string | null;
  file?: UserUploadApiFile | null;
};

export type UserUploadsPagination = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_more: boolean;
};

export type UserUploadsListResponse = {
  success: boolean;
  data: UserUploadApiRecord[];
  pagination: UserUploadsPagination;
};
