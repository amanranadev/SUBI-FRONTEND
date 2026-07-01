import type { ReactNode } from "react";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";

export const FLOATING_ACTION_BUTTON_VARIANTS = [
  "brand",
  "dark",
  "light",
  "danger",
] as const;

export type FloatingActionButtonVariant =
  (typeof FLOATING_ACTION_BUTTON_VARIANTS)[number];

export const FLOATING_ACTION_BUTTON_SIZES = ["sm", "md", "lg"] as const;

export type FloatingActionButtonSize =
  (typeof FLOATING_ACTION_BUTTON_SIZES)[number];

export const FLOATING_ACTION_BUTTON_SHAPES = ["rounded", "circle"] as const;

export type FloatingActionButtonShape =
  (typeof FLOATING_ACTION_BUTTON_SHAPES)[number];

export interface FloatingActionButtonProps
  extends Omit<PressableProps, "children"> {
  children?: ReactNode;
  variant?: FloatingActionButtonVariant;
  size?: FloatingActionButtonSize;
  shape?: FloatingActionButtonShape;
  disabled?: boolean;
  elevated?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export interface ResolvedFloatingActionButtonMetrics {
  container: ViewStyle;
  iconSize: number;
  iconColor: string;
}
