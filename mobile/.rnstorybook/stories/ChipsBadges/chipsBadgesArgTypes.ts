import type { Meta } from "@storybook/react-native";

import {
  BADGE_SIZES,
  BADGE_VARIANTS,
  Badge,
  CHIP_SIZES,
  CHIP_VARIANTS,
  Chip,
} from "../../../components/ChipsBadges";

export const CHIP_PROP_DEFINITIONS = [
  {
    name: "label",
    type: "string",
    defaultValue: "required",
    required: true,
    description: "Visible chip text. Uppercased by default to match Figma.",
  },
  {
    name: "variant",
    type: CHIP_VARIANTS.map((v) => `"${v}"`).join(" | "),
    defaultValue: '"neutral"',
    description: "Visual style for neutral, selected, success, danger, and muted chips.",
  },
  {
    name: "size",
    type: CHIP_SIZES.map((s) => `"${s}"`).join(" | "),
    defaultValue: '"sm"',
    description: "Controls chip height, radius, icon size, and label type.",
  },
  {
    name: "selected",
    type: "boolean",
    defaultValue: "false",
    description: "Forces the selected orange filter-chip style.",
  },
  {
    name: "leftIcon/rightIcon",
    type: "React.ReactNode",
    defaultValue: "undefined",
    description: "Optional icon slots for edit, check, date, and chevron patterns.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Applies disabled styling and blocks press events.",
  },
] as const;

export const BADGE_PROP_DEFINITIONS = [
  {
    name: "label",
    type: "string",
    defaultValue: "required",
    required: true,
    description: "Visible badge text. Uppercased by default to match Figma.",
  },
  {
    name: "variant",
    type: BADGE_VARIANTS.map((v) => `"${v}"`).join(" | "),
    defaultValue: '"neutral"',
    description: "Semantic status style for passive labels.",
  },
  {
    name: "size",
    type: BADGE_SIZES.map((s) => `"${s}"`).join(" | "),
    defaultValue: '"md"',
    description: "Controls badge height, radius, icon size, and label type.",
  },
  {
    name: "leftIcon/rightIcon",
    type: "React.ReactNode",
    defaultValue: "undefined",
    description: "Optional icon slots for status selectors or decorated badges.",
  },
] as const;

export const chipArgTypes: Meta<typeof Chip>["argTypes"] = {
  label: {
    control: "text",
    description: CHIP_PROP_DEFINITIONS[0].description,
    table: { type: { summary: "string" } },
  },
  variant: {
    control: "select",
    options: [...CHIP_VARIANTS],
    description: CHIP_PROP_DEFINITIONS[1].description,
    table: {
      type: { summary: "ChipVariant" },
      defaultValue: { summary: "neutral" },
    },
  },
  size: {
    control: "select",
    options: [...CHIP_SIZES],
    description: CHIP_PROP_DEFINITIONS[2].description,
    table: {
      type: { summary: "ChipSize" },
      defaultValue: { summary: "sm" },
    },
  },
  selected: {
    control: "boolean",
    description: CHIP_PROP_DEFINITIONS[3].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "false" },
    },
  },
  leftIcon: {
    control: false,
    description: CHIP_PROP_DEFINITIONS[4].description,
    table: { type: { summary: "React.ReactNode" } },
  },
  rightIcon: {
    control: false,
    description: CHIP_PROP_DEFINITIONS[4].description,
    table: { type: { summary: "React.ReactNode" } },
  },
  disabled: {
    control: "boolean",
    description: CHIP_PROP_DEFINITIONS[5].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "false" },
    },
  },
  onPress: {
    action: "pressed",
    table: { type: { summary: "() => void" } },
  },
};

export const badgeArgTypes: Meta<typeof Badge>["argTypes"] = {
  label: {
    control: "text",
    description: BADGE_PROP_DEFINITIONS[0].description,
    table: { type: { summary: "string" } },
  },
  variant: {
    control: "select",
    options: [...BADGE_VARIANTS],
    description: BADGE_PROP_DEFINITIONS[1].description,
    table: {
      type: { summary: "BadgeVariant" },
      defaultValue: { summary: "neutral" },
    },
  },
  size: {
    control: "select",
    options: [...BADGE_SIZES],
    description: BADGE_PROP_DEFINITIONS[2].description,
    table: {
      type: { summary: "BadgeSize" },
      defaultValue: { summary: "md" },
    },
  },
  leftIcon: {
    control: false,
    description: BADGE_PROP_DEFINITIONS[3].description,
    table: { type: { summary: "React.ReactNode" } },
  },
  rightIcon: {
    control: false,
    description: BADGE_PROP_DEFINITIONS[3].description,
    table: { type: { summary: "React.ReactNode" } },
  },
};

export const CHIPS_BADGES_DOCS_DESCRIPTION =
  "Chip and Badge cover the compact mobile labels from Figma: transaction filter chips, task action chips, date chips, and passive status badges like Verified, Needs Review, and Priority.";
