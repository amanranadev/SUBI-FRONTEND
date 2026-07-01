import { StyleSheet } from "react-native";

import { bottomTabBarTokens } from "@/components/BottomTabBar/tokens";
import { buttonTokens } from "@/components/PrimaryButton/tokens";

const { colors: sharedColors } = buttonTokens;

export const processingProgressModalColors = {
  textPrimary: sharedColors.textPrimary,
  textMuted: sharedColors.textMuted,
  brandPeach: bottomTabBarTokens.colors.activeBackground,
  brandOrange: sharedColors.brandOrange,
} as const;

export const processingProgressModalTypography = {
  title: {
    fontSize: 22,
    fontWeight: "700" as const,
    lineHeight: 26,
    letterSpacing: 0,
  },
  description: {
    fontSize: 15,
    fontWeight: "400" as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
} as const;

export const processingProgressModalSpacing = {
  sectionGap: 20,
  textGap: 10,
} as const;

export const processingProgressModalSizing = {
  iconContainer: 80,
  heroIcon: 36,
  stopIcon: 18,
} as const;

export const processingProgressModalRadius = {
  iconContainer: 20,
} as const;

export const processingProgressModalTokens = {
  colors: processingProgressModalColors,
  typography: processingProgressModalTypography,
  spacing: processingProgressModalSpacing,
  sizing: processingProgressModalSizing,
  radius: processingProgressModalRadius,
} as const;

const { colors, typography, spacing, sizing, radius } =
  processingProgressModalTokens;

export const processingProgressModalStyles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.sectionGap,
  },
  iconContainer: {
    width: sizing.iconContainer,
    height: sizing.iconContainer,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.iconContainer,
    backgroundColor: colors.brandPeach,
  },
  textBlock: {
    alignSelf: "stretch",
    gap: spacing.textGap,
  },
  title: {
    alignSelf: "stretch",
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    lineHeight: typography.title.lineHeight,
    letterSpacing: typography.title.letterSpacing,
    color: colors.textPrimary,
    textAlign: "center",
  },
  description: {
    alignSelf: "stretch",
    fontSize: typography.description.fontSize,
    fontWeight: typography.description.fontWeight,
    lineHeight: typography.description.lineHeight,
    letterSpacing: typography.description.letterSpacing,
    color: colors.textMuted,
    textAlign: "center",
  },
  progressBar: {
    alignSelf: "stretch",
    width: "100%",
  },
  stepper: {
    alignSelf: "stretch",
    justifyContent: "center",
  },
  stopButton: {
    alignSelf: "stretch",
    width: "100%",
  },
});
