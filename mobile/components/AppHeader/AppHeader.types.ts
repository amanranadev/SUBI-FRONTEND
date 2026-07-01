import type { ReactNode } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";

export const APP_HEADER_SIZES = ["sm", "md", "lg"] as const;

export type AppHeaderSize = (typeof APP_HEADER_SIZES)[number];

export const APP_HEADER_VARIANTS = ["default", "transparent"] as const;

export type AppHeaderVariant = (typeof APP_HEADER_VARIANTS)[number];

export interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  backAccessibilityLabel?: string;
  rightContent?: ReactNode;
  size?: AppHeaderSize;
  variant?: AppHeaderVariant;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface ResolvedAppHeaderMetrics {
  container: ViewStyle;
  leftGroup: ViewStyle;
  title: TextStyle;
  backButton: ViewStyle;
  backIconSize: number;
  backIconColor: string;
  logoWidth: number;
  logoHeight: number;
  rightSlot: ViewStyle;
}
