import type { Meta } from "@storybook/react-native";

import {
  DATE_BADGE_SIZES,
  DATE_BADGE_VARIANTS,
  DateBadge,
} from "../../../components/DateBadge";

export const DATE_BADGE_DOCS_DESCRIPTION =
  "A compact calendar-style date badge that derives month and day from a Date object. Use in scheduling rows, timelines, activity feeds, and calendar pickers.";

export const DATE_BADGE_PROP_DEFINITIONS = [
  {
    name: "date",
    type: "Date",
    defaultValue: "required",
    description: "Source date. Month and day labels are derived automatically.",
  },
  {
    name: "size",
    type: DATE_BADGE_SIZES.map((s) => `"${s}"`).join(" | "),
    defaultValue: '"md"',
    description: "Token-driven dimensions. Figma spec maps to md.",
  },
  {
    name: "variant",
    type: DATE_BADGE_VARIANTS.map((v) => `"${v}"`).join(" | "),
    defaultValue: '"default"',
    description: "Visual state: default, selected, or muted.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Applies muted styling and prevents onPress.",
  },
  {
    name: "highlightToday",
    type: "boolean",
    defaultValue: "false",
    description: "Adds a brand ring when the date matches today (non-selected).",
  },
  {
    name: "locale",
    type: "string",
    defaultValue: "undefined",
    description: "BCP 47 locale for Intl date formatting. Defaults to en-US.",
  },
  {
    name: "onPress",
    type: "() => void",
    defaultValue: "undefined",
    description: "When provided, the badge becomes an interactive button.",
  },
  {
    name: "accessibilityLabel",
    type: "string",
    defaultValue: "undefined",
    description: "Overrides the default long-form date label for screen readers.",
  },
  {
    name: "testID",
    type: "string",
    defaultValue: "undefined",
    description: "Test identifier for the badge root element.",
  },
] as const;

export const dateBadgeArgTypes: Meta<typeof DateBadge>["argTypes"] = {
  date: {
    control: "text",
    description: "ISO date string (yyyy-MM-dd) parsed into a Date.",
  },
  size: {
    control: "select",
    options: [...DATE_BADGE_SIZES],
  },
  variant: {
    control: "select",
    options: [...DATE_BADGE_VARIANTS],
  },
  disabled: {
    control: "boolean",
  },
  highlightToday: {
    control: "boolean",
  },
  locale: {
    control: "text",
  },
  onPress: {
    action: "onPress",
  },
  accessibilityLabel: {
    control: "text",
  },
  testID: {
    control: "text",
  },
};
