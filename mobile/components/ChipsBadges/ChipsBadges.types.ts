import type { ReactNode } from "react";
import type {
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";

export const CHIP_VARIANTS = [
  "neutral",
  "outline",
  "selected",
  "success",
  "danger",
  "muted",
] as const;

export type ChipVariant = (typeof CHIP_VARIANTS)[number];

export const CHIP_SIZES = ["sm", "md", "lg"] as const;

export type ChipSize = (typeof CHIP_SIZES)[number];

export const BADGE_VARIANTS = [
  "neutral",
  "brand",
  "success",
  "warning",
  "danger",
  "muted",
] as const;

export type BadgeVariant = (typeof BADGE_VARIANTS)[number];

export const BADGE_SIZES = ["sm", "md", "lg"] as const;

export type BadgeSize = (typeof BADGE_SIZES)[number];

export interface ChipProps
  extends Omit<PressableProps, "children" | "style"> {
  label: string;
  variant?: ChipVariant;
  size?: ChipSize;
  selected?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  uppercase?: boolean;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  uppercase?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export interface ResolvedChipBadgeMetrics {
  container: ViewStyle;
  text: TextStyle;
  iconSlot: ViewStyle;
  iconColor: string;
}
