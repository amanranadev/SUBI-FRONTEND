import type { Meta } from "@storybook/react-native";

import {
  PROGRESS_BAR_LABEL_POSITIONS,
  PROGRESS_BAR_SIZES,
  PROGRESS_BAR_VARIANTS,
  ProgressBar,
} from "../../../components/ProgressBar";

export const PROGRESS_BAR_PROP_DEFINITIONS = [
  {
    name: "value",
    type: "number",
    defaultValue: "required",
    required: true,
    description: "Progress percentage. Values are clamped between 0 and 100.",
  },
  {
    name: "variant",
    type: PROGRESS_BAR_VARIANTS.map((v) => `"${v}"`).join(" | "),
    defaultValue: '"default"',
    description: "Visual color state for the filled track.",
  },
  {
    name: "size",
    type: PROGRESS_BAR_SIZES.map((s) => `"${s}"`).join(" | "),
    defaultValue: '"md"',
    description: "Controls bar height and radius.",
  },
  {
    name: "striped",
    type: "boolean",
    defaultValue: "false",
    description: "Adds a static striped overlay to the filled area.",
  },
  {
    name: "animated",
    type: "boolean",
    defaultValue: "false",
    description: "Animates fill width when value changes.",
  },
  {
    name: "showLabel",
    type: "boolean",
    defaultValue: "false",
    description: "Shows the percentage or custom label.",
  },
  {
    name: "labelPosition",
    type: PROGRESS_BAR_LABEL_POSITIONS.map((v) => `"${v}"`).join(" | "),
    defaultValue: '"none"',
    description: "Places the label above, below, or to the right of the bar.",
  },
  {
    name: "label",
    type: "string",
    defaultValue: "rounded value + %",
    description: "Optional custom label text.",
  },
  {
    name: "accessibilityLabel",
    type: "string",
    defaultValue: '"Progress {value} percent"',
    description: "Screen reader label for the progressbar.",
  },
] as const;

export const progressBarArgTypes: Meta<typeof ProgressBar>["argTypes"] = {
  value: {
    control: { type: "number", min: 0, max: 100, step: 1 },
    description: PROGRESS_BAR_PROP_DEFINITIONS[0].description,
    table: {
      type: { summary: "number" },
      defaultValue: { summary: "required" },
    },
  },
  variant: {
    control: "select",
    options: [...PROGRESS_BAR_VARIANTS],
    description: PROGRESS_BAR_PROP_DEFINITIONS[1].description,
    table: {
      type: { summary: "ProgressBarVariant" },
      defaultValue: { summary: "default" },
    },
  },
  size: {
    control: "select",
    options: [...PROGRESS_BAR_SIZES],
    description: PROGRESS_BAR_PROP_DEFINITIONS[2].description,
    table: {
      type: { summary: "ProgressBarSize" },
      defaultValue: { summary: "md" },
    },
  },
  striped: {
    control: "boolean",
    description: PROGRESS_BAR_PROP_DEFINITIONS[3].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "false" },
    },
  },
  animated: {
    control: "boolean",
    description: PROGRESS_BAR_PROP_DEFINITIONS[4].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "false" },
    },
  },
  showLabel: {
    control: "boolean",
    description: PROGRESS_BAR_PROP_DEFINITIONS[5].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "false" },
    },
  },
  labelPosition: {
    control: "select",
    options: [...PROGRESS_BAR_LABEL_POSITIONS],
    description: PROGRESS_BAR_PROP_DEFINITIONS[6].description,
    table: {
      type: { summary: "ProgressBarLabelPosition" },
      defaultValue: { summary: "none" },
    },
  },
  label: {
    control: "text",
    description: PROGRESS_BAR_PROP_DEFINITIONS[7].description,
    table: { type: { summary: "string" } },
  },
  accessibilityLabel: {
    control: "text",
    description: PROGRESS_BAR_PROP_DEFINITIONS[8].description,
    table: { type: { summary: "string" } },
  },
};

export const PROGRESS_BAR_DOCS_DESCRIPTION =
  "ProgressBar is the mobile design-system primitive for upload, processing, transaction, and completion progress. It mirrors the web Progress behavior while using React Native views and mobile Figma sizing.";
