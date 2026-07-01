import {
  SUPPORTED_FILE_TYPES,
  type SupportedFileType,
} from "@/types/document";

export type {
  AnalysisStatus,
  DealSummary,
  DocumentUploadFile,
  DocumentUploadResult,
  ExtractedData,
  ExtractedDataMetadata,
  ExtractedFact,
  Form,
  SupportedFileType,
} from "@/types/document";

export { SUPPORTED_FILE_TYPES };

/**
 * Maximum file size in bytes (500MB)
 */
const MAX_FILE_SIZE = 500 * 1024 * 1024;

/**
 * Client-side file validation for upload flows.
 * Upload/analysis orchestration: hooks/useDocumentProcessing + services/document*Service.
 */
export const documentService = {
  validateFile(file: { size?: number; type?: string; name?: string }): void {
    if (!file.size || file.size === 0) {
      throw new Error("File is empty");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      );
    }

    if (
      !file.type ||
      !SUPPORTED_FILE_TYPES.includes(file.type as SupportedFileType)
    ) {
      const supportedTypes = SUPPORTED_FILE_TYPES.join(", ");
      throw new Error(
        `Unsupported file type. Supported types: ${supportedTypes}`,
      );
    }
  },
};
