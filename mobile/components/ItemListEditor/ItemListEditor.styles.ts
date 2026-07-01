import { StyleSheet } from "react-native";

import { chipsBadgesTokens } from "../ChipsBadges/tokens";
import { formFieldInputTokens } from "../FormFieldInput/tokens";
import { buttonTokens } from "../PrimaryButton/tokens";

const { colors, chipSizes, typography } = chipsBadgesTokens;
const chipMetrics = chipSizes.md;
const { colors: fieldColors, typography: fieldTypography, spacing } =
  formFieldInputTokens;

export const itemListEditorTokens = {
  spacing: {
    sectionGap: spacing.fieldGap,
    inputRowGap: spacing.iconGap,
    itemsGap: spacing.fieldGap,
    itemContentGap: chipMetrics.gap,
    removeHitSlop: buttonTokens.spacing.gapDefault,
  },
  chip: chipMetrics,
  colors: {
    itemBackground: colors.surfaceChip,
    itemText: colors.textPrimary,
    checkIcon: colors.success,
    emptyText: fieldColors.textMuted,
    label: fieldColors.textMuted,
    helperText: fieldColors.textMuted,
  },
  typography: {
    label: {
      ...fieldTypography.label,
      textTransform: "uppercase" as const,
    },
    helperText: fieldTypography.message,
    itemText: {
      fontFamily: typography.caps.fontFamily,
      fontSize: chipMetrics.fontSize,
      lineHeight: chipMetrics.lineHeight,
      letterSpacing: chipMetrics.letterSpacing,
    },
    emptyState: fieldTypography.message,
  },
} as const;

export const itemListEditorStyles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "stretch",
    gap: itemListEditorTokens.spacing.sectionGap,
  },
  labelRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.labelRowGap,
  },
  label: {
    flex: 1,
    color: itemListEditorTokens.colors.label,
    ...itemListEditorTokens.typography.label,
  },
  helperText: {
    flexShrink: 0,
    color: itemListEditorTokens.colors.helperText,
    ...itemListEditorTokens.typography.helperText,
  },
  inputRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: itemListEditorTokens.spacing.inputRowGap,
  },
  inputField: {
    flex: 1,
    minWidth: 0,
  },
  itemsSection: {
    width: "100%",
    gap: itemListEditorTokens.spacing.itemsGap,
  },
  emptyState: {
    color: itemListEditorTokens.colors.emptyText,
    ...itemListEditorTokens.typography.emptyState,
  },
  itemRow: {
    width: "100%",
    minHeight: chipMetrics.minHeight,
    flexDirection: "row",
    alignItems: "center",
    gap: itemListEditorTokens.spacing.itemContentGap,
    paddingHorizontal: chipMetrics.paddingHorizontal,
    paddingVertical: chipMetrics.paddingVertical,
    borderRadius: chipMetrics.borderRadius,
    backgroundColor: itemListEditorTokens.colors.itemBackground,
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: itemListEditorTokens.spacing.itemContentGap,
  },
  itemText: {
    flex: 1,
    color: itemListEditorTokens.colors.itemText,
    ...itemListEditorTokens.typography.itemText,
  },
  removeButton: {
    minWidth: buttonTokens.spacing.minTouchTarget,
    minHeight: buttonTokens.spacing.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
});
