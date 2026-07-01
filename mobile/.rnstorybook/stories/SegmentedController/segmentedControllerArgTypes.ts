import type { Meta } from "@storybook/react-native";

import {
  SEGMENTED_CONTROLLER_SIZES,
  SEGMENTED_CONTROLLER_VARIANTS,
  SegmentedController,
} from "../../../components/SegmentedController";

export const SEGMENTED_CONTROLLER_PROP_DEFINITIONS = [
  {
    name: "options",
    type: "SegmentedControllerOption[]",
    defaultValue: "required",
    required: true,
    description: "List of segments with value, label, optional icon, and optional disabled state.",
  },
  {
    name: "value",
    type: "string",
    defaultValue: "required",
    required: true,
    description: "The currently selected option value.",
  },
  {
    name: "onValueChange",
    type: "(value: string) => void",
    defaultValue: "undefined",
    description: "Called when a segment is pressed.",
  },
  {
    name: "size",
    type: SEGMENTED_CONTROLLER_SIZES.map((s) => `"${s}"`).join(" | "),
    defaultValue: '"md"',
    description: "Controls track height, padding, radius, and label size.",
  },
  {
    name: "variant",
    type: SEGMENTED_CONTROLLER_VARIANTS.map((v) => `"${v}"`).join(" | "),
    defaultValue: '"pill"',
    description: "Pill matches the Tasks Figma screen. Rounded is available for denser panels.",
  },
  {
    name: "fullWidth",
    type: "boolean",
    defaultValue: "false",
    description: "Stretches the track and gives each segment equal width.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Disables every segment.",
  },
  {
    name: "uppercase",
    type: "boolean",
    defaultValue: "true",
    description: "Uppercases labels to match the Figma overline style.",
  },
] as const;

export const segmentedControllerArgTypes: Meta<
  typeof SegmentedController
>["argTypes"] = {
  options: {
    control: "object",
    description: SEGMENTED_CONTROLLER_PROP_DEFINITIONS[0].description,
    table: { type: { summary: "SegmentedControllerOption[]" } },
  },
  value: {
    control: "text",
    description: SEGMENTED_CONTROLLER_PROP_DEFINITIONS[1].description,
    table: { type: { summary: "string" } },
  },
  onValueChange: {
    action: "changed",
    description: SEGMENTED_CONTROLLER_PROP_DEFINITIONS[2].description,
    table: { type: { summary: "(value: string) => void" } },
  },
  size: {
    control: "select",
    options: [...SEGMENTED_CONTROLLER_SIZES],
    description: SEGMENTED_CONTROLLER_PROP_DEFINITIONS[3].description,
    table: {
      type: { summary: "SegmentedControllerSize" },
      defaultValue: { summary: "md" },
    },
  },
  variant: {
    control: "select",
    options: [...SEGMENTED_CONTROLLER_VARIANTS],
    description: SEGMENTED_CONTROLLER_PROP_DEFINITIONS[4].description,
    table: {
      type: { summary: "SegmentedControllerVariant" },
      defaultValue: { summary: "pill" },
    },
  },
  fullWidth: {
    control: "boolean",
    description: SEGMENTED_CONTROLLER_PROP_DEFINITIONS[5].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "false" },
    },
  },
  disabled: {
    control: "boolean",
    description: SEGMENTED_CONTROLLER_PROP_DEFINITIONS[6].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "false" },
    },
  },
  uppercase: {
    control: "boolean",
    description: SEGMENTED_CONTROLLER_PROP_DEFINITIONS[7].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "true" },
    },
  },
};

export const SEGMENTED_CONTROLLER_DOCS_DESCRIPTION =
  "SegmentedController is the mobile toggle primitive for switching between compact sibling views, such as the Tasks screen Active and Completed states. It follows the web ToggleGroup pattern while matching the Figma 38px pill controller.";
