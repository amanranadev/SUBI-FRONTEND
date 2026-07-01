import { StyleSheet, type TextStyle } from "react-native";

import { stepperTokens, type StepperStatus } from "./tokens";

const { colors, typography, spacing, iconSize } = stepperTokens;

export interface StepItemStyleMetrics {
  iconColor: string;
}

export function resolveStepItemMetrics(status: StepperStatus): StepItemStyleMetrics {
  return {
    iconColor: colors[status],
  };
}

export const stepperStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.stepGap,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.stepItemGap,
    flexShrink: 1,
  },
  label: {
    ...typography.caption,
    flexShrink: 1,
  },
  labelCompleted: {
    color: colors.completed,
  },
  labelActive: {
    color: colors.active,
  },
  labelUpcoming: {
    color: colors.upcoming,
  },
});

const labelStyles: Record<StepperStatus, TextStyle> = {
  completed: stepperStyles.labelCompleted,
  active: stepperStyles.labelActive,
  upcoming: stepperStyles.labelUpcoming,
};

export function resolveStepItemLabelStyle(status: StepperStatus) {
  return [stepperStyles.label, labelStyles[status]];
}

export function getStepAccessibilityLabel(
  label: string,
  status: StepperStatus,
): string {
  if (status === "active") {
    return `${label}, current step`;
  }
  if (status === "completed") {
    return `${label}, completed`;
  }
  return `${label}, upcoming`;
}

export function getStepperAccessibilityValue(
  stepsLength: number,
  activeStep: number,
  activeLabel: string | undefined,
) {
  const maxIndex = Math.max(stepsLength - 1, 0);
  const clampedStep = Math.min(Math.max(activeStep, 0), maxIndex);

  return {
    min: 0,
    max: maxIndex,
    now: clampedStep,
    text: activeLabel ?? "",
  };
}

export { iconSize as stepperIconSize };
