import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Icon } from "@/assets/icon-system";
import { PrimaryButton, buttonTokens } from "@/components/PrimaryButton";

import {
  PRIMARY_BUTTON_DOCS_DESCRIPTION,
  primaryButtonArgTypes,
} from "./primaryButtonArgTypes";
import { PrimaryButtonDocsPage } from "./PrimaryButtonDocsPage";
import { PrimaryButtonShowcase } from "./PrimaryButtonShowcase";
import {
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

const { colors: tokenColors } = buttonTokens;

const meta = {
  title: "Design System/PrimaryButton",
  component: PrimaryButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: PRIMARY_BUTTON_DOCS_DESCRIPTION,
      },
    },
    notes: `
# PrimaryButton

${PRIMARY_BUTTON_DOCS_DESCRIPTION}

## Stories

- **Documentation** — Full docs + grouped examples (Primary, Secondary, Chips, Icon Only, Disabled, Loading).
- **IconPlacement** — Left, right, and both icon examples in one story.
- **PrimaryActions**, **SecondaryActions**, **Chips**, **IconOnly**, **Disabled**, **Loading** — Section galleries.

Always use \`<Icon name="…" />\` for icons — never import SVGs directly.
    `.trim(),
  },
  decorators: [
    (Story, context) => {
      if (context.parameters.docsPage || context.parameters.galleryPage) {
        return (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
          >
            <Story />
          </ScrollView>
        );
      }
      return (
        <View style={styles.decorator}>
          <Story />
        </View>
      );
    },
  ],
  args: {
    children: "Button",
    variant: "primary",
    size: "lg",
    shape: "pill",
    disabled: false,
    loading: false,
    fullWidth: false,
    elevated: false,
  },
  argTypes: primaryButtonArgTypes,
} satisfies Meta<typeof PrimaryButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full component documentation with grouped gallery layout.",
    controls: { disable: true },
  },
  render: () => <PrimaryButtonDocsPage />,
};

export const PrimaryActions: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <PrimaryButtonShowcase section="primary" />,
};

export const SecondaryActions: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <PrimaryButtonShowcase section="secondary" />,
};

export const Chips: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <PrimaryButtonShowcase section="chips" />,
};

/** Left, right, and both icon slots in one gallery. */
export const IconPlacement: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => (
    <GalleryScreen>
      <GallerySection
        title="Icon placement"
        description="Compose icons via leftIcon and rightIcon slots using the shared Icon component."
      >
        <GalleryItem label="Left icon">
          <PrimaryButton
            variant="secondary"
            size="lg"
            leftIcon={<Icon name="google" size={20} />}
          >
            Continue with Google
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Left icon">
          <PrimaryButton
            variant="primary"
            size="md"
            shape="rounded"
            elevated
            leftIcon={
              <Icon name="retry" size={16} color={tokenColors.textOnBrand} />
            }
          >
            Try Again
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Right icon">
          <PrimaryButton
            variant="primary"
            size="md"
            shape="rounded"
            rightIcon={
              <Icon name="arrow-right" size={16} color={tokenColors.textOnBrand} />
            }
          >
            Continue
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Both icons">
          <PrimaryButton
            variant="chip"
            size="sm"
            leftIcon={<Icon name="search" size={15} />}
            rightIcon={<Icon name="arrow-right" size={15} />}
          >
            Search
          </PrimaryButton>
        </GalleryItem>
      </GallerySection>
    </GalleryScreen>
  ),
};

export const IconOnly: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <PrimaryButtonShowcase section="icon-only" />,
};

export const Disabled: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <PrimaryButtonShowcase section="disabled" />,
};

export const Loading: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <PrimaryButtonShowcase section="loading" />,
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: tokenColors.surfaceBackground,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  decorator: {
    flex: 1,
    padding: 16,
    backgroundColor: tokenColors.surfaceBackground,
  },
});
