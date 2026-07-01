import { StyleSheet, type ViewStyle } from "react-native";

import { buttonTokens } from "./tokens";
import type {
  ButtonShape,
  ButtonSize,
  ButtonVariant,
  ResolvedButtonMetrics,
} from "./PrimaryButton.types";

const { colors, typography, radius, spacing, sizes, shadows } = buttonTokens;

interface ResolveOptions {
  variant: ButtonVariant;
  size: ButtonSize;
  shape: ButtonShape;
  disabled: boolean;
  elevated: boolean;
  fullWidth: boolean;
  isIconOnly: boolean;
}

const DEFAULT_SHAPE_BY_SIZE: Record<ButtonSize, ButtonShape> = {
  lg: "pill",
  md: "rounded",
  sm: "chip",
};

function resolveRadius(shape: ButtonShape, size: ButtonSize): number {
  switch (shape) {
    case "pill":
      return radius.pill;
    case "rounded":
      return radius.rounded;
    case "chip":
      return radius.chip;
    case "tag":
      return radius.tag;
    case "square":
      return radius.iconOnly;
    default:
      return DEFAULT_SHAPE_BY_SIZE[size] === "pill"
        ? radius.pill
        : radius.rounded;
  }
}

function resolvePadding(
  variant: ButtonVariant,
  size: ButtonSize,
  isIconOnly: boolean,
): Pick<
  ViewStyle,
  "paddingHorizontal" | "paddingVertical" | "paddingLeft" | "paddingRight"
> {
  if (isIconOnly) {
    return { padding: spacing.paddingIconOnly };
  }

  if (variant === "tag" || variant === "success-chip") {
    return {
      paddingVertical: spacing.paddingVerticalTag,
      paddingLeft: spacing.paddingHorizontalTagLeading,
      paddingRight: spacing.paddingHorizontalTagTrailing,
    };
  }

  if (variant === "chip" || variant === "field-chip") {
    if (variant === "field-chip") {
      return {
        paddingVertical: spacing.paddingVerticalFieldChip,
        paddingLeft: spacing.paddingHorizontalFieldChipLeading,
        paddingRight: spacing.paddingHorizontalFieldChipWide,
      };
    }
    return {
      paddingVertical: spacing.paddingVerticalChip,
      paddingLeft: spacing.paddingHorizontalChipLeading,
      paddingRight: spacing.paddingHorizontalChipTrailing,
    };
  }

  if (size === "lg" || size === "md") {
    return {
      paddingHorizontal: spacing.paddingHorizontalLg,
    };
  }

  return {
    paddingHorizontal: spacing.paddingHorizontalChipTrailing,
    paddingVertical: spacing.paddingVerticalChip,
  };
}

function resolveGap(variant: ButtonVariant): number {
  if (variant === "icon-only") {
    return 0;
  }
  return spacing.iconLabelGap;
}

function resolveTypography(variant: ButtonVariant): ResolvedButtonMetrics["text"] {
  if (variant === "tag" || variant === "success-chip") {
    const label = typography.labelCaps;
    return {
      fontFamily: label.fontFamily,
      fontSize: label.fontSize,
      lineHeight: label.lineHeight,
      letterSpacing: label.letterSpacing,
      textTransform: label.textTransform,
      color:
        variant === "success-chip" ? colors.success : colors.textPrimary,
    };
  }

  if (variant === "chip" || variant === "field-chip") {
    const body = typography.bodySmall;
    return {
      fontFamily: body.fontFamily,
      fontSize: body.fontSize,
      lineHeight: body.lineHeight,
      letterSpacing: body.letterSpacing,
      color: colors.textPrimary,
    };
  }

  const primary = typography.buttonPrimary;
  return {
    fontFamily: primary.fontFamily,
    fontSize: primary.fontSize,
    lineHeight: primary.lineHeight,
    letterSpacing: primary.letterSpacing,
    color: colors.textPrimary,
  };
}

