import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";

import { datePickerTokens } from "./tokens";

const { colors, typography, radius, spacing, opacity } = datePickerTokens;

export interface DatePickerStyleMetrics {
  container: ViewStyle;
  label: TextStyle;
  iconColor: string;
  iconSize: number;
}

export function resolveDatePickerStyles(options: {
  disabled: boolean;
  hasValue: boolean;
}): DatePickerStyleMetrics {
  const { disabled, hasValue } = options;

  const textColor = disabled
    ? colors.textMuted
    : hasValue
      ? colors.textPrimary
      : colors.textPrimary;

  return {
    container: {
      ...baseStyles.container,
      opacity: disabled ? opacity.disabled : 1,
    },
    label: {
      ...baseStyles.label,
      color: textColor,
    },
    iconColor: disabled ? colors.textMuted : colors.textPrimary,
    iconSize: spacing.iconSize,
  };
}

const baseStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: spacing.datePickerPaddingY,
    paddingLeft: spacing.datePickerPaddingLeft,
    paddingRight: spacing.datePickerPaddingRight,
    gap: spacing.datePickerGap,
    borderRadius: radius.datePickerRadius,
    borderWidth: 0.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.brandLightest,
  },
  label: {
    fontSize: typography.datePickerLabel.fontSize,
    fontWeight: typography.datePickerLabel.fontWeight,
    lineHeight: typography.datePickerLabel.lineHeight,
    letterSpacing: typography.datePickerLabel.letterSpacing,
  },
});
