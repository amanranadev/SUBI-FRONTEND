import type { Meta } from "@storybook/react-native";

import {
  FORM_FIELD_INPUT_SIZES,
  FORM_FIELD_INPUT_VARIANTS,
  FormFieldInput,
} from "../../../components/FormFieldInput";

export const FORM_FIELD_INPUT_PROP_DEFINITIONS = [
  {
    name: "label",
    type: "string",
    defaultValue: "undefined",
    description: "Uppercase field label shown above the input.",
  },
  {
    name: "value",
    type: "string",
    defaultValue: "undefined",
    description: "Controlled input value.",
  },
  {
    name: "placeholder",
    type: "string",
    defaultValue: "undefined",
    description: "Placeholder text inside the input.",
  },
  {
    name: "variant",
    type: FORM_FIELD_INPUT_VARIANTS.map((v) => `"${v}"`).join(" | "),
    defaultValue: '"default"',
    description: "Visual state for border, message, and icon color.",
  },
  {
    name: "inputSize",
    type: FORM_FIELD_INPUT_SIZES.map((s) => `"${s}"`).join(" | "),
    defaultValue: '"md"',
    description: "Controls input height and padding.",
  },
  {
    name: "helperText",
    type: "string",
    defaultValue: "undefined",
    description: "Supporting message shown below the input.",
  },
  {
    name: "errorText",
    type: "string",
    defaultValue: "undefined",
    description: "Error message. Forces error styling when present.",
  },
  {
    name: "required",
    type: "boolean",
    defaultValue: "false",
    description: "Adds an asterisk and hides the optional marker.",
  },
  {
    name: "optionalText",
    type: "string",
    defaultValue: '"Optional"',
    description: "Right-aligned optional marker for non-required fields.",
  },
  {
    name: "leftIcon/rightIcon",
    type: "React.ReactNode",
    defaultValue: "undefined",
    description: "Adornment slots inside the input container.",
  },
  {
    name: "onLeftIconPress",
    type: "() => void",
    defaultValue: "undefined",
    description:
      "When provided, wraps leftIcon in a Pressable with button accessibility.",
  },
  {
    name: "onRightIconPress",
    type: "() => void",
    defaultValue: "undefined",
    description:
      "When provided, wraps rightIcon in a Pressable. Ignored when isPassword is true.",
  },
  {
    name: "isPassword",
    type: "boolean",
    defaultValue: "false",
    description:
      "Enables built-in password visibility toggle with eye / eye-off icons. Takes over the right icon slot.",
  },
  {
    name: "showClearButton",
    type: "boolean",
    defaultValue: "false",
    description: "Shows a clear action when value is non-empty.",
  },
  {
    name: "editable",
    type: "boolean",
    defaultValue: "true",
    description: "Disables editing and applies disabled styling when false.",
  },
] as const;

export const formFieldInputArgTypes: Meta<typeof FormFieldInput>["argTypes"] = {
  label: {
    control: "text",
    description: FORM_FIELD_INPUT_PROP_DEFINITIONS[0].description,
    table: { type: { summary: "string" } },
  },
  value: {
    control: "text",
    description: FORM_FIELD_INPUT_PROP_DEFINITIONS[1].description,
    table: { type: { summary: "string" } },
  },
  placeholder: {
    control: "text",
    description: FORM_FIELD_INPUT_PROP_DEFINITIONS[2].description,
    table: { type: { summary: "string" } },
  },
  variant: {
    control: "select",
    options: [...FORM_FIELD_INPUT_VARIANTS],
    description: FORM_FIELD_INPUT_PROP_DEFINITIONS[3].description,
    table: {
      type: { summary: "FormFieldInputVariant" },
      defaultValue: { summary: "default" },
    },
  },
  inputSize: {
    control: "select",
    options: [...FORM_FIELD_INPUT_SIZES],
    description: FORM_FIELD_INPUT_PROP_DEFINITIONS[4].description,
    table: {
      type: { summary: "FormFieldInputSize" },
      defaultValue: { summary: "md" },
    },
  },
  helperText: {
    control: "text",
    description: FORM_FIELD_INPUT_PROP_DEFINITIONS[5].description,
    table: { type: { summary: "string" } },
  },
  errorText: {
    control: "text",
    description: FORM_FIELD_INPUT_PROP_DEFINITIONS[6].description,
    table: { type: { summary: "string" } },
  },
  required: {
    control: "boolean",
    description: FORM_FIELD_INPUT_PROP_DEFINITIONS[7].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "false" },
    },
  },
  optionalText: {
    control: "text",
    description: FORM_FIELD_INPUT_PROP_DEFINITIONS[8].description,
    table: { type: { summary: "string" } },
  },
  leftIcon: {
    control: false,
    description: FORM_FIELD_INPUT_PROP_DEFINITIONS[9].description,
    table: { type: { summary: "React.ReactNode" } },
  },
  rightIcon: {
    control: false,
    description: FORM_FIELD_INPUT_PROP_DEFINITIONS[9].description,
    table: { type: { summary: "React.ReactNode" } },
  },
  onLeftIconPress: {
    action: "leftIconPress",
    control: false,
    description: FORM_FIELD_INPUT_PROP_DEFINITIONS[10].description,
    table: { type: { summary: "() => void" } },
  },
  onRightIconPress: {
    action: "rightIconPress",
    control: false,
    description: FORM_FIELD_INPUT_PROP_DEFINITIONS[11].description,
    table: { type: { summary: "() => void" } },
  },
  isPassword: {
    control: "boolean",
    description: FORM_FIELD_INPUT_PROP_DEFINITIONS[12].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "false" },
    },
  },
  showClearButton: {
    control: "boolean",
    description: FORM_FIELD_INPUT_PROP_DEFINITIONS[13].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "false" },
    },
  },
  editable: {
    control: "boolean",
    description: FORM_FIELD_INPUT_PROP_DEFINITIONS[14].description,
    table: {
      type: { summary: "boolean" },
      defaultValue: { summary: "true" },
    },
  },
};

export const FORM_FIELD_INPUT_DOCS_DESCRIPTION =
  "FormFieldInput is the reusable mobile text field primitive. It matches the Figma uppercase label plus rounded 48px field style and mirrors the web Input/FormInputField split without coupling to react-hook-form.";