function resolveColors(
  variant: ButtonVariant,
  disabled: boolean,
): Pick<ViewStyle, "backgroundColor" | "borderColor"> & { textColor: string } {
  if (disabled) {
    return {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.borderStrong,
      textColor: colors.textMuted,
    };
  }

  switch (variant) {
    case "primary":
      return {
        backgroundColor: colors.brandOrange,
        borderColor: colors.brandOrange,
        textColor: colors.textOnBrand,
      };
    case "secondary":
      return {
        backgroundColor: colors.surfaceCard,
        borderColor: colors.borderField,
        textColor: colors.textPrimary,
      };
    case "outline":
      return {
        backgroundColor: colors.surfaceBackground,
        borderColor: colors.borderStrong,
        textColor: colors.textPrimary,
      };
    case "muted":
      return {
        backgroundColor: colors.surfaceMuted,
        borderColor: colors.surfaceMuted,
        textColor: colors.textMuted,
      };
    case "chip":
      return {
        backgroundColor: colors.surfaceCard,
        borderColor: colors.borderStrong,
        textColor: colors.textPrimary,
      };
    case "field-chip":
      return {
        backgroundColor: colors.surfaceField,
        borderColor: colors.borderField,
        textColor: colors.textPrimary,
      };
    case "tag":
      return {
        backgroundColor: colors.surfaceChip,
        borderColor: colors.surfaceChip,
        textColor: colors.textPrimary,
      };
    case "success-chip":
      return {
        backgroundColor: colors.successBackground,
        borderColor: colors.successBackground,
        textColor: colors.success,
      };
    case "icon-only":
      return {
        backgroundColor: "transparent",
        borderColor: "transparent",
        textColor: colors.textPrimary,
      };
    default:
      return {
        backgroundColor: colors.surfaceCard,
        borderColor: colors.borderField,
        textColor: colors.textPrimary,
      };
  }
}

function resolveBorderWidth(variant: ButtonVariant): number {
  if (variant === "primary" || variant === "muted" || variant === "icon-only") {
    return 0;
  }
  if (variant === "secondary") {
    return 1;
  }
  if (variant === "tag" || variant === "success-chip") {
    return 0;
  }
  return 1.5;
}

function resolveIconSize(variant: ButtonVariant, size: ButtonSize): number {
  if (variant === "icon-only") {
    if (size === "lg") {
      return 20;
    }
    if (size === "md") {
      return 18;
    }
    return sizes.sm.iconSize;
  }
  if (variant === "tag" || variant === "success-chip") {
    return sizes.xs.iconSize;
  }
  if (variant === "chip" || variant === "field-chip") {
    return sizes.sm.iconSize;
  }
  return sizes[size].iconSize;
}

export function resolveButtonStyles(options: ResolveOptions): ResolvedButtonMetrics {
  const {
    variant,
    size,
    shape: shapeProp,
    disabled,
    elevated,
    fullWidth,
    isIconOnly,
  } = options;

  const effectiveVariant = isIconOnly ? "icon-only" : variant;
  const shape = isIconOnly ? "square" : shapeProp;
  const palette = resolveColors(effectiveVariant, disabled);
  const textBase = resolveTypography(effectiveVariant);
  const borderRadius = resolveRadius(shape, size);
  const borderWidth = resolveBorderWidth(effectiveVariant);
  const padding = resolvePadding(effectiveVariant, size, isIconOnly);
  const gap = resolveGap(effectiveVariant);
  const iconSize = resolveIconSize(effectiveVariant, size);

  const heightStyle: ViewStyle =
    effectiveVariant === "icon-only"
      ? {
          minWidth: spacing.minTouchTarget,
          minHeight: spacing.minTouchTarget,
        }
      : effectiveVariant === "chip" ||
          effectiveVariant === "field-chip" ||
          effectiveVariant === "tag" ||
          effectiveVariant === "success-chip"
        ? { minHeight: sizes.sm.minHeight }
        : {
            height: sizes[size].height,
            minHeight: sizes[size].minHeight,
          };

  const container: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius,
    borderWidth,
    backgroundColor: palette.backgroundColor,
    borderColor: palette.borderColor,
    ...padding,
    ...heightStyle,
    ...(fullWidth ? { alignSelf: "stretch", width: "100%" } : {}),
    ...(effectiveVariant === "primary" && elevated && !disabled
      ? shadows.buttonPrimaryShadow
      : {}),
  };

  const textColor =
    effectiveVariant === "primary" && !disabled
      ? colors.textOnBrand
      : palette.textColor;

  return {
    container,
    text: { ...textBase, color: textColor },
    iconSize,
    gap,
    indicatorColor: textColor,
  };
}

export const baseButtonStyles = StyleSheet.create({
  pressable: {
    alignSelf: "flex-start",
  },
  pressableFullWidth: {
    alignSelf: "stretch",
    width: "100%",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    textAlign: "center",
  },
  iconSlot: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingSlot: {
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
