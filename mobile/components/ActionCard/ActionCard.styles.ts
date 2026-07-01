import { StyleSheet } from "react-native";

import { buttonTokens } from "../PrimaryButton/tokens";

const { colors, typography, radius, spacing, sizes, shadows } = buttonTokens;

export const actionCardTokens = {
  colors: {
    background: colors.surfaceCard,
    border: colors.borderField,
    borderSelected: colors.brandOrange,
    title: colors.textPrimary,
    description: colors.textMuted,
    iconCircle: colors.surfaceMuted,
  },
  typography: {
    title: typography.buttonPrimary,
    description: typography.bodySmall,
  },
  radius: {
    card: radius.rounded,
    iconCircle: sizes.lg.minHeight,
  },
  spacing: {
    cardPaddingVertical: spacing.paddingVerticalChip,
    cardPaddingHorizontal: spacing.paddingHorizontalChipLeading,
    contentGap: spacing.gapLg,
    textGap: spacing.gapSm,
  },
  sizing: {
    iconCircle: sizes.lg.minHeight,
    iconSize: sizes.lg.iconSize,
    minWidth: spacing.minTouchTarget * 2,
  },
  border: {
    width: 2,
  },
  opacity: {
    disabled: 0.5,
  },
  shadow: shadows.buttonPrimaryShadow,
} as const;

export const actionCardStyles = StyleSheet.create({
  pressable: {
    alignSelf: "stretch",
    width: "100%",
  },
  card: {
    alignSelf: "stretch",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: actionCardTokens.spacing.cardPaddingVertical,
    paddingHorizontal: actionCardTokens.spacing.cardPaddingHorizontal,
    gap: actionCardTokens.spacing.contentGap,
    borderRadius: actionCardTokens.radius.card,
    borderWidth: actionCardTokens.border.width,
    borderColor: actionCardTokens.colors.border,
    backgroundColor: actionCardTokens.colors.background,
  },
  cardSelected: {
    borderColor: actionCardTokens.colors.borderSelected,
  },
  cardDisabled: {
    opacity: actionCardTokens.opacity.disabled,
  },
  iconCircle: {
    width: actionCardTokens.sizing.iconCircle,
    height: actionCardTokens.sizing.iconCircle,
    borderRadius: actionCardTokens.radius.iconCircle,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: actionCardTokens.colors.iconCircle,
  },
  textBlock: {
    width: "100%",
    alignItems: "center",
    gap: actionCardTokens.spacing.textGap,
  },
  title: {
    width: "100%",
    textAlign: "center",
    color: actionCardTokens.colors.title,
    fontFamily: actionCardTokens.typography.title.fontFamily,
    fontSize: actionCardTokens.typography.title.fontSize,
    lineHeight: actionCardTokens.typography.title.lineHeight,
    letterSpacing: actionCardTokens.typography.title.letterSpacing,
  },
  description: {
    width: "100%",
    textAlign: "center",
    color: actionCardTokens.colors.description,
    fontFamily: actionCardTokens.typography.description.fontFamily,
    fontSize: actionCardTokens.typography.description.fontSize,
    lineHeight: actionCardTokens.typography.description.lineHeight,
    letterSpacing: actionCardTokens.typography.description.letterSpacing,
  },
});
