import type { Meta } from "@storybook/react-native";

import { ItemListEditor } from "../../../components/ItemListEditor";

export const ITEM_LIST_EDITOR_DOCS_DESCRIPTION =
  "A business-level list editor for adding and removing string items. Parents own the items array while the component manages the draft input value.";

export const ITEM_LIST_EDITOR_PROP_DEFINITIONS = [
  {
    name: "items",
    type: "string[]",
    defaultValue: "required",
    description: "Controlled list of item values owned by the parent.",
    required: true,
  },
  {
    name: "onChange",
    type: "(items: string[]) => void",
    defaultValue: "required",
    description: "Called when items are added or removed.",
    required: true,
  },
  {
    name: "label",
    type: "string",
    defaultValue: '"ADD ITEM"',
    description: "Uppercase section label shown above the input row.",
  },
  {
    name: "placeholder",
    type: "string",
    defaultValue: '"Add item"',
    description: "Placeholder for the draft input field.",
  },
  {
    name: "helperText",
    type: "string",
    defaultValue: "undefined",
    description: "Optional helper text shown on the label row. Hidden when omitted.",
  },
  {
    name: "emptyStateText",
    type: "string",
    defaultValue: '"No items added yet."',
    description: "Muted message shown when no items exist.",
  },
  {
    name: "maxItems",
    type: "number",
    defaultValue: "undefined",
    description: "Maximum number of items. Disables Add when the limit is reached.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Disables input, add, and remove actions.",
  },
  {
    name: "testID",
    type: "string",
    defaultValue: "undefined",
    description: "Test identifier for the editor container and derived controls.",
  },
] as const;

export const itemListEditorArgTypes: Meta<typeof ItemListEditor>["argTypes"] = {
  items: {
    control: false,
  },
  onChange: {
    control: false,
  },
  label: {
    control: "text",
  },
  placeholder: {
    control: "text",
  },
  helperText: {
    control: "text",
  },
  emptyStateText: {
    control: "text",
  },
  maxItems: {
    control: { type: "number", min: 1 },
  },
  disabled: {
    control: "boolean",
  },
  testID: {
    control: "text",
  },
};
