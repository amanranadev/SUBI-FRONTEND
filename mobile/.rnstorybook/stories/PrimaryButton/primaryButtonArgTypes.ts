import type { Meta } from "@storybook/react-native";

import {
  BUTTON_SHAPES,
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  PrimaryButton,
} from "../../../components/PrimaryButton";

export const PRIMARY_BUTTON_PROP_DEFINITIONS = [
  {
    name: "children",
    type: "React.ReactNode",
    defaultValue: "undefined",
    description: "Button label. Omit for icon-only buttons.",
  },
  {
    name: "variant",
    type: BUTTON_VARIANTS.map((v) => `"${v}"`).join(" | "),
    defaultValue: '"primary"',
    description: "Visual style derived from the design system (not button copy).",
  },
  {
    name: "size",
    type: BUTTON_SIZES.map((s) => `"${s}"`).join(" | "),
    defaultValue: '"lg"',
    description: "Controls height, padding, and default icon scale.",
  },
  {
    name: "shape",
    type: BUTTON_SHAPES.map((s) => `"${s}"`).join(" | "),
    defaultValue: '"pill"',
    description: "Border radius preset mapped from Figma radii.",
  },
  {
    name: "leftIcon",
    type: "React.ReactNode",
    defaultValue: "undefined",
    description: "Leading slot. Pass <Icon /> from the shared icon system.",
  },
  {
    name: "rightIcon",
    type: "React.ReactNode",
    defaultValue: "undefined",
    description: "Trailing slot. Pass <Icon /> from the shared icon system.",
  },
  {
    name: "loading",
    type: "boolean",
    defaultValue: "false",
    description: "Shows ActivityIndicator, hides icons, disables press.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Applies disabled palette and blocks interaction.",
  },
  {
    name: "fullWidth",
    type: "boolean",
    defaultValue: "false",
    description: "Stretches button to container width (flex layouts).",
  },
  {
    name: "elevated",
    type: "boolean",
    defaultValue: "false",
    description: "Applies primary shadow token (e.g. Try Again CTA).",
  },
  {
    name: "onPress",
    type: "() => void",
    defaultValue: "undefined",
    description: "Press handler. Ignored when loading or disabled.",
  },
  {
    name: "accessibilityLabel",
    type: "string",
    defaultValue: "children (string)",
    description: "Screen reader label. Required for icon-only buttons.",
  },
  {
    name: "testID",
    type: "string",
    defaultValue: "undefined",
    description: "Test identifier for E2E and unit tests.",
  },
] as const;

export const primaryButtonArgTypes: Meta<typeof PrimaryButton>["argTypes"] = {
  children: {
    control: "text",
    description: PRIMARY_BUTTON_PROP_DEFINITIONS[0].description,
    table: {
      type: { summary: "React.ReactNode" },
      defaultValue: { summary: "undefined" },
    },
  },
  variant: {
    control: "select",
    options: [...BUTTON_VARIANTS],
    description: PRIMARY_BUTTON_PROP_DEFINITIONS[1].description,
    table: {
      type: { summary: "ButtonVariant" },
      defaultValue: { summary: "primary" },
    },
  },
  size: {
    control: "select",
    options: [...BUTTON_SIZES],
    description: PRIMARY_BUTTON_PROP_DEFINITIONS[2].description,
    table: {
      type: { summary: "ButtonSize" },
      defaultValue: { summary: "lg" },
    },
  },
  shape: {
    control: "select",
    options: [...BUTTON_SHAPES],
    description: PRIMARY_BUTTON_PROP_DEFINITIONS[3].description,
    table: {
      type: { summary: "ButtonShape" },
      defaultValue: { summary: "pill" },
    },
  },
  leftIcon: {
    control: false,
    description: PRIMARY_BUTTON_PROP_DEFINITIONS[4].description,
    table: { type: { summary: "React.ReactNode" } },
  },
  rightIcon: {
    control: false,
    description: PRIMARY_BUTTON_PROP_DEFINITIONS[5].description,
    table: { type: { summary: "React.ReactNode" } },
  },
  loading: {
    control: "boolean",
    description: PRIMARY_BUTTON_PROP_DEFINITIONS[6].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "false" },
    },
  },
  disabled: {
    control: "boolean",
    description: PRIMARY_BUTTON_PROP_DEFINITIONS[7].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "false" },
    },
  },
  fullWidth: {
    control: "boolean",
    description: PRIMARY_BUTTON_PROP_DEFINITIONS[8].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "false" },
    },
  },
  elevated: {
    control: "boolean",
    description: PRIMARY_BUTTON_PROP_DEFINITIONS[9].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "false" },
    },
  },
  onPress: {
    action: "pressed",
    description: PRIMARY_BUTTON_PROP_DEFINITIONS[10].description,
    table: { type: { summary: "() => void" } },
  },
  accessibilityLabel: {
    control: "text",
    description: PRIMARY_BUTTON_PROP_DEFINITIONS[11].description,
    table: { type: { summary: "string" } },
  },
  testID: {
    control: "text",
    description: PRIMARY_BUTTON_PROP_DEFINITIONS[12].description,
    table: { type: { summary: "string" } },
  },
};

export const PRIMARY_BUTTON_DOCS_DESCRIPTION = `PrimaryButton is the standard action component used throughout the application.

Supports text-only, left icon, right icon, both icons, icon-only, loading, and disabled states. Icons are composed via React nodes — always use the shared Icon component.`;
