import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Stepper, stepperTokens } from "../../../components/Stepper";
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
import { StepperShowcase } from "./StepperShowcase";
import {
  STEPPER_DOCS_DESCRIPTION,
  STEPPER_PROP_DEFINITIONS,
} from "./stepperArgTypes";
import { WORKFLOW_STEPS } from "./stepperConstants";

const { colors, typography, spacing, iconSize } = stepperTokens;
const { colors: sharedColors, typography: sharedTypography } = buttonTokens;

const USAGE_EXAMPLE = `<Stepper
  activeStep={1}
  steps={[
    { id: 'upload', label: 'Upload', icon: 'check-circle' },
    { id: 'text-extraction', label: 'Text Extraction', icon: 'document' },
    { id: 'ai-analysis', label: 'AI Analysis', icon: 'ai-analysis' },
  ]}
/>`;

export function StepperDocsPage() {
  const [playgroundActiveStep, setPlaygroundActiveStep] = useState(1);

  return (
    <DocScreen>
      <DocTitle>Stepper</DocTitle>
      <DocSubtitle>{STEPPER_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview">
        <DocParagraph>
          Stepper indicates workflow progress across a fixed sequence of steps.
          It is read-only UI — errors, validation, and upload state belong in
          parent screens, not in this component.
        </DocParagraph>
        <DocPreviewCard label="Default workflow (Text Extraction active)">
          <Stepper activeStep={1} steps={WORKFLOW_STEPS} />
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Playground">
        <DocParagraph>
          Adjust activeStep to preview how completed, active, and upcoming
          states are derived automatically.
        </DocParagraph>
        <View style={playgroundStyles.controls}>
          {[0, 1, 2, 3].map((step) => {
            const selected = playgroundActiveStep === step;
            return (
              <Pressable
                key={step}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Set active step to ${step}`}
                onPress={() => setPlaygroundActiveStep(step)}
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
                  {step}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <DocPreviewCard label={`activeStep=${playgroundActiveStep}`}>
          <Stepper activeStep={playgroundActiveStep} steps={WORKFLOW_STEPS} />
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...STEPPER_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage example">
        <DocCodeBlock code={USAGE_EXAMPLE} />
      </DocSection>

      <DocSection title="State logic">
        <DocParagraph>
          Consumers pass only activeStep. Stepper derives status per index:
        </DocParagraph>
        <DocCodeBlock
          code={`index < activeStep  → completed (green)
index === activeStep → active (brand orange)
index > activeStep   → upcoming (muted grey)`}
        />
        <DocHeading level={3}>Supported states</DocHeading>
        <DocParagraph>completed, active, upcoming</DocParagraph>
        <DocHeading level={3}>Not supported</DocHeading>
        <DocParagraph>error, warning, disabled</DocParagraph>
      </DocSection>

      <DocSection title="Gallery">
        <StepperShowcase section="upload-active" />
        <StepperShowcase section="text-extraction-active" />
        <StepperShowcase section="ai-analysis-active" />
        <StepperShowcase section="all-reached" />
        <StepperShowcase section="long-labels" />
      </DocSection>
    </DocScreen>
  );
}

const playgroundStyles = StyleSheet.create({
  controls: {
    flexDirection: "row",
    gap: stepperTokens.spacing.stepItemGap,
    marginBottom: stepperTokens.spacing.stepGap,
  },
  control: {
    minWidth: 36,
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
