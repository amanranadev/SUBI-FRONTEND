import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../assets/icon-system";
import { PrimaryButton, buttonTokens } from "../../../components/PrimaryButton";

import {
  DocBulletList,
  DocCallout,
  DocCodeBlock,
  DocGalleryGrid,
  DocGalleryItem,
  DocHeading,
  DocParagraph,
  DocPreviewCard,
  DocPropsTable,
  DocScreen,
  DocSection,
  DocSubtitle,
  DocTitle,
  DocTokenGroup,
} from "../../components/DocsPrimitives";
import { PrimaryButtonShowcase } from "./PrimaryButtonShowcase";
import {
  PRIMARY_BUTTON_DOCS_DESCRIPTION,
  PRIMARY_BUTTON_PROP_DEFINITIONS,
} from "./primaryButtonArgTypes";

const { colors: c } = buttonTokens;

const USAGE_TEXT_ONLY = `<PrimaryButton variant="primary">
  Login
</PrimaryButton>`;

const USAGE_LEFT_ICON = `<PrimaryButton
  leftIcon={<Icon name="google" />}
>
  Continue with Google
</PrimaryButton>`;

const USAGE_RIGHT_ICON = `<PrimaryButton
  rightIcon={<Icon name="arrow-right" />}
>
  Continue
</PrimaryButton>`;

const USAGE_BOTH_ICONS = `<PrimaryButton
  leftIcon={<Icon name="search" />}
  rightIcon={<Icon name="arrow-right" />}
>
  Search
</PrimaryButton>`;

const USAGE_ICON_ONLY = `<PrimaryButton
  variant="icon-only"
  leftIcon={<Icon name="search" />}
  accessibilityLabel="Search"
/>`;

export function PrimaryButtonDocsPage() {
  return (
    <DocScreen>
      <DocTitle>PrimaryButton</DocTitle>
      <DocSubtitle>{PRIMARY_BUTTON_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview preview">
        <DocParagraph>
          Use the section stories in the sidebar (Primary Actions, Chips, Icon
          Only, etc.) to browse variants. Icon slots are composed in code — see
          Usage examples below.
        </DocParagraph>
        <DocPreviewCard label="Primary CTA">
          <PrimaryButton variant="primary" size="lg">
            Log in
          </PrimaryButton>
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...PRIMARY_BUTTON_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage examples">
        <DocHeading level={3}>Text only</DocHeading>
        <DocCodeBlock code={USAGE_TEXT_ONLY} />
        <DocHeading level={3}>Left icon</DocHeading>
        <DocCodeBlock code={USAGE_LEFT_ICON} />
        <DocHeading level={3}>Right icon</DocHeading>
        <DocCodeBlock code={USAGE_RIGHT_ICON} />
        <DocHeading level={3}>Both icons</DocHeading>
        <DocCodeBlock code={USAGE_BOTH_ICONS} />
        <DocHeading level={3}>Icon only</DocHeading>
        <DocCodeBlock code={USAGE_ICON_ONLY} />
        <DocHeading level={3}>Live previews</DocHeading>
        <DocGalleryGrid>
          <DocGalleryItem label="Text only">
            <PrimaryButton variant="primary">Login</PrimaryButton>
          </DocGalleryItem>
          <DocGalleryItem label="Left icon">
            <PrimaryButton
              variant="secondary"
              size="lg"
              leftIcon={<Icon name="google" size={20} />}
            >
              Continue with Google
            </PrimaryButton>
          </DocGalleryItem>
          <DocGalleryItem label="Right icon">
            <PrimaryButton
              variant="primary"
              size="md"
              rightIcon={
                <Icon name="arrow-right" size={16} color={c.textOnBrand} />
              }
            >
              Continue
            </PrimaryButton>
          </DocGalleryItem>
          <DocGalleryItem label="Both icons">
            <PrimaryButton
              variant="chip"
              size="sm"
              leftIcon={<Icon name="search" size={15} />}
              rightIcon={<Icon name="arrow-right" size={15} />}
            >
              Search
            </PrimaryButton>
          </DocGalleryItem>
          <DocGalleryItem label="Icon only">
            <PrimaryButton
              variant="icon-only"
              size="md"
              leftIcon={<Icon name="search" size={18} color={c.iconMuted} />}
              accessibilityLabel="Search"
            />
          </DocGalleryItem>
        </DocGalleryGrid>
      </DocSection>

      <DocSection title="Component gallery">
        <DocParagraph>
          Examples grouped by purpose — primary actions, secondary actions,
          chips, icon-only, disabled, and loading.
        </DocParagraph>
        <PrimaryButtonShowcase />
      </DocSection>

    </DocScreen>
  );
}

// const docPageStyles = StyleSheet.create({
//   footer: {
//     marginTop: 32,
//     paddingTop: 16,
//     borderTopWidth: 1,
//     borderTopColor: "#ECECEC",
//   },
//   footerText: {
//     fontSize: 12,
//     color: "#9A9A9A",
//     fontFamily: "monospace",
//   },
// });
