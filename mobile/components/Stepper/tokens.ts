/**
 * Design tokens for Stepper (progressStepper.md).
 * Shared palette values are sourced from PrimaryButton tokens — not duplicated.
 */

import { buttonTokens } from "@/components/PrimaryButton/tokens";

const { colors: sharedColors } = buttonTokens;

export const STEPPER_STATUSES = ["completed", "active", "upcoming"] as const;

export type StepperStatus = (typeof STEPPER_STATUSES)[number];

export const stepperColors = {
  completed: sharedColors.success,
  active: sharedColors.brandOrange,
  upcoming: sharedColors.textMuted,
} as const;

export const stepperTypography = {
  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 14,
    letterSpacing: 0,
  },
} as const;

export const stepperSpacing = {
  stepGap: 20,
  stepItemGap: 6,
} as const;

export const stepperIconSize = 16;

export const stepperTokens = {
  colors: stepperColors,
  typography: stepperTypography,
  spacing: stepperSpacing,
  iconSize: stepperIconSize,
} as const;
