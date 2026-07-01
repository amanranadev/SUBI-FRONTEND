import type { ComponentProps } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import type { Ionicons } from "@expo/vector-icons";

export const BOTTOM_TAB_BAR_SIZES = ["md", "compact"] as const;

export type BottomTabBarSize = (typeof BOTTOM_TAB_BAR_SIZES)[number];

export type BottomTabBarIconName = ComponentProps<typeof Ionicons>["name"];

export interface BottomTabBarItem<Value extends string = string> {
  value: Value;
  label: string;
  iconName: BottomTabBarIconName;
  activeIconName?: BottomTabBarIconName;
  disabled?: boolean;
  badge?: string | number;
  accessibilityLabel?: string;
}

export interface BottomTabBarProps<Value extends string = string> {
  items: BottomTabBarItem<Value>[];
  value: Value;
  onValueChange?: (value: Value) => void;
  size?: BottomTabBarSize;
  showLabels?: boolean;
  showHomeIndicator?: boolean;
  elevated?: boolean;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  tabsStyle?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  activeLabelStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export interface ResolvedBottomTabBarMetrics {
  container: ViewStyle;
  divider: ViewStyle;
  tabs: ViewStyle;
  item: ViewStyle;
  iconBackground: ViewStyle;
  activeIconBackground: ViewStyle;
  label: TextStyle;
  activeLabel: TextStyle;
  disabledLabel: TextStyle;
  badge: ViewStyle;
  badgeText: TextStyle;
  homeIndicator: ViewStyle;
  iconSize: number;
  inactiveIconColor: string;
  activeIconColor: string;
  disabledIconColor: string;
}
