import type { Meta } from "@storybook/react-native";

import { ProcessingProgressModal } from "../../../components/ProcessingProgressModal";

import {
  DEFAULT_PROCESSING_DESCRIPTION,
  DEFAULT_PROCESSING_TITLE,
} from "./processingProgressModalConstants";

export const PROCESSING_PROGRESS_MODAL_DOCS_DESCRIPTION =
  "A composed document-processing progress panel that reuses Icon, ProgressBar, Stepper, and PrimaryButton. It indicates upload and analysis progress without owning business logic or error handling.";

export const PROCESSING_PROGRESS_MODAL_PROP_DEFINITIONS = [
  {
    name: "title",
    type: "string",
    defaultValue: `"${DEFAULT_PROCESSING_TITLE}"`,
    description: "Heading shown below the hero icon. Defaults to the Figma copy.",
  },
  {
    name: "description",
    type: "string",
    defaultValue: `"${DEFAULT_PROCESSING_DESCRIPTION}"`,
    description: "Muted body copy under the title. Defaults to the Figma copy.",
  },
  {
    name: "progress",
    type: "number",
    defaultValue: "0",
    description: "Processing completion percentage (0–100), passed to ProgressBar.",
  },
  {
    name: "steps",
    type: "StepperItem[]",
    defaultValue: "required",
    description: "Ordered workflow steps passed through to Stepper.",
  },
  {
    name: "activeStep",
    type: "number",
    defaultValue: "0",
    description: "Zero-based current step index passed through to Stepper.",
  },
  {
    name: "onStopProcessing",
    type: "() => void",
    defaultValue: "undefined",
    description: "When provided, renders the outline Stop Processing button.",
  },
  {
    name: "loading",
    type: "boolean",
    defaultValue: "false",
    description: "Shows loading state on the stop button via PrimaryButton.",
  },
  {
    name: "testID",
    type: "string",
    defaultValue: "undefined",
    description: "Test identifier for the modal content container.",
  },
] as const;

export const processingProgressModalArgTypes: Meta<
  typeof ProcessingProgressModal
>["argTypes"] = {
  title: {
    control: "text",
  },
  description: {
    control: "text",
  },
  progress: {
    control: { type: "number", min: 0, max: 100, step: 1 },
  },
  activeStep: {
    control: false,
    table: { disable: true },
  },
  steps: {
    control: false,
    table: { disable: true },
  },
  onStopProcessing: {
    action: "stopProcessing",
  },
  loading: {
    control: "boolean",
  },
  testID: {
    control: "text",
  },
};
