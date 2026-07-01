import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Stepper } from "../../../components/Stepper";
import { buttonTokens } from "../../../components/PrimaryButton";

import {
  STEPPER_DOCS_DESCRIPTION,
  stepperArgTypes,
} from "./stepperArgTypes";
import { LONG_LABEL_STEPS, WORKFLOW_STEPS } from "./stepperConstants";
import { StepperDocsPage } from "./StepperDocsPage";
import { StepperShowcase } from "./StepperShowcase";

const { colors: tokenColors } = buttonTokens;

const meta = {
  title: "Design System/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: STEPPER_DOCS_DESCRIPTION,
      },
    },
    notes: `
# Stepper

${STEPPER_DOCS_DESCRIPTION}

## Stories

- **Documentation** — Full docs + grouped examples.
- **UploadActive**, **TextExtractionActive**, **AIAnalysisActive**, **AllStepsReached**, **LongLabels** — Section galleries.
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
    steps: WORKFLOW_STEPS,
    activeStep: 1,
  },
  argTypes: stepperArgTypes,
} satisfies Meta<typeof Stepper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full component documentation with grouped gallery layout.",
    controls: { disable: true },
  },
  render: () => <StepperDocsPage />,
};

export const UploadActive: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <StepperShowcase section="upload-active" />,
};

export const TextExtractionActive: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <StepperShowcase section="text-extraction-active" />,
};

export const AIAnalysisActive: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <StepperShowcase section="ai-analysis-active" />,
};

export const AllStepsReached: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <StepperShowcase section="all-reached" />,
};

export const LongLabels: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  args: {
    steps: LONG_LABEL_STEPS,
    activeStep: 1,
  },
  render: () => <StepperShowcase section="long-labels" />,
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
