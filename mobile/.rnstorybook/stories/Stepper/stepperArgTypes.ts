import type { Meta } from "@storybook/react-native";

import { Stepper } from "../../../components/Stepper";

export const STEPPER_DOCS_DESCRIPTION =
  "A workflow progress indicator that shows completed, active, and upcoming steps. Step status is derived automatically from activeStep — consumers do not pass per-step status.";

export const STEPPER_PROP_DEFINITIONS = [
  {
    name: "steps",
    type: "StepperItem[]",
    defaultValue: "required",
    description:
      "Ordered list of steps. Each item requires id, label, and icon (IconName from the shared Icon system).",
  },
  {
    name: "activeStep",
    type: "number",
    defaultValue: "0",
    description:
      "Zero-based index of the current step. Steps before this index are completed; steps after are upcoming.",
  },
  {
    name: "testID",
    type: "string",
    defaultValue: "undefined",
    description: "Test identifier for the stepper container.",
  },
] as const;

export const stepperArgTypes: Meta<typeof Stepper>["argTypes"] = {
  steps: {
    control: false,
    table: { disable: true },
  },
  activeStep: {
    control: { type: "number", min: 0, max: 3, step: 1 },
  },
  testID: {
    control: "text",
  },
};
