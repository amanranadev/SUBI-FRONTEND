import type { Meta } from "@storybook/react-native";

import { DatePicker } from "../../../components/DatePicker";

export const DATE_PICKER_DOCS_DESCRIPTION =
  "A chip-style date selector that opens a calendar modal on press. Displays the selected date in dd-MMM-yyyy format by default and reports changes via onChange.";

export const DATE_PICKER_PROP_DEFINITIONS = [
  {
    name: "value",
    type: "Date | undefined",
    defaultValue: "undefined",
    description: "Currently selected date. When unset, the placeholder is shown.",
  },
  {
    name: "placeholder",
    type: "string",
    defaultValue: '"Select Date"',
    description: "Label shown when no date is selected.",
  },
  {
    name: "onChange",
    type: "(date: Date) => void",
    defaultValue: "undefined",
    description: "Called when the user picks a date in the calendar modal.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Prevents opening the calendar and applies the disabled visual state.",
  },
  {
    name: "minDate",
    type: "Date | undefined",
    defaultValue: "undefined",
    description: "Earliest selectable date in the calendar.",
  },
  {
    name: "maxDate",
    type: "Date | undefined",
    defaultValue: "undefined",
    description: "Latest selectable date in the calendar.",
  },
  {
    name: "format",
    type: "string",
    defaultValue: '"dd-MMM-yyyy"',
    description: "date-fns format string for displaying the selected date.",
  },
  {
    name: "accessibilityLabel",
    type: "string",
    defaultValue: "undefined",
    description:
      "Custom screen reader label. Defaults to announcing placeholder or selected date.",
  },
  {
    name: "testID",
    type: "string",
    defaultValue: "undefined",
    description: "Test identifier for the chip pressable.",
  },
] as const;

export const datePickerArgTypes: Meta<typeof DatePicker>["argTypes"] = {
  value: {
    control: false,
    description: "Set via story args or interactive state — Date objects are not serializable in controls.",
  },
  placeholder: {
    control: "text",
  },
  format: {
    control: "text",
  },
  disabled: {
    control: "boolean",
  },
  minDate: {
    control: "text",
    description: "ISO date string (yyyy-MM-dd) parsed for minDate constraint.",
  },
  maxDate: {
    control: "text",
    description: "ISO date string (yyyy-MM-dd) parsed for maxDate constraint.",
  },
  onChange: {
    action: "onChange",
  },
  accessibilityLabel: {
    control: "text",
  },
  testID: {
    control: "text",
  },
};
