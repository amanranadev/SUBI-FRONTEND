import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ProcessingProgressModal } from "../../../components/ProcessingProgressModal";
import { buttonTokens } from "../../../components/PrimaryButton";

import {
  PROCESSING_PROGRESS_MODAL_DOCS_DESCRIPTION,
  processingProgressModalArgTypes,
} from "./processingProgressModalArgTypes";
import {
  DEFAULT_PROCESSING_DESCRIPTION,
  DEFAULT_PROCESSING_TITLE,
  PROCESSING_WORKFLOW_STEPS,
} from "./processingProgressModalConstants";
import { ProcessingProgressModalDocsPage } from "./ProcessingProgressModalDocsPage";
import { ProcessingProgressModalShowcase } from "./ProcessingProgressModalShowcase";

const { colors: tokenColors } = buttonTokens;

const meta = {
  title: "Design System/ProcessingProgressModal",
  component: ProcessingProgressModal,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: PROCESSING_PROGRESS_MODAL_DOCS_DESCRIPTION,
      },
    },
    notes: `
# ProcessingProgressModal

${PROCESSING_PROGRESS_MODAL_DOCS_DESCRIPTION}

## Stories

- **Documentation** — Full docs + grouped gallery.
- **InitialProcessing**, **ExtractionInProgress**, **AIAnalysisInProgress**, **Complete**, **LongDescription** — State galleries.
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
    title: DEFAULT_PROCESSING_TITLE,
    description: DEFAULT_PROCESSING_DESCRIPTION,
    progress: 45,
    steps: PROCESSING_WORKFLOW_STEPS,
    activeStep: 1,
    loading: false,
    onStopProcessing: () => undefined,
  },
  argTypes: processingProgressModalArgTypes,
} satisfies Meta<typeof ProcessingProgressModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full component documentation with grouped gallery layout.",
    controls: { disable: true },
  },
  render: () => <ProcessingProgressModalDocsPage />,
};

export const InitialProcessing: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ProcessingProgressModalShowcase section="initial" />,
};

export const ExtractionInProgress: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ProcessingProgressModalShowcase section="extraction" />,
};

export const AIAnalysisInProgress: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ProcessingProgressModalShowcase section="ai-analysis" />,
};

export const Complete: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ProcessingProgressModalShowcase section="complete" />,
};

export const LongDescription: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ProcessingProgressModalShowcase section="long-description" />,
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
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
});
