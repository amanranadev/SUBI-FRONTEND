import { StyleSheet } from "react-native";

import { buttonTokens } from "@/components/PrimaryButton/tokens";

const { colors: sharedColors } = buttonTokens;

export const processingFailedModalColors = {
  textPrimary: sharedColors.textPrimary,
  danger: sharedColors.destructive,
  dangerBackground: "#FEE9E9",
  textOnBrand: sharedColors.textOnBrand,
} as const;

export const processingFailedModalTypography = {
  title: {
    fontSize: 22,
    fontWeight: "700" as const,
    lineHeight: 26,
    letterSpacing: 0,
  },
  errorMessage: {
    fontSize: 15,
    fontWeight: "400" as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
} as const;

export const processingFailedModalSpacing = {
  sectionGap: 20,
  textGap: 10,
  buttonGap: 12,
} as const;

export const processingFailedModalSizing = {
  iconContainer: 80,
  errorIcon: 40,
  buttonIcon: 16,
} as const;

export const processingFailedModalRadius = {
  iconContainer: 20,
} as const;

export const processingFailedModalTokens = {
  colors: processingFailedModalColors,
  typography: processingFailedModalTypography,
  spacing: processingFailedModalSpacing,
  sizing: processingFailedModalSizing,
  radius: processingFailedModalRadius,
} as const;

const { colors, typography, spacing, sizing, radius } =
  processingFailedModalTokens;

export const processingFailedModalStyles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
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
    backgroundColor: colors.dangerBackground,
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
  errorMessage: {
    alignSelf: "stretch",
    fontSize: typography.errorMessage.fontSize,
    fontWeight: typography.errorMessage.fontWeight,
    lineHeight: typography.errorMessage.lineHeight,
    letterSpacing: typography.errorMessage.letterSpacing,
    color: colors.danger,
    textAlign: "center",
  },
  buttonRow: {
    alignSelf: "stretch",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.buttonGap,
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
  },
});
