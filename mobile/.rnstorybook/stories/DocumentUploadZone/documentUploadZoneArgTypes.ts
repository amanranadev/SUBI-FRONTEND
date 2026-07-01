import type { Meta } from "@storybook/react-native";

import {
  DOCUMENT_UPLOAD_MAX_FILE_SIZE_MB,
  DocumentUploadZone,
} from "../../../components/DocumentUploadZone";

export const DOCUMENT_UPLOAD_ZONE_DOCS_DESCRIPTION =
  "A dashed upload zone for selecting PDF documents via expo-document-picker. Validates file type and configurable max size before emitting onFileSelected.";

export const DOCUMENT_UPLOAD_ZONE_PROP_DEFINITIONS = [
  {
    name: "title",
    type: "string",
    defaultValue: '"Drop a document here"',
    description: "Primary heading inside the upload zone.",
  },
  {
    name: "description",
    type: "string",
    defaultValue: '"I\'ll process it and start a new file for you!"',
    description: "Supporting text below the title.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Prevents opening the document picker.",
  },
  {
    name: "loading",
    type: "boolean",
    defaultValue: "false",
    description: "Shows loading overlay and blocks interaction.",
  },
  {
    name: "maxFileSizeMB",
    type: "number",
    defaultValue: String(DOCUMENT_UPLOAD_MAX_FILE_SIZE_MB),
    description: "Maximum allowed file size in megabytes.",
  },
  {
    name: "onFileSelected",
    type: "(file: DocumentPicker.DocumentPickerAsset) => void",
    defaultValue: "undefined",
    description: "Called when a valid PDF within size limits is selected.",
  },
  {
    name: "testID",
    type: "string",
    defaultValue: "undefined",
    description: "Test identifier for the upload zone pressable.",
  },
] as const;

export const documentUploadZoneArgTypes: Meta<typeof DocumentUploadZone>["argTypes"] =
  {
    title: { control: "text" },
    description: { control: "text" },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
    maxFileSizeMB: {
      control: { type: "number", min: 1, max: 500, step: 1 },
    },
    onFileSelected: { action: "onFileSelected" },
    testID: { control: "text" },
  };
