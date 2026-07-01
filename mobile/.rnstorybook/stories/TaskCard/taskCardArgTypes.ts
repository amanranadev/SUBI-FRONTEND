import type { Meta } from "@storybook/react-native";

import { TaskCard } from "../../../components/TaskCard";

export const TASK_CARD_DOCS_DESCRIPTION =
  "A business-level task card for transaction workflows. It composes DatePicker, Divider, PrimaryButton, and Icon while parents own task actions and persistence.";

export const TASK_CARD_PROP_DEFINITIONS = [
  {
    name: "transactionName",
    type: "string",
    defaultValue: "required",
    description: "Overline label for the related transaction.",
    required: true,
  },
  {
    name: "taskName",
    type: "string",
    defaultValue: "required",
    description: "Primary task title shown in the card header.",
    required: true,
  },
  {
    name: "dueDate",
    type: "Date | null",
    defaultValue: "undefined",
    description: "Optional due date passed through to DatePicker.",
  },
  {
    name: "status",
    type: '"pending" | "done" | "skipped"',
    defaultValue: "pending",
    description: "Visual task status used for card and footer action emphasis.",
  },
  {
    name: "onDateChange",
    type: "(date: Date | null) => void",
    defaultValue: "undefined",
    description: "Called when the due date changes. DatePicker is read-only when omitted.",
  },
  {
    name: "onEditPress",
    type: "() => void",
    defaultValue: "undefined",
    description: "Called when Edit is pressed. Button is hidden when omitted.",
  },
  {
    name: "onSkipPress",
    type: "() => void",
    defaultValue: "undefined",
    description: "Called when Skip is pressed. Button is hidden when omitted.",
  },
  {
    name: "onDonePress",
    type: "() => void",
    defaultValue: "undefined",
    description: "Called when Done is pressed. Button is hidden when omitted.",
  },
  {
    name: "onDocumentPress",
    type: "() => void",
    defaultValue: "undefined",
    description: "Called when the document icon is pressed. Icon is hidden when omitted.",
  },
  {
    name: "onDeletePress",
    type: "() => void",
    defaultValue: "undefined",
    description: "Called when the delete icon is pressed. Icon is hidden when omitted.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Disables card interactions and applies disabled visuals.",
  },
  {
    name: "testID",
    type: "string",
    defaultValue: "undefined",
    description: "Test identifier for the card container.",
  },
] as const;

export const TASK_CARD_COMPOSITION = [
  "DatePicker for due date selection",
  "Divider between content and footer actions",
  "PrimaryButton for Edit, Skip, and Done",
  "Icon for document and delete header actions",
] as const;

export const taskCardArgTypes: Meta<typeof TaskCard>["argTypes"] = {
  transactionName: {
    control: "text",
  },
  taskName: {
    control: "text",
  },
  dueDate: {
    control: false,
  },
  status: {
    control: "select",
    options: ["pending", "done", "skipped"],
  },
  disabled: {
    control: "boolean",
  },
  testID: {
    control: "text",
  },
  onDateChange: {
    action: "dateChanged",
  },
  onEditPress: {
    action: "editPressed",
  },
  onSkipPress: {
    action: "skipPressed",
  },
  onDonePress: {
    action: "donePressed",
  },
  onDocumentPress: {
    action: "documentPressed",
  },
  onDeletePress: {
    action: "deletePressed",
  },
};
