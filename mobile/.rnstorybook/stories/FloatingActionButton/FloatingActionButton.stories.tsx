import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import {
  FloatingActionButton,
  floatingActionButtonTokens,
} from "../../../components/FloatingActionButton";

import {
  FLOATING_ACTION_BUTTON_DOCS_DESCRIPTION,
  floatingActionButtonArgTypes,
} from "./floatingActionButtonArgTypes";
import { FloatingActionButtonDocsPage } from "./FloatingActionButtonDocsPage";
import { FloatingActionButtonShowcase } from "./FloatingActionButtonShowcase";

const { colors: tokenColors } = floatingActionButtonTokens;

const meta = {
  title: "Design System/FloatingActionButton",
  component: FloatingActionButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: FLOATING_ACTION_BUTTON_DOCS_DESCRIPTION,
      },
    },
    notes: `
# FloatingActionButton

${FLOATING_ACTION_BUTTON_DOCS_DESCRIPTION}

Default props match the Figma FAB: brand, md, rounded, elevated.
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
    variant: "brand",
    size: "md",
    shape: "rounded",
    disabled: false,
    elevated: true,
    accessibilityLabel: "Open Subi actions",
  },
  argTypes: floatingActionButtonArgTypes,
} satisfies Meta<typeof FloatingActionButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full FloatingActionButton documentation with props and grouped examples.",
    controls: { disable: true },
  },
  render: () => <FloatingActionButtonDocsPage />,
};

export const Figma: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <FloatingActionButtonShowcase section="figma" />,
};

export const Sizes: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <FloatingActionButtonShowcase section="sizes" />,
};

export const Variants: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <FloatingActionButtonShowcase section="variants" />,
};

export const Shapes: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <FloatingActionButtonShowcase section="shapes" />,
};

export const States: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <FloatingActionButtonShowcase section="states" />,
};

export const CustomContent: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <FloatingActionButtonShowcase section="custom" />,
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: tokenColors.lightPressed,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  decorator: {
    flex: 1,
    padding: 16,
    backgroundColor: tokenColors.lightPressed,
  },
});
