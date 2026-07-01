import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";

import type { DateBadgeSize, DateBadgeVariant } from "./DateBadge.types";
import { dateBadgeTokens } from "./tokens";

const { colors, typography, radius, spacing, sizes, opacity } = dateBadgeTokens;

export interface DateBadgeStyleMetrics {
  container: ViewStyle;
  month: TextStyle;
  day: TextStyle;
}

interface ResolveDateBadgeStylesInput {
  size: DateBadgeSize;
  variant: DateBadgeVariant;
  disabled: boolean;
  highlightToday: boolean;
  isToday: boolean;
}

function resolveVariantColors(
  variant: DateBadgeVariant,
  disabled: boolean,
): {
  backgroundColor: string;
  monthColor: string;
  dayColor: string;
} {
  if (disabled) {
    return {
      backgroundColor: colors.surfaceSubtle,
      monthColor: colors.textMuted,
      dayColor: colors.textMuted,
    };
  }

  switch (variant) {
    case "selected":
      return {
        backgroundColor: colors.brandOrange,
        monthColor: colors.textOnBrand,
        dayColor: colors.textOnBrand,
      };
    case "muted":
      return {
        backgroundColor: colors.surfaceSubtle,
        monthColor: colors.textMuted,
        dayColor: colors.textMuted,
      };
    case "default":
    default:
      return {
        backgroundColor: colors.surfaceSubtle,
        monthColor: colors.brandOrange,
        dayColor: colors.textPrimary,
      };
  }
}

export function resolveDateBadgeStyles(
  input: ResolveDateBadgeStylesInput,
): DateBadgeStyleMetrics {
  const { size, variant, disabled, highlightToday, isToday } = input;
  const sizeTokens = sizes[size];
  const variantColors = resolveVariantColors(variant, disabled);

  const showTodayRing =
    highlightToday && isToday && !disabled && variant !== "selected";

  return {
    container: {
      ...baseStyles.container,
      width: sizeTokens.width,
      height: sizeTokens.height,
      paddingVertical: sizeTokens.paddingVertical,
      gap: spacing.dateBadgeGap,
      borderRadius: radius.dateBadgeRadius,
      backgroundColor: variantColors.backgroundColor,
      opacity: disabled ? opacity.disabled : 1,
      ...(showTodayRing
        ? {
            borderWidth: sizeTokens.todayRingWidth,
            borderColor: colors.todayRing,
          }
        : null),
    },
    month: {
      ...baseStyles.month,
      fontSize: sizeTokens.monthFontSize,
      lineHeight: sizeTokens.monthLineHeight,
      letterSpacing: sizeTokens.monthLetterSpacing,
      fontFamily: typography.dateBadgeMonth.fontFamily,
      textTransform: typography.dateBadgeMonth.textTransform,
      color: variantColors.monthColor,
    },
    day: {
      ...baseStyles.day,
      fontSize: sizeTokens.dayFontSize,
      lineHeight: sizeTokens.dayLineHeight,
      fontFamily: typography.dateBadgeDay.fontFamily,
      color: variantColors.dayColor,
    },
  };
}

const baseStyles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  month: {
    textAlign: "center",
    width: "100%",
  },
  day: {
    textAlign: "center",
    width: "100%",
  },
});
