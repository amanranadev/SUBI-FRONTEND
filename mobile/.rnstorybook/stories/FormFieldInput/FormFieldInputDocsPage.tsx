import React from "react";

import { FormFieldInput } from "../../../components/FormFieldInput";
import {
  DocCodeBlock,
  DocGalleryGrid,
  DocGalleryItem,
  DocParagraph,
  DocPreviewCard,
  DocPropsTable,
  DocScreen,
  DocSection,
  DocSubtitle,
  DocTitle,
} from "../../components/DocsPrimitives";
import {
  FORM_FIELD_INPUT_DOCS_DESCRIPTION,
  FORM_FIELD_INPUT_PROP_DEFINITIONS,
} from "./formFieldInputArgTypes";
import { FormFieldInputShowcase } from "./FormFieldInputShowcase";

const USAGE_BASIC = `<FormFieldInput
  label="FIRST NAME"
  placeholder="First Name"
/>`;

const USAGE_ERROR = `<FormFieldInput
  label="EMAIL"
  value="agent"
  errorText="Enter a valid email address."
/>`;

const USAGE_ICON = `<FormFieldInput
  label="SEARCH"
  placeholder="Search files"
  leftIcon={<Icon name="search" />}
/>`;

const USAGE_PASSWORD = `<FormFieldInput
  label="PASSWORD"
  placeholder="Password"
  isPassword
/>`;

const USAGE_INTERACTIVE_ICON = `<FormFieldInput
  label="DOCUMENT"
  placeholder="Select document"
  rightIcon={<Icon name="document" />}
  onRightIconPress={handlePress}
/>`;

export function FormFieldInputDocsPage() {
  return (
    <DocScreen>
      <DocTitle>FormFieldInput</DocTitle>
      <DocSubtitle>{FORM_FIELD_INPUT_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview preview">
        <DocParagraph>
          Use this as the visual input primitive. Existing react-hook-form
          wrappers can compose it later.
        </DocParagraph>
        <DocPreviewCard label="Figma field">
          <FormFieldInput label="FIRST NAME" placeholder="First Name" />
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...FORM_FIELD_INPUT_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage examples">
        <DocCodeBlock code={USAGE_BASIC} />
        <DocCodeBlock code={USAGE_ERROR} />
        <DocCodeBlock code={USAGE_ICON} />
        <DocCodeBlock code={USAGE_PASSWORD} />
        <DocCodeBlock code={USAGE_INTERACTIVE_ICON} />
        <DocGalleryGrid>
          <DocGalleryItem label="Default">
            <FormFieldInput label="FIRST NAME" placeholder="First Name" />
          </DocGalleryItem>
          <DocGalleryItem label="Error">
            <FormFieldInput
              label="EMAIL"
              value="agent"
              errorText="Enter a valid email address."
            />
          </DocGalleryItem>
          <DocGalleryItem label="Disabled">
            <FormFieldInput label="STATUS" value="Locked" editable={false} />
          </DocGalleryItem>
        </DocGalleryGrid>
      </DocSection>

      <DocSection title="Interactive icons and password">
        <DocParagraph>
          Icon slots stay visual-only unless a press handler is provided.
          Password mode uses internal state to toggle secureTextEntry and
          renders eye / eye-off on the right, overriding rightIcon and
          onRightIconPress.
        </DocParagraph>
        <DocCodeBlock
          code={`onLeftIconPress / onRightIconPress → Pressable with accessibilityRole="button"
isPassword → hidden by default, tap eye to show, tap eye-off to hide
secureTextEntry prop is preserved when isPassword is false`}
        />
      </DocSection>

      <DocSection title="Component gallery">
        <DocParagraph>
          Examples grouped by Figma fields, auth, states, icons, interactive
          icons, password, sizes, and multiline usage.
        </DocParagraph>
        <FormFieldInputShowcase />
      </DocSection>
    </DocScreen>
  );
}
