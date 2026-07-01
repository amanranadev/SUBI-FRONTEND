import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  ProcessingProgressModal,
  processingProgressModalTokens,
} from "../../../components/ProcessingProgressModal";
import { buttonTokens } from "../../../components/PrimaryButton";

import {
  DocCodeBlock,
  DocHeading,
  DocParagraph,
  DocPreviewCard,
  DocPropsTable,
  DocScreen,
  DocSection,
  DocSubtitle,
  DocTitle,
} from "../../components/DocsPrimitives";
import { ProcessingProgressModalShowcase } from "./ProcessingProgressModalShowcase";
import {
  PROCESSING_PROGRESS_MODAL_DOCS_DESCRIPTION,
  PROCESSING_PROGRESS_MODAL_PROP_DEFINITIONS,
} from "./processingProgressModalArgTypes";
import {
  DEFAULT_PROCESSING_DESCRIPTION,
  DEFAULT_PROCESSING_TITLE,
  deriveActiveStepFromProgress,
  PROCESSING_WORKFLOW_STEPS,
} from "./processingProgressModalConstants";

const { colors, typography, spacing, sizing, radius } =
  processingProgressModalTokens;
const { colors: sharedColors, typography: sharedTypography } = buttonTokens;

const USAGE_EXAMPLE = `<ProcessingProgressModal
  progress={45}
  activeStep={1}
  steps={steps}
  onStopProcessing={handleStop}
/>`;

export function ProcessingProgressModalDocsPage() {
  const [playgroundProgress, setPlaygroundProgress] = useState(45);
  const playgroundActiveStep = deriveActiveStepFromProgress(
    playgroundProgress,
    PROCESSING_WORKFLOW_STEPS.length,
  );

  return (
    <DocScreen>
      <DocTitle>ProcessingProgressModal</DocTitle>
      <DocSubtitle>{PROCESSING_PROGRESS_MODAL_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview">
        <DocParagraph>
          ProcessingProgressModal is the mobile document-processing progress
          experience. It composes existing design-system primitives and does
          not own validation, errors, or upload state management.
        </DocParagraph>
        <DocPreviewCard label="Text Extraction in progress">
          <ProcessingProgressModal
            progress={50}
            activeStep={1}
            steps={PROCESSING_WORKFLOW_STEPS}
            onStopProcessing={() => undefined}
          />
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Playground">
        <DocParagraph>
          Adjust progress to preview composed behavior. activeStep is derived
          automatically from the current progress value.
        </DocParagraph>
        <View style={playgroundStyles.controlRow}>
          <Text style={playgroundStyles.controlHeading}>progress</Text>
          <View style={playgroundStyles.controls}>
            {[0, 25, 50, 75, 100].map((value) => {
              const selected = playgroundProgress === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Set progress to ${value}`}
                  onPress={() => setPlaygroundProgress(value)}
                  style={[
                    playgroundStyles.control,
                    selected && playgroundStyles.controlSelected,
                  ]}
                >
                  <Text
                    style={[
                      playgroundStyles.controlLabel,
                      selected && playgroundStyles.controlLabelSelected,
                    ]}
                  >
                    {value}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <DocPreviewCard
          label={`progress=${playgroundProgress}, activeStep=${playgroundActiveStep} (derived)`}
        >
          <ProcessingProgressModal
            title={DEFAULT_PROCESSING_TITLE}
            description={DEFAULT_PROCESSING_DESCRIPTION}
            progress={playgroundProgress}
            activeStep={playgroundActiveStep}
            steps={PROCESSING_WORKFLOW_STEPS}
            onStopProcessing={() => undefined}
          />
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...PROCESSING_PROGRESS_MODAL_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage example">
        <DocCodeBlock code={USAGE_EXAMPLE} />
      </DocSection>

      <DocSection title="Composition">
        <DocParagraph>
          This component reuses existing primitives — do not recreate them
          inline:
        </DocParagraph>
        <DocCodeBlock
          code={`Icon — hero star and stop button icons
ProgressBar — success variant with progress value mapping
Stepper — steps and activeStep mapping
PrimaryButton — outline Stop Processing action`}
        />
      </DocSection>

      <DocSection title="Gallery">
        <ProcessingProgressModalShowcase section="initial" />
        <ProcessingProgressModalShowcase section="extraction" />
        <ProcessingProgressModalShowcase section="ai-analysis" />
        <ProcessingProgressModalShowcase section="complete" />
        <ProcessingProgressModalShowcase section="long-description" />
      </DocSection>
    </DocScreen>
  );
}

const playgroundStyles = StyleSheet.create({
  controlRow: {
    gap: processingProgressModalTokens.spacing.textGap,
    marginBottom: processingProgressModalTokens.spacing.sectionGap,
  },
  controlHeading: {
    ...sharedTypography.bodySmall,
    color: sharedColors.textMuted,
    fontWeight: "600",
  },
  controls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: processingProgressModalTokens.spacing.textGap,
  },
  control: {
    minWidth: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: sharedColors.borderField,
    backgroundColor: sharedColors.surfaceCard,
    alignItems: "center",
  },
  controlSelected: {
    borderColor: sharedColors.brandOrange,
    backgroundColor: sharedColors.surfaceMuted,
  },
  controlLabel: {
    ...sharedTypography.bodySmall,
    color: sharedColors.textPrimary,
  },
  controlLabelSelected: {
    color: sharedColors.brandOrange,
    fontWeight: "600",
  },
});
