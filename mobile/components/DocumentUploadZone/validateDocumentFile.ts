import type * as DocumentPicker from "expo-document-picker";

import {
  DOCUMENT_UPLOAD_ALLOWED_MIME_TYPE,
  DOCUMENT_UPLOAD_ERROR_MESSAGES,
} from "./constants";
import type { DocumentUploadZoneErrorType } from "./DocumentUploadZone.types";

export interface DocumentValidationResult {
  valid: boolean;
  errorType?: DocumentUploadZoneErrorType;
  errorMessage?: string;
}

function isPdfMimeType(mimeType: string | null | undefined): boolean {
  if (!mimeType) {
    return false;
  }
  return mimeType.toLowerCase() === DOCUMENT_UPLOAD_ALLOWED_MIME_TYPE;
}

function isPdfFileName(name: string | null | undefined): boolean {
  if (!name) {
    return false;
  }
  return name.toLowerCase().endsWith(".pdf");
}

export function validateDocumentFile(
  file: DocumentPicker.DocumentPickerAsset,
  maxFileSizeBytes: number,
  maxFileSizeMB: number,
): DocumentValidationResult {
  const mimeTypeValid = isPdfMimeType(file.mimeType);
  const nameValid = isPdfFileName(file.name);

  if (!mimeTypeValid && !nameValid) {
    return {
      valid: false,
      errorType: "unsupportedFileType",
      errorMessage: DOCUMENT_UPLOAD_ERROR_MESSAGES.unsupportedFileType,
    };
  }

  if (file.size != null && file.size > maxFileSizeBytes) {
    return {
      valid: false,
      errorType: "fileTooLarge",
      errorMessage: DOCUMENT_UPLOAD_ERROR_MESSAGES.fileTooLarge(maxFileSizeMB),
    };
  }

  return { valid: true };
}
