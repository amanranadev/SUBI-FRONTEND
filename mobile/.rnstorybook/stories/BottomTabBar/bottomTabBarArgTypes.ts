import type { Meta } from "@storybook/react-native";

import {
  BOTTOM_TAB_BAR_SIZES,
  BottomTabBar,
} from "../../../components/BottomTabBar";

export const BOTTOM_TAB_BAR_PROP_DEFINITIONS = [
  {
    name: "items",
    type: "BottomTabBarItem[]",
    defaultValue: "required",
    required: true,
    description: "Tabs to render with value, label, Ionicon name, optional active icon, badge, and disabled state.",
  },
  {
    name: "value",
    type: "string",
    defaultValue: "required",
    required: true,
    description: "The active tab value.",
  },
  {
    name: "onValueChange",
    type: "(value: string) => void",
    defaultValue: "undefined",
    description: "Called when a tab is pressed.",
  },
  {
    name: "size",
    type: BOTTOM_TAB_BAR_SIZES.map((s) => `"${s}"`).join(" | "),
    defaultValue: '"md"',
    description: "Controls bar height, icon size, label size, and home indicator size.",
  },
  {
    name: "showLabels",
    type: "boolean",
    defaultValue: "true",
    description: "Shows or hides text labels below icons.",
  },
  {
    name: "showHomeIndicator",
    type: "boolean",
    defaultValue: "true",
    description: "Shows the iOS-style home indicator. Useful in Storybook/mobile mockups.",
  },
  {
    name: "elevated",
    type: "boolean",
    defaultValue: "true",
    description: "Applies the subtle top shadow from Figma.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Disables all tabs.",
  },
] as const;

export const bottomTabBarArgTypes: Meta<typeof BottomTabBar>["argTypes"] = {
  items: {
    control: "object",
    description: BOTTOM_TAB_BAR_PROP_DEFINITIONS[0].description,
    table: { type: { summary: "BottomTabBarItem[]" } },
  },
  value: {
    control: "text",
    description: BOTTOM_TAB_BAR_PROP_DEFINITIONS[1].description,
    table: { type: { summary: "string" } },
  },
  onValueChange: {
    action: "tab changed",
    description: BOTTOM_TAB_BAR_PROP_DEFINITIONS[2].description,
    table: { type: { summary: "(value: string) => void" } },
  },
  size: {
    control: "select",
    options: [...BOTTOM_TAB_BAR_SIZES],
    description: BOTTOM_TAB_BAR_PROP_DEFINITIONS[3].description,
    table: {
      type: { summary: "BottomTabBarSize" },
      defaultValue: { summary: "md" },
    },
  },
  showLabels: {
    control: "boolean",
    description: BOTTOM_TAB_BAR_PROP_DEFINITIONS[4].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "true" },
    },
  },
  showHomeIndicator: {
    control: "boolean",
    description: BOTTOM_TAB_BAR_PROP_DEFINITIONS[5].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "true" },
    },
  },
  elevated: {
    control: "boolean",
    description: BOTTOM_TAB_BAR_PROP_DEFINITIONS[6].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "true" },
    },
  },
  disabled: {
    control: "boolean",
    description: BOTTOM_TAB_BAR_PROP_DEFINITIONS[7].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "false" },
    },
  },
};

export const BOTTOM_TAB_BAR_DOCS_DESCRIPTION =
  "BottomTabBar is the reusable mobile bottom navigation primitive. It matches the Figma four-tab bar with muted inactive tabs, peach active icon pill, orange active label/icon, top divider, and optional home indicator.";
