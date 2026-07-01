import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ProgressBar, progressBarTokens } from "../../../components/ProgressBar";

import {
  PROGRESS_BAR_DOCS_DESCRIPTION,
  progressBarArgTypes,
} from "./progressBarArgTypes";
import { ProgressBarDocsPage } from "./ProgressBarDocsPage";
import { ProgressBarShowcase } from "./ProgressBarShowcase";

const { colors: tokenColors } = progressBarTokens;

const meta = {
  title: "Design System/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: PROGRESS_BAR_DOCS_DESCRIPTION,
      },
    },
    notes: `
# ProgressBar

${PROGRESS_BAR_DOCS_DESCRIPTION}

Use \`size="md"\` for the Figma Home processing screen. Keep business state outside this primitive.
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
    value: 37,
    variant: "default",
    size: "md",
    striped: false,
    animated: false,
    showLabel: false,
    labelPosition: "none",
  },
  argTypes: progressBarArgTypes,
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full ProgressBar documentation with props and grouped examples.",
    controls: { disable: true },
  },
  render: () => <ProgressBarDocsPage />,
};

export const FigmaProcessing: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ProgressBarShowcase section="figma" />,
};

export const Values: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ProgressBarShowcase section="values" />,
};

export const Sizes: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ProgressBarShowcase section="sizes" />,
};

export const Variants: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ProgressBarShowcase section="variants" />,
};

export const Labels: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ProgressBarShowcase section="labels" />,
};

export const Striped: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ProgressBarShowcase section="striped" />,
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: tokenColors.track,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  decorator: {
    flex: 1,
    padding: 16,
    backgroundColor: tokenColors.track,
  },
});
