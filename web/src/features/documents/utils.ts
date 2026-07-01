import {
  AI_PROCESSING_STATUS,
  EXTRACTION_STATUS,
  type AiProcessingStatus,
  type ExtractionStatus,
} from "@/features/transactions/constants";
import type { DocumentRecord, UserUploadApiRecord } from "./types";

export const DOCUMENT_VIEW_MODES = {
  GRID: "grid",
  LIST: "list",
} as const;

export type DocumentViewMode =
  (typeof DOCUMENT_VIEW_MODES)[keyof typeof DOCUMENT_VIEW_MODES];

const DEFAULT_DOCUMENT_STATUS = AI_PROCESSING_STATUS.NOT_PROCESSED;
const DEFAULT_EXTRACTION_STATUS = EXTRACTION_STATUS.PENDING;

function toStringValue(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function normalizeDocumentStatus(value: string | null | undefined): AiProcessingStatus {
  switch (value) {
    case AI_PROCESSING_STATUS.COMPLETED:
    case AI_PROCESSING_STATUS.PROCESSING:
    case AI_PROCESSING_STATUS.FAILED:
    case AI_PROCESSING_STATUS.NOT_PROCESSED:
      return value;
    default:
      return DEFAULT_DOCUMENT_STATUS;
  }
}

function normalizeExtractionStatus(value: string | null | undefined): ExtractionStatus {
  switch (value) {
    case EXTRACTION_STATUS.PENDING:
    case EXTRACTION_STATUS.EXTRACTING:
    case EXTRACTION_STATUS.EXTRACTED:
    case EXTRACTION_STATUS.FAILED:
      return value;
    default:
      return DEFAULT_EXTRACTION_STATUS;
  }
}

export function normalizeDocumentUpload(upload: UserUploadApiRecord): DocumentRecord {
  const file = upload.file;

  return {
    id: toStringValue(upload.id) ?? "",
    userId: toStringValue(upload.user_id ?? upload.userId),
    uploadedBy: (upload.uploaded_by ?? upload.uploadedBy)?.trim() || null,
    relatedTransactionId: toStringValue(
      upload.related_transaction_id ?? upload.relatedTransactionId,
    ),
    relatedTransactionAddress:
      (upload.related_transaction_address ?? upload.relatedTransactionAddress)?.trim() ||
      null,
    aiProcessingStatus: normalizeDocumentStatus(
      upload.ai_processing_status ?? upload.aiProcessingStatus,
    ),
    extractionStatus: normalizeExtractionStatus(
      upload.extraction_status ?? upload.extractionStatus,
    ),
    aiProcessingResult: upload.ai_processing_result ?? upload.aiProcessingResult ?? null,
    createdAt: upload.created_at ?? upload.createdAt ?? "",
    updatedAt:
      upload.updated_at ?? upload.updatedAt ?? upload.created_at ?? upload.createdAt ?? "",
    file:
      file?.url && file.filename
        ? {
            filename: file.filename,
            contentType: file.content_type ?? file.contentType ?? "application/octet-stream",
            byteSize: file.byte_size ?? file.byteSize ?? 0,
            url: file.url,
            downloadUrl: file.download_url ?? file.downloadUrl ?? file.url,
            createdAt: file.created_at ?? file.createdAt ?? null,
          }
        : null,
  };
}

export function getDocumentStatusLabel(status: AiProcessingStatus): string {
  switch (status) {
    case AI_PROCESSING_STATUS.COMPLETED:
      return "Processed";
    case AI_PROCESSING_STATUS.PROCESSING:
      return "Processing";
    case AI_PROCESSING_STATUS.FAILED:
      return "Failed";
    case AI_PROCESSING_STATUS.NOT_PROCESSED:
    default:
      return "Pending";
  }
}

export function getDocumentStatusClasses(status: AiProcessingStatus): string {
  switch (status) {
    case AI_PROCESSING_STATUS.COMPLETED:
      return "bg-green-500/10 text-green-600";
    case AI_PROCESSING_STATUS.PROCESSING:
      return "bg-blue-500/10 text-blue-600";
    case AI_PROCESSING_STATUS.FAILED:
      return "bg-red-500/10 text-red-600";
    case AI_PROCESSING_STATUS.NOT_PROCESSED:
    default:
      return "bg-black/[0.05] text-foreground/50";
  }
}

export function getDocumentTypeLabel(document: DocumentRecord): string {
  const contentType = document.file?.contentType;
  if (contentType) {
    const subtype = contentType.split("/")[1];
    if (subtype) return subtype.toLowerCase();
  }

  const filename = document.file?.filename ?? "";
  const extension = filename.split(".").pop();
  return extension ? extension.toLowerCase() : "file";
}
