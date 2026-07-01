import type { ReactNode } from "react";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";

export const BUTTON_VARIANTS = [
  "primary",
  "secondary",
  "outline",
  "chip",
  "field-chip",
  "tag",
  "success-chip",
  "muted",
  "icon-only",
] as const;

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

export const BUTTON_SIZES = ["sm", "md", "lg"] as const;

export type ButtonSize = (typeof BUTTON_SIZES)[number];

export const BUTTON_SHAPES = ["pill", "rounded", "chip", "tag", "square"] as const;

export type ButtonShape = (typeof BUTTON_SHAPES)[number];

export interface PrimaryButtonProps extends Omit<PressableProps, "children"> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  elevated?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export interface ResolvedButtonMetrics {
  container: ViewStyle;
  text: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    textTransform?: "uppercase";
    color: string;
  };
  iconSize: number;
  gap: number;
  indicatorColor: string;
}
