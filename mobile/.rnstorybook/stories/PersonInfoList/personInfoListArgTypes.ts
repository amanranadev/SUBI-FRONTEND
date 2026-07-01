import type { Meta } from "@storybook/react-native";

import { PersonInfoList } from "../../../components/PersonInfoList";

export const PERSON_INFO_LIST_DOCS_DESCRIPTION =
  "A collection wrapper that manages multiple PersonInfoSection instances. Parents own people data, validation, and workflows while the component handles add, remove, and rendering.";

export const PERSON_INFO_LIST_PROP_DEFINITIONS = [
  {
    name: "people",
    type: "PersonInfo[]",
    defaultValue: "required",
    description: "Controlled list of people owned by the parent.",
    required: true,
  },
  {
    name: "onChange",
    type: "(people: PersonInfo[]) => void",
    defaultValue: "required",
    description: "Called when people are added, removed, or updated.",
    required: true,
  },
  {
    name: "addButtonLabel",
    type: "string",
    defaultValue: '"Add Buyer"',
    description: "Label for the add-person action button.",
  },
  {
    name: "showImportButton",
    type: "boolean",
    defaultValue: "false",
    description: "When true, renders the Import From Contacts action.",
  },
  {
    name: "onImportPress",
    type: "() => void",
    defaultValue: "undefined",
    description: "Called when Import From Contacts is pressed.",
  },
  {
    name: "minItems",
    type: "number",
    defaultValue: "0",
    description:
      "Minimum people count. Remove actions are hidden when at or below this limit.",
  },
  {
    name: "maxItems",
    type: "number",
    defaultValue: "undefined",
    description: "Maximum people count. Disables Add when the limit is reached.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Read-only mode. Disables fields and header actions.",
  },
  {
    name: "testID",
    type: "string",
    defaultValue: "undefined",
    description: "Test identifier for the list container and derived controls.",
  },
] as const;

export const personInfoListArgTypes: Meta<typeof PersonInfoList>["argTypes"] = {
  people: {
    control: false,
  },
  onChange: {
    control: false,
  },
  addButtonLabel: {
    control: "text",
  },
  showImportButton: {
    control: "boolean",
  },
  onImportPress: {
    control: false,
  },
  minItems: {
    control: { type: "number", min: 0 },
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
