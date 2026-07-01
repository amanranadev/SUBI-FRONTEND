import type { StyleProp, TextStyle, ViewStyle } from "react-native";

export const PROGRESS_BAR_VARIANTS = [
  "default",
  "success",
  "warning",
  "danger",
  "muted",
] as const;

export type ProgressBarVariant = (typeof PROGRESS_BAR_VARIANTS)[number];

export const PROGRESS_BAR_SIZES = ["sm", "md", "lg"] as const;

export type ProgressBarSize = (typeof PROGRESS_BAR_SIZES)[number];

export const PROGRESS_BAR_LABEL_POSITIONS = [
  "none",
  "top",
  "bottom",
  "right",
] as const;

export type ProgressBarLabelPosition =
  (typeof PROGRESS_BAR_LABEL_POSITIONS)[number];

export interface ProgressBarProps {
  value: number;
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  striped?: boolean;
  animated?: boolean;
  showLabel?: boolean;
  labelPosition?: ProgressBarLabelPosition;
  label?: string;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  trackStyle?: StyleProp<ViewStyle>;
  fillStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export interface ResolvedProgressBarMetrics {
  track: ViewStyle;
  fill: ViewStyle;
  label: TextStyle;
  stripeColor: string;
  height: number;
}
