import type { ReactNode } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";

export const SEGMENTED_CONTROLLER_SIZES = ["sm", "md", "lg"] as const;

export type SegmentedControllerSize =
  (typeof SEGMENTED_CONTROLLER_SIZES)[number];

export const SEGMENTED_CONTROLLER_VARIANTS = ["pill", "rounded"] as const;

export type SegmentedControllerVariant =
  (typeof SEGMENTED_CONTROLLER_VARIANTS)[number];

export interface SegmentedControllerOption<Value extends string = string> {
  value: Value;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
  accessibilityLabel?: string;
}

export interface SegmentedControllerProps<Value extends string = string> {
  options: SegmentedControllerOption<Value>[];
  value: Value;
  onValueChange?: (value: Value) => void;
  size?: SegmentedControllerSize;
  variant?: SegmentedControllerVariant;
  fullWidth?: boolean;
  uppercase?: boolean;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
  activeItemStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  activeLabelStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export interface ResolvedSegmentedControllerMetrics {
  track: ViewStyle;
  item: ViewStyle;
  activeItem: ViewStyle;
  disabledItem: ViewStyle;
  label: TextStyle;
  activeLabel: TextStyle;
  disabledLabel: TextStyle;
  iconSlot: ViewStyle;
}
