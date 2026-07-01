export const DOCUMENT_UPLOAD_MAX_FILE_SIZE_MB = 100;

export const DOCUMENT_UPLOAD_MAX_FILE_SIZE_BYTES =
  DOCUMENT_UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024;

export const DOCUMENT_UPLOAD_ALLOWED_MIME_TYPE = "application/pdf";

export const DOCUMENT_UPLOAD_ERROR_MESSAGES = {
  unsupportedFileType: "Only PDF files are supported.",
  fileTooLarge: (maxFileSizeMB: number) =>
    `File size exceeds ${maxFileSizeMB} MB.`,
  generic: "Unable to select file.\nPlease try again.",
} as const;
