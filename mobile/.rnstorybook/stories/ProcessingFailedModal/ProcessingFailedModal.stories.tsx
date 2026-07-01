import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ProcessingFailedModal } from "../../../components/ProcessingFailedModal";
import { buttonTokens } from "../../../components/PrimaryButton";

import {
  PROCESSING_FAILED_MODAL_DOCS_DESCRIPTION,
  processingFailedModalArgTypes,
} from "./processingFailedModalArgTypes";
import {
  DEFAULT_ERROR_MESSAGE,
  DEFAULT_FAILED_TITLE,
} from "./processingFailedModalConstants";
import { ProcessingFailedModalDocsPage } from "./ProcessingFailedModalDocsPage";
import { ProcessingFailedModalShowcase } from "./ProcessingFailedModalShowcase";

const { colors: tokenColors } = buttonTokens;

const meta = {
  title: "Design System/ProcessingFailedModal",
  component: ProcessingFailedModal,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: PROCESSING_FAILED_MODAL_DOCS_DESCRIPTION,
      },
    },
    notes: `
# ProcessingFailedModal

${PROCESSING_FAILED_MODAL_DOCS_DESCRIPTION}

## Stories

- **Documentation** — Full docs + grouped gallery.
- **DefaultFailure**, **LongErrorMessage**, **NetworkError**, **PermissionError**, **LoadingRetry** — State galleries.
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
    title: DEFAULT_FAILED_TITLE,
    errorMessage: DEFAULT_ERROR_MESSAGE,
    loading: false,
    onRetry: () => undefined,
    onCancel: () => undefined,
  },
  argTypes: processingFailedModalArgTypes,
} satisfies Meta<typeof ProcessingFailedModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full component documentation with grouped gallery layout.",
    controls: { disable: true },
  },
  render: () => <ProcessingFailedModalDocsPage />,
};

export const DefaultFailure: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ProcessingFailedModalShowcase section="default" />,
};

export const LongErrorMessage: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ProcessingFailedModalShowcase section="long-error" />,
};

export const NetworkError: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ProcessingFailedModalShowcase section="network-error" />,
};

export const PermissionError: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ProcessingFailedModalShowcase section="permission-error" />,
};

export const LoadingRetry: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ProcessingFailedModalShowcase section="loading-retry" />,
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
