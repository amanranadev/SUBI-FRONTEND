import type { Meta } from "@storybook/react-native";

import {
  DIVIDER_ORIENTATIONS,
  DIVIDER_THICKNESS_VALUES,
  DIVIDER_VARIANTS,
  Divider,
} from "../../../components/Divider";

export const DIVIDER_DOCS_DESCRIPTION =
  "A token-driven separator for dividing content sections or grouping inline actions. Supports solid and dashed variants, horizontal and vertical orientations, and inset spacing.";

export const DIVIDER_PROP_DEFINITIONS = [
  {
    name: "variant",
    type: DIVIDER_VARIANTS.map((v) => `"${v}"`).join(" | "),
    defaultValue: '"solid"',
    description: "Line style — solid matches Figma; dashed for future layouts.",
  },
  {
    name: "orientation",
    type: DIVIDER_ORIENTATIONS.map((o) => `"${o}"`).join(" | "),
    defaultValue: '"horizontal"',
    description: "Horizontal for stacked content; vertical for inline action groups.",
  },
  {
    name: "thickness",
    type: DIVIDER_THICKNESS_VALUES.join(" | "),
    defaultValue: "1",
    description: "Line weight in pixels — 1 (hairline) or 2 (strong).",
  },
  {
    name: "inset",
    type: "boolean",
    defaultValue: "false",
    description: "Adds horizontal inset so the line does not span the full token width.",
  },
  {
    name: "testID",
    type: "string",
    defaultValue: "undefined",
    description: "Test identifier for the divider element.",
  },
] as const;

export const dividerArgTypes: Meta<typeof Divider>["argTypes"] = {
  variant: {
    control: "select",
    options: [...DIVIDER_VARIANTS],
  },
  orientation: {
    control: "select",
    options: [...DIVIDER_ORIENTATIONS],
  },
  thickness: {
    control: "select",
    options: [...DIVIDER_THICKNESS_VALUES],
  },
  inset: {
    control: "boolean",
  },
  testID: {
    control: "text",
  },
};
