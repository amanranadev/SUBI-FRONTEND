import React from "react";
import { Pressable, StyleSheet } from "react-native";

import { Icon } from "../../../assets/icon-system";
import { AppHeader, appHeaderTokens } from "../../../components/AppHeader";
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
  APP_HEADER_DOCS_DESCRIPTION,
  APP_HEADER_PROP_DEFINITIONS,
} from "./appHeaderArgTypes";
import { AppHeaderShowcase } from "./AppHeaderShowcase";

const { colors } = appHeaderTokens;

const USAGE_DEFAULT = `<AppHeader />`;

const USAGE_TITLE = `<AppHeader title="Transactions" />`;

const USAGE_BACK = `<AppHeader
  title="Transactions"
  showBackButton
  onBackPress={() => router.back()}
/>`;

const USAGE_ACTION = `<AppHeader
  rightContent={
    <Pressable accessibilityRole="button" accessibilityLabel="Open settings">
      <Icon name="settings" size={24} />
    </Pressable>
  }
/>`;

export function AppHeaderDocsPage() {
  return (
    <DocScreen>
      <DocTitle>AppHeader</DocTitle>
      <DocSubtitle>{APP_HEADER_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview preview">
        <DocParagraph>
          The Subi logo is rendered internally. Consumers should not pass custom
          logo content. Use title, showBackButton, and rightContent to adapt the
          header per screen.
        </DocParagraph>
        <DocPreviewCard label="Default">
          <AppHeader />
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...APP_HEADER_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage examples">
        <DocCodeBlock code={USAGE_DEFAULT} />
        <DocCodeBlock code={USAGE_TITLE} />
        <DocCodeBlock code={USAGE_BACK} />
        <DocCodeBlock code={USAGE_ACTION} />
        <DocGalleryGrid>
          <DocGalleryItem label="Default">
            <AppHeader />
          </DocGalleryItem>
          <DocGalleryItem label="With title">
            <AppHeader title="Transactions" />
          </DocGalleryItem>
          <DocGalleryItem label="With settings">
            <AppHeader
              rightContent={
                <Pressable
                  style={styles.actionButton}
                  accessibilityRole="button"
                  accessibilityLabel="Open settings"
                >
                  <Icon
                    name="settings"
                    size={24}
                    color={colors.iconPrimary}
                    accessible={false}
                  />
                </Pressable>
              }
            />
          </DocGalleryItem>
        </DocGalleryGrid>
      </DocSection>

      <DocSection title="Component gallery">
        <DocParagraph>
          Examples grouped by default branding, right actions, titles, back
          navigation, full composition, sizes, and variants.
        </DocParagraph>
        <AppHeaderShowcase />
      </DocSection>
    </DocScreen>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
