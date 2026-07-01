import React, { memo } from "react";
import { Text, View } from "react-native";

import { Icon } from "@/assets/icon-system";

import { deriveStepStatus } from "./deriveStepStatus";
import type { StepperItem, StepperProps } from "./Stepper.types";
import {
  getStepAccessibilityLabel,
  getStepperAccessibilityValue,
  resolveStepItemLabelStyle,
  resolveStepItemMetrics,
  stepperIconSize,
  stepperStyles,
} from "./resolveStepItemStyles";

interface StepItemProps {
  step: StepperItem;
  index: number;
  activeStep: number;
}

const StepItem = memo(function StepItem({
  step,
  index,
  activeStep,
}: StepItemProps) {
  const status = deriveStepStatus(index, activeStep);
  const metrics = resolveStepItemMetrics(status);

  return (
    <View
      style={stepperStyles.stepItem}
      accessible
      accessibilityRole="text"
      accessibilityLabel={getStepAccessibilityLabel(step.label, status)}
    >
      <Icon
        name={step.icon}
        size={stepperIconSize}
        color={metrics.iconColor}
        accessible={false}
      />
      <Text style={resolveStepItemLabelStyle(status)} accessible={false}>
        {step.label}
      </Text>
    </View>
  );
});

export const Stepper = memo(function Stepper({
  steps,
  activeStep,
  testID,
}: StepperProps) {
  const activeLabel = steps[activeStep]?.label;

  return (
    <View
      style={stepperStyles.container}
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={getStepperAccessibilityValue(
        steps.length,
        activeStep,
        activeLabel,
      )}
    >
      {steps.map((step, index) => (
        <StepItem
          key={step.id}
          step={step}
          index={index}
          activeStep={activeStep}
        />
      ))}
    </View>
  );
});
