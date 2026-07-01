import type { TextStyle, ViewStyle } from "react-native";

import { chipsBadgesTokens } from "./tokens";
import type {
  BadgeSize,
  BadgeVariant,
  ChipSize,
  ChipVariant,
  ResolvedChipBadgeMetrics,
} from "./ChipsBadges.types";

const { badgeSizes, chipSizes, colors, typography } = chipsBadgesTokens;

function chipPalette(variant: ChipVariant, disabled: boolean) {
  if (disabled) {
    return {
      backgroundColor: colors.disabledBg,
      borderColor: colors.disabledBg,
      textColor: colors.disabledText,
      iconColor: colors.disabledText,
      borderWidth: 0,
    };
  }

  switch (variant) {
    case "selected":
      return {
        backgroundColor: colors.brandLightest,
        borderColor: colors.brandLightest,
        textColor: colors.brand,
        iconColor: colors.brand,
        borderWidth: 0,
      };
    case "success":
      return {
        backgroundColor: colors.successBg,
        borderColor: colors.successBg,
        textColor: colors.success,
        iconColor: colors.success,
        borderWidth: 0,
      };
    case "danger":
      return {
        backgroundColor: colors.dangerBg,
        borderColor: colors.dangerBg,
        textColor: colors.danger,
        iconColor: colors.danger,
        borderWidth: 0,
      };
    case "outline":
      return {
        backgroundColor: colors.surfaceCard,
        borderColor: colors.borderSubtle,
        textColor: colors.textMuted,
        iconColor: colors.textMuted,
        borderWidth: 1,
      };
    case "muted":
      return {
        backgroundColor: colors.surfaceChip,
        borderColor: colors.surfaceChip,
        textColor: colors.textMuted,
        iconColor: colors.textMuted,
        borderWidth: 0,
      };
    case "neutral":
    default:
      return {
        backgroundColor: colors.surfaceChip,
        borderColor: colors.surfaceChip,
        textColor: colors.textPrimary,
        iconColor: colors.textPrimary,
        borderWidth: 0,
      };
  }
}

function badgePalette(variant: BadgeVariant) {
  switch (variant) {
    case "brand":
      return {
        backgroundColor: colors.brandLightest,
        borderColor: colors.brandLightest,
        textColor: colors.brand,
        iconColor: colors.brand,
        borderWidth: 0,
      };
    case "success":
      return {
        backgroundColor: colors.successBg,
        borderColor: colors.successBg,
        textColor: colors.success,
        iconColor: colors.success,
        borderWidth: 0,
      };
    case "warning":
      return {
        backgroundColor: colors.warningBg,
        borderColor: colors.warningBg,
        textColor: colors.warning,
        iconColor: colors.warning,
        borderWidth: 0,
      };
    case "danger":
      return {
        backgroundColor: colors.dangerBg,
        borderColor: colors.dangerBg,
        textColor: colors.danger,
        iconColor: colors.danger,
        borderWidth: 0,
      };
    case "muted":
      return {
        backgroundColor: colors.surfaceChip,
        borderColor: colors.surfaceChip,
        textColor: colors.textMuted,
        iconColor: colors.textMuted,
        borderWidth: 0,
      };
    case "neutral":
    default:
      return {
        backgroundColor: colors.surfaceChip,
        borderColor: colors.surfaceChip,
        textColor: colors.textPrimary,
        iconColor: colors.textPrimary,
        borderWidth: 0,
      };
  }
}

export function resolveChipStyles({
  variant,
  size,
  disabled,
}: {
  variant: ChipVariant;
  size: ChipSize;
  disabled: boolean;
}): ResolvedChipBadgeMetrics {
  const sizeTokens = chipSizes[size];
  const palette = chipPalette(variant, disabled);

  const container: ViewStyle = {
    minHeight: sizeTokens.minHeight,
    borderRadius: sizeTokens.borderRadius,
    paddingHorizontal: sizeTokens.paddingHorizontal,
    paddingVertical: sizeTokens.paddingVertical,
    gap: sizeTokens.gap,
    borderWidth: palette.borderWidth,
    borderColor: palette.borderColor,
    backgroundColor: palette.backgroundColor,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    overflow: "hidden",
  };

  const text: TextStyle = {
    ...typography.caps,
    color: palette.textColor,
    fontSize: sizeTokens.fontSize,
    lineHeight: sizeTokens.lineHeight,
    letterSpacing: sizeTokens.letterSpacing,
  };

  const iconSlot: ViewStyle = {
    width: sizeTokens.iconSize,
    height: sizeTokens.iconSize,
    alignItems: "center",
    justifyContent: "center",
  };

  return {
    container,
    text,
    iconSlot,
    iconColor: palette.iconColor,
  };
}

export function resolveBadgeStyles({
  variant,
  size,
}: {
  variant: BadgeVariant;
  size: BadgeSize;
}): ResolvedChipBadgeMetrics {
  const sizeTokens = badgeSizes[size];
  const palette = badgePalette(variant);

  const container: ViewStyle = {
    minHeight: sizeTokens.minHeight,
    borderRadius: sizeTokens.borderRadius,
    paddingHorizontal: sizeTokens.paddingHorizontal,
    paddingVertical: sizeTokens.paddingVertical,
    gap: sizeTokens.gap,
    borderWidth: palette.borderWidth,
    borderColor: palette.borderColor,
    backgroundColor: palette.backgroundColor,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    overflow: "hidden",
  };

  const text: TextStyle = {
    ...typography.caps,
    color: palette.textColor,
    fontSize: sizeTokens.fontSize,
    lineHeight: sizeTokens.lineHeight,
    letterSpacing: sizeTokens.letterSpacing,
  };

  const iconSlot: ViewStyle = {
    width: sizeTokens.iconSize,
    height: sizeTokens.iconSize,
    alignItems: "center",
    justifyContent: "center",
  };

  return {
    container,
    text,
    iconSlot,
    iconColor: palette.iconColor,
  };
}
