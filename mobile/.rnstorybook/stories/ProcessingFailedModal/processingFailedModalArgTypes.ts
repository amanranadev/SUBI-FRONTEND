import type { Meta } from "@storybook/react-native";

import { ProcessingFailedModal } from "../../../components/ProcessingFailedModal";

import {
  DEFAULT_ERROR_MESSAGE,
  DEFAULT_FAILED_TITLE,
} from "./processingFailedModalConstants";

export const PROCESSING_FAILED_MODAL_DOCS_DESCRIPTION =
  "A composed document-processing failure panel that reuses Icon and PrimaryButton. It surfaces error messaging with retry and cancel actions without owning business logic.";

export const PROCESSING_FAILED_MODAL_PROP_DEFINITIONS = [
  {
    name: "title",
    type: "string",
    defaultValue: `"${DEFAULT_FAILED_TITLE}"`,
    description: "Heading shown below the error icon. Defaults to the Figma copy.",
  },
  {
    name: "errorMessage",
    type: "string",
    defaultValue: "required",
    description: "Danger-colored error copy shown under the title.",
  },
  {
    name: "onRetry",
    type: "() => void",
    defaultValue: "undefined",
    description: "When provided, renders the primary Try Again button.",
  },
  {
    name: "onCancel",
    type: "() => void",
    defaultValue: "undefined",
    description: "When provided, renders the outline Cancel button.",
  },
  {
    name: "loading",
    type: "boolean",
    defaultValue: "false",
    description: "Shows loading state on the Try Again button via PrimaryButton.",
  },
  {
    name: "testID",
    type: "string",
    defaultValue: "undefined",
    description: "Test identifier for the modal content container.",
  },
] as const;

export const processingFailedModalArgTypes: Meta<
  typeof ProcessingFailedModal
>["argTypes"] = {
  title: {
    control: "text",
  },
  errorMessage: {
    control: "text",
  },
  onRetry: {
    action: "retry",
  },
  onCancel: {
    action: "cancel",
  },
  loading: {
    control: "boolean",
  },
  testID: {
    control: "text",
  },
};
