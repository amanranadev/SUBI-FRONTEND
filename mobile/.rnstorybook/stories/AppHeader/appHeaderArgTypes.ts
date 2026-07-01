import type { Meta } from "@storybook/react-native";

import {
  APP_HEADER_SIZES,
  APP_HEADER_VARIANTS,
  AppHeader,
} from "../../../components/AppHeader";

export const APP_HEADER_PROP_DEFINITIONS = [
  {
    name: "title",
    type: "string",
    defaultValue: "undefined",
    description: "Optional screen title rendered beside the Subi logo.",
  },
  {
    name: "showBackButton",
    type: "boolean",
    defaultValue: "false",
    description: "Renders the back affordance before the logo when true.",
  },
  {
    name: "onBackPress",
    type: "() => void",
    defaultValue: "undefined",
    description: "Back button handler. Usually calls router.back() or navigation.goBack().",
  },
  {
    name: "backAccessibilityLabel",
    type: "string",
    defaultValue: '"Go back"',
    description: "Accessibility label for the back button.",
  },
  {
    name: "rightContent",
    type: "React.ReactNode",
    defaultValue: "undefined",
    description: "Optional right-side action slot.",
  },
  {
    name: "size",
    type: APP_HEADER_SIZES.map((s) => `"${s}"`).join(" | "),
    defaultValue: '"md"',
    description: "Controls header height, padding, logo scale, and typography.",
  },
  {
    name: "variant",
    type: APP_HEADER_VARIANTS.map((v) => `"${v}"`).join(" | "),
    defaultValue: '"default"',
    description: "Controls the header background treatment.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Disables the back button and dims the title.",
  },
  {
    name: "testID",
    type: "string",
    defaultValue: "undefined",
    description: "Test identifier for the header container.",
  },
] as const;

export const appHeaderArgTypes: Meta<typeof AppHeader>["argTypes"] = {
  title: {
    control: "text",
    description: APP_HEADER_PROP_DEFINITIONS[0].description,
    table: { type: { summary: "string" } },
  },
  showBackButton: {
    control: "boolean",
    description: APP_HEADER_PROP_DEFINITIONS[1].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "false" },
    },
  },
  onBackPress: {
    action: "back pressed",
    description: APP_HEADER_PROP_DEFINITIONS[2].description,
    table: { type: { summary: "() => void" } },
  },
  backAccessibilityLabel: {
    control: "text",
    description: APP_HEADER_PROP_DEFINITIONS[3].description,
    table: {
      type: { summary: "string" },
      defaultValue: { summary: "Go back" },
    },
  },
  rightContent: {
    control: false,
    description: APP_HEADER_PROP_DEFINITIONS[4].description,
    table: { type: { summary: "React.ReactNode" } },
  },
  size: {
    control: "select",
    options: [...APP_HEADER_SIZES],
    description: APP_HEADER_PROP_DEFINITIONS[5].description,
    table: {
      type: { summary: "AppHeaderSize" },
      defaultValue: { summary: "md" },
    },
  },
  variant: {
    control: "select",
    options: [...APP_HEADER_VARIANTS],
    description: APP_HEADER_PROP_DEFINITIONS[6].description,
    table: {
      type: { summary: "AppHeaderVariant" },
      defaultValue: { summary: "default" },
    },
  },
  disabled: {
    control: "boolean",
    description: APP_HEADER_PROP_DEFINITIONS[7].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "false" },
    },
  },
  testID: {
    control: "text",
    description: APP_HEADER_PROP_DEFINITIONS[8].description,
    table: { type: { summary: "string" } },
  },
};

export const APP_HEADER_DOCS_DESCRIPTION =
  "AppHeader is the standard product header with built-in Subi branding. It supports an optional back button, optional title beside the logo, and an optional right action slot.";
