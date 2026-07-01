import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppHeader, appHeaderTokens } from "../../../components/AppHeader";

import {
  APP_HEADER_DOCS_DESCRIPTION,
  appHeaderArgTypes,
} from "./appHeaderArgTypes";
import { AppHeaderDocsPage } from "./AppHeaderDocsPage";
import { AppHeaderShowcase } from "./AppHeaderShowcase";

const { colors: tokenColors } = appHeaderTokens;

const meta = {
  title: "Design System/AppHeader",
  component: AppHeader,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: APP_HEADER_DOCS_DESCRIPTION,
      },
    },
    notes: `
# AppHeader

${APP_HEADER_DOCS_DESCRIPTION}

Default props render the built-in Subi logo only.
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
    title: undefined,
    showBackButton: false,
    size: "md",
    variant: "default",
    disabled: false,
  },
  argTypes: appHeaderArgTypes,
} satisfies Meta<typeof AppHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full AppHeader documentation with props and grouped examples.",
    controls: { disable: true },
  },
  render: () => <AppHeaderDocsPage />,
};

export const Default: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <AppHeaderShowcase section="default" />,
};

export const WithSettings: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <AppHeaderShowcase section="settings" />,
};

export const WithTitle: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <AppHeaderShowcase section="title" />,
};

export const WithBackButton: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <AppHeaderShowcase section="back" />,
};

export const FullExample: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <AppHeaderShowcase section="full" />,
};

export const Sizes: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <AppHeaderShowcase section="sizes" />,
};

export const Variants: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <AppHeaderShowcase section="variants" />,
};

export const Playground: Story = {
  render: (args) => <AppHeader {...args} />,
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: tokenColors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  decorator: {
    flex: 1,
    padding: 16,
    backgroundColor: tokenColors.background,
  },
});
