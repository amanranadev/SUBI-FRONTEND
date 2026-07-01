import type * as DocumentPicker from "expo-document-picker";

export type DocumentUploadZoneErrorType =
  | "unsupportedFileType"
  | "fileTooLarge"
  | "generic";

export interface DocumentUploadZoneProps {
  title?: string;
  description?: string;
  disabled?: boolean;
  loading?: boolean;
  maxFileSizeMB?: number;
  onFileSelected?: (file: DocumentPicker.DocumentPickerAsset) => void;
  testID?: string;
}
