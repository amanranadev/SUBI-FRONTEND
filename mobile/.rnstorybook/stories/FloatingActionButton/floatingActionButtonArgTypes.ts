import type { Meta } from "@storybook/react-native";

import {
  FLOATING_ACTION_BUTTON_SHAPES,
  FLOATING_ACTION_BUTTON_SIZES,
  FLOATING_ACTION_BUTTON_VARIANTS,
  FloatingActionButton,
} from "../../../components/FloatingActionButton";

export const FLOATING_ACTION_BUTTON_PROP_DEFINITIONS = [
  {
    name: "children",
    type: "React.ReactNode",
    defaultValue: "Subi mark",
    description: "Optional custom icon/content. Omit to render the Subi mark.",
  },
  {
    name: "variant",
    type: FLOATING_ACTION_BUTTON_VARIANTS.map((v) => `"${v}"`).join(" | "),
    defaultValue: '"brand"',
    description: "Visual style for the button surface.",
  },
  {
    name: "size",
    type: FLOATING_ACTION_BUTTON_SIZES.map((s) => `"${s}"`).join(" | "),
    defaultValue: '"md"',
    description: "Controls button and default mark size.",
  },
  {
    name: "shape",
    type: FLOATING_ACTION_BUTTON_SHAPES.map((s) => `"${s}"`).join(" | "),
    defaultValue: '"rounded"',
    description: "Figma uses rounded. Circle is available for legacy patterns.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Applies disabled palette and blocks press.",
  },
  {
    name: "elevated",
    type: "boolean",
    defaultValue: "true",
    description: "Applies the floating shadow from Figma/web references.",
  },
  {
    name: "onPress",
    type: "() => void",
    defaultValue: "undefined",
    description: "Press handler. Ignored when disabled.",
  },
  {
    name: "accessibilityLabel",
    type: "string",
    defaultValue: '"Open Subi actions"',
    description: "Screen reader label for the icon-only button.",
  },
] as const;

export const floatingActionButtonArgTypes: Meta<
  typeof FloatingActionButton
>["argTypes"] = {
  children: {
    control: false,
    description: FLOATING_ACTION_BUTTON_PROP_DEFINITIONS[0].description,
    table: { type: { summary: "React.ReactNode" } },
  },
  variant: {
    control: "select",
    options: [...FLOATING_ACTION_BUTTON_VARIANTS],
    description: FLOATING_ACTION_BUTTON_PROP_DEFINITIONS[1].description,
    table: {
      type: { summary: "FloatingActionButtonVariant" },
      defaultValue: { summary: "brand" },
    },
  },
  size: {
    control: "select",
    options: [...FLOATING_ACTION_BUTTON_SIZES],
    description: FLOATING_ACTION_BUTTON_PROP_DEFINITIONS[2].description,
    table: {
      type: { summary: "FloatingActionButtonSize" },
      defaultValue: { summary: "md" },
    },
  },
  shape: {
    control: "select",
    options: [...FLOATING_ACTION_BUTTON_SHAPES],
    description: FLOATING_ACTION_BUTTON_PROP_DEFINITIONS[3].description,
    table: {
      type: { summary: "FloatingActionButtonShape" },
      defaultValue: { summary: "rounded" },
    },
  },
  disabled: {
    control: "boolean",
    description: FLOATING_ACTION_BUTTON_PROP_DEFINITIONS[4].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "false" },
    },
  },
  elevated: {
    control: "boolean",
    description: FLOATING_ACTION_BUTTON_PROP_DEFINITIONS[5].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "true" },
    },
  },
  onPress: {
    action: "pressed",
    description: FLOATING_ACTION_BUTTON_PROP_DEFINITIONS[6].description,
    table: { type: { summary: "() => void" } },
  },
  accessibilityLabel: {
    control: "text",
    description: FLOATING_ACTION_BUTTON_PROP_DEFINITIONS[7].description,
    table: { type: { summary: "string" } },
  },
};

export const FLOATING_ACTION_BUTTON_DOCS_DESCRIPTION =
  "FloatingActionButton is the mobile brand action trigger. The default matches the Figma 56x56 orange rounded-square FAB with a white Subi mark, and follows the web chat widget's S-only brand treatment.";
