import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Divider } from "../../../components/Divider";
import { buttonTokens } from "../../../components/PrimaryButton";

import {
  DIVIDER_DOCS_DESCRIPTION,
  dividerArgTypes,
} from "./dividerArgTypes";
import { DividerDocsPage } from "./DividerDocsPage";
import { DividerShowcase } from "./DividerShowcase";

const { colors: tokenColors } = buttonTokens;

const meta = {
  title: "Design System/Divider",
  component: Divider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: DIVIDER_DOCS_DESCRIPTION,
      },
    },
    notes: `
# Divider

${DIVIDER_DOCS_DESCRIPTION}

## Stories

- **Documentation** — Full docs + grouped examples.
- **Variants**, **Orientation**, **Thickness**, **Inset**, **RealUsage** — Section galleries.
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
    variant: "solid",
    orientation: "horizontal",
    thickness: 1,
    inset: false,
  },
  argTypes: dividerArgTypes,
} satisfies Meta<typeof Divider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full component documentation with grouped gallery layout.",
    controls: { disable: true },
  },
  render: () => <DividerDocsPage />,
};

export const Variants: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <DividerShowcase section="variants" />,
};

export const Orientation: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <DividerShowcase section="orientation" />,
};

export const Thickness: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <DividerShowcase section="thickness" />,
};

export const Inset: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <DividerShowcase section="inset" />,
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
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
});
