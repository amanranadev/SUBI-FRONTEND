import { StyleSheet } from "react-native";

import { chipsBadgesTokens } from "../ChipsBadges/tokens";

const { colors, badgeSizes, typography } = chipsBadgesTokens;

export const collapsibleSectionTokens = {
  colors: {
    title: colors.textPrimary,
    chevron: colors.textPrimary,
    disabled: colors.disabledText,
  },
  spacing: {
    headerGap: 10,
    contentTop: 12,
    footerTop: 12,
  },
  typography: {
    title: {
      fontFamily: typography.caps.fontFamily,
      fontSize: badgeSizes.lg.fontSize,
      lineHeight: badgeSizes.lg.lineHeight,
      letterSpacing: badgeSizes.lg.letterSpacing,
      textTransform: typography.caps.textTransform,
      includeFontPadding: typography.caps.includeFontPadding,
      color: colors.textPrimary,
    },
  },
  chevron: {
    size: 16,
    durationMs: 200,
  },
} as const;

export const collapsibleSectionStyles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "stretch",
  },
  header: {
    width: "100%",
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    gap: collapsibleSectionTokens.spacing.headerGap,
  },
  headerDisabled: {
    opacity: 0.56,
  },
  leftSection: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: collapsibleSectionTokens.spacing.headerGap,
  },
  titleText: {
    flexShrink: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: collapsibleSectionTokens.spacing.headerGap,
  },
  title: collapsibleSectionTokens.typography.title,
  titleDisabled: {
    color: collapsibleSectionTokens.colors.disabled,
  },
  content: {
    width: "100%",
    alignSelf: "stretch",
    paddingTop: collapsibleSectionTokens.spacing.contentTop,
  },
  footer: {
    width: "100%",
    alignSelf: "stretch",
    alignItems: "flex-start",
    paddingTop: collapsibleSectionTokens.spacing.footerTop,
  },
});
