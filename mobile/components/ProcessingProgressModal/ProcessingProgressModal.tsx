import React, { memo, useCallback, useMemo } from "react";
import { Text, View } from "react-native";

import { Icon } from "@/assets/icon-system";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProgressBar } from "@/components/ProgressBar";
import { Stepper } from "@/components/Stepper";

import type { ProcessingProgressModalProps } from "./ProcessingProgressModal.types";
import {
  processingProgressModalStyles,
  processingProgressModalTokens,
} from "./ProcessingProgressModal.styles";

const DEFAULT_TITLE = "Processing Your Document";
const DEFAULT_DESCRIPTION = "Checking cache and starting analysis...";
const STOP_BUTTON_LABEL = "Stop Processing";

const { colors, sizing } = processingProgressModalTokens;

function clampProgress(progress: number): number {
  return Math.min(Math.max(progress, 0), 100);
}

function buildAccessibilityLabel(
  title: string,
  description: string,
  progress: number,
  activeStep: number,
  stepsLength: number,
): string {
  const currentLabel =
    activeStep >= 0 && activeStep < stepsLength
      ? `Current step ${activeStep + 1} of ${stepsLength}.`
      : stepsLength > 0 && activeStep >= stepsLength
        ? "All steps completed."
        : "";

  return `${title}. ${description}. Progress ${Math.round(progress)} percent. ${currentLabel}`.trim();
}

export const ProcessingProgressModal = memo(function ProcessingProgressModal({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  progress,
  steps,
  activeStep,
  onStopProcessing,
  loading = false,
  testID,
}: ProcessingProgressModalProps) {
  const safeProgress = clampProgress(progress);

  const heroIcon = useMemo(
    () => (
      <Icon
        name="star"
        size={sizing.heroIcon}
        color={colors.brandOrange}
        accessible={false}
      />
    ),
    [],
  );

  const stopIcon = useMemo(
    () => (
      <Icon
        name="stop"
        size={sizing.stopIcon}
        color={colors.textPrimary}
        accessible={false}
      />
    ),
    [],
  );

  const handleStopProcessing = useCallback(() => {
    onStopProcessing?.();
  }, [onStopProcessing]);

  const accessibilityLabel = useMemo(
    () =>
      buildAccessibilityLabel(
        title,
        description,
        safeProgress,
        activeStep,
        steps.length,
      ),
    [title, description, safeProgress, activeStep, steps.length],
  );

  return (
    <View
      style={processingProgressModalStyles.container}
      testID={testID}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={processingProgressModalStyles.iconContainer}>{heroIcon}</View>

      <View style={processingProgressModalStyles.textBlock}>
        <Text style={processingProgressModalStyles.title} accessible={false}>
          {title}
        </Text>
        <Text
          style={processingProgressModalStyles.description}
          accessible={false}
        >
          {description}
        </Text>
      </View>

      <ProgressBar
        value={safeProgress}
        variant="success"
        animated
        style={processingProgressModalStyles.progressBar}
        accessibilityLabel={`Document processing progress ${Math.round(safeProgress)} percent`}
      />

      <View style={processingProgressModalStyles.stepper}>
        <Stepper steps={steps} activeStep={activeStep} />
      </View>

      {onStopProcessing ? (
        <PrimaryButton
          variant="outline"
          size="md"
          shape="pill"
          fullWidth
          leftIcon={stopIcon}
          onPress={handleStopProcessing}
          loading={loading}
          disabled={loading}
          accessibilityLabel={STOP_BUTTON_LABEL}
          testID={testID ? `${testID}-stop` : undefined}
          style={processingProgressModalStyles.stopButton}
        >
          {STOP_BUTTON_LABEL}
        </PrimaryButton>
      ) : null}
    </View>
  );
});
