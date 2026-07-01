import type { Meta } from "@storybook/react-native";

import { CollapsibleSection } from "../../../components/CollapsibleSection";

export const COLLAPSIBLE_SECTION_DOCS_DESCRIPTION =
  "A generic collapsible section primitive for expandable review panels. It owns header layout, chevron animation, content visibility, and optional footer rendering while remaining workflow-agnostic.";

export const COLLAPSIBLE_SECTION_PROP_DEFINITIONS = [
  {
    name: "title",
    type: "string",
    defaultValue: "required",
    description: "Section heading text rendered in label/tab typography.",
    required: true,
  },
  {
    name: "children",
    type: "React.ReactNode",
    defaultValue: "required",
    description: "Body content rendered only when expanded.",
    required: true,
  },
  {
    name: "badge",
    type: "React.ReactNode",
    defaultValue: "undefined",
    description: "Optional status badge rendered beside the title.",
  },
  {
    name: "headerAccessory",
    type: "React.ReactNode",
    defaultValue: "undefined",
    description: "Optional accessory rendered before the chevron.",
  },
  {
    name: "footer",
    type: "React.ReactNode",
    defaultValue: "undefined",
    description: "Optional footer rendered below content when expanded.",
  },
  {
    name: "expanded",
    type: "boolean",
    defaultValue: "undefined",
    description: "Controlled expanded state. Takes precedence over defaultExpanded.",
  },
  {
    name: "defaultExpanded",
    type: "boolean",
    defaultValue: "false",
    description: "Initial expanded state for uncontrolled usage.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Prevents header interaction when true.",
  },
  {
    name: "onExpandedChange",
    type: "(expanded: boolean) => void",
    defaultValue: "undefined",
    description: "Called when the user toggles expanded state.",
  },
  {
    name: "testID",
    type: "string",
    defaultValue: "undefined",
    description: "Test identifier for the section container.",
  },
] as const;

export const collapsibleSectionArgTypes: Meta<
  typeof CollapsibleSection
>["argTypes"] = {
  title: {
    control: "text",
  },
  expanded: {
    control: "boolean",
  },
  defaultExpanded: {
    control: "boolean",
  },
  disabled: {
    control: "boolean",
  },
  onExpandedChange: {
    action: "expandedChange",
  },
  testID: {
    control: "text",
  },
};
