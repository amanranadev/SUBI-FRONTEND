import type { Meta } from "@storybook/react-native";

import { PersonInfoSection } from "../../../components/PersonInfoSection";

export const PERSON_INFO_SECTION_DOCS_DESCRIPTION =
  "A reusable person/contact information block for buyers, sellers, agents, and contacts. It composes FormFieldInput fields while leaving validation and workflow logic to parents.";

export const PERSON_INFO_SECTION_PROP_DEFINITIONS = [
  {
    name: "firstName",
    type: "string",
    defaultValue: "required",
    description: "First name field value.",
    required: true,
  },
  {
    name: "lastName",
    type: "string",
    defaultValue: "required",
    description: "Last name field value.",
    required: true,
  },
  {
    name: "email",
    type: "string",
    defaultValue: "required",
    description: "Email field value.",
    required: true,
  },
  {
    name: "phone",
    type: "string",
    defaultValue: "undefined",
    description: "Optional phone value. Omit phone and onPhoneChange to hide the phone row.",
  },
  {
    name: "onFirstNameChange",
    type: "(value: string) => void",
    defaultValue: "undefined",
    description: "Called when the first name changes. Field is read-only when omitted.",
  },
  {
    name: "onLastNameChange",
    type: "(value: string) => void",
    defaultValue: "undefined",
    description: "Called when the last name changes. Field is read-only when omitted.",
  },
  {
    name: "onEmailChange",
    type: "(value: string) => void",
    defaultValue: "undefined",
    description: "Called when the email changes. Field is read-only when omitted.",
  },
  {
    name: "onPhoneChange",
    type: "(value: string) => void",
    defaultValue: "undefined",
    description: "Called when the phone changes. Field is read-only when omitted.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Makes all fields non-editable.",
  },
  {
    name: "testID",
    type: "string",
    defaultValue: "undefined",
    description: "Test identifier for the section container.",
  },
] as const;

export const personInfoSectionArgTypes: Meta<
  typeof PersonInfoSection
>["argTypes"] = {
  firstName: {
    control: "text",
  },
  lastName: {
    control: "text",
  },
  email: {
    control: "text",
  },
  phone: {
    control: "text",
  },
  disabled: {
    control: "boolean",
  },
  testID: {
    control: "text",
  },
};
