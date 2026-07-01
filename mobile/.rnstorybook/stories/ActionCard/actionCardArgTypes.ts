import type { Meta } from "@storybook/react-native";

import { ActionCard } from "../../../components/ActionCard";

export const ACTION_CARD_DOCS_DESCRIPTION =
  "A selectable action card for focused workflows such as checklist creation options. It composes the existing Icon system and is not a generic card framework.";

export const ACTION_CARD_PROP_DEFINITIONS = [
  {
    name: "title",
    type: "string",
    defaultValue: "required",
    description: "Primary label shown below the icon.",
    required: true,
  },
  {
    name: "description",
    type: "string",
    defaultValue: "undefined",
    description: "Optional secondary text shown under the title.",
  },
  {
    name: "icon",
    type: "React.ReactNode",
    defaultValue: "required",
    description: "Icon content, typically an existing Icon component instance.",
    required: true,
  },
  {
    name: "onPress",
    type: "() => void",
    defaultValue: "undefined",
    description: "Called when the card is pressed. Interaction is disabled when omitted.",
  },
  {
    name: "selected",
    type: "boolean",
    defaultValue: "false",
    description: "Applies selected border and background emphasis.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Applies disabled visuals and blocks interaction.",
  },
  {
    name: "testID",
    type: "string",
    defaultValue: "undefined",
    description: "Test identifier for the pressable card.",
  },
] as const;

export const ACTION_CARD_ICON_GUIDANCE = [
  { action: "Standard Checklist", icon: "check-circle" },
  { action: "Create Checklist", icon: "add" },
  { action: "Upload Checklist", icon: "document-upload" },
  { action: "Saved Templates", icon: "document" },
] as const;

export const actionCardArgTypes: Meta<typeof ActionCard>["argTypes"] = {
  title: {
    control: "text",
  },
  description: {
    control: "text",
  },
  icon: {
    control: false,
  },
  onPress: {
    action: "pressed",
  },
  selected: {
    control: "boolean",
  },
  disabled: {
    control: "boolean",
  },
  testID: {
    control: "text",
  },
};
