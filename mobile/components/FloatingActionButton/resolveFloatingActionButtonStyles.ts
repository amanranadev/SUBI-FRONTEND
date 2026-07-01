import type { ViewStyle } from "react-native";

import { floatingActionButtonTokens } from "./tokens";
import type {
  FloatingActionButtonShape,
  FloatingActionButtonSize,
  FloatingActionButtonVariant,
  ResolvedFloatingActionButtonMetrics,
} from "./FloatingActionButton.types";

const { colors, sizes, shadows } = floatingActionButtonTokens;

interface ResolveOptions {
  variant: FloatingActionButtonVariant;
  size: FloatingActionButtonSize;
  shape: FloatingActionButtonShape;
  disabled: boolean;
  elevated: boolean;
}

function resolvePalette(
  variant: FloatingActionButtonVariant,
  disabled: boolean,
): Pick<ViewStyle, "backgroundColor" | "borderColor" | "borderWidth"> & {
  iconColor: string;
} {
  if (disabled) {
    return {
      backgroundColor: colors.disabledBackground,
      borderColor: colors.disabledBackground,
      borderWidth: 0,
      iconColor: colors.disabledIcon,
    };
  }

  switch (variant) {
    case "dark":
      return {
        backgroundColor: colors.dark,
        borderColor: colors.dark,
        borderWidth: 0,
        iconColor: colors.white,
      };
    case "light":
      return {
        backgroundColor: colors.light,
        borderColor: colors.borderLight,
        borderWidth: 1,
        iconColor: colors.textPrimary,
      };
    case "danger":
      return {
        backgroundColor: colors.danger,
        borderColor: colors.danger,
        borderWidth: 0,
        iconColor: colors.white,
      };
    case "brand":
    default:
      return {
        backgroundColor: colors.brandOrange,
        borderColor: colors.brandOrange,
        borderWidth: 0,
        iconColor: colors.white,
      };
  }
}

function resolveRadius(
  size: FloatingActionButtonSize,
  shape: FloatingActionButtonShape,
): number {
  const buttonSize = sizes[size].size;
  return shape === "circle" ? buttonSize / 2 : sizes[size].roundedRadius;
}

export function resolveFloatingActionButtonStyles({
  variant,
  size,
  shape,
  disabled,
  elevated,
}: ResolveOptions): ResolvedFloatingActionButtonMetrics {
  const sizeMetrics = sizes[size];
  const palette = resolvePalette(variant, disabled);

  const container: ViewStyle = {
    width: sizeMetrics.size,
    height: sizeMetrics.size,
    borderRadius: resolveRadius(size, shape),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.backgroundColor,
    borderColor: palette.borderColor,
    borderWidth: palette.borderWidth,
    ...(elevated && !disabled
      ? variant === "brand"
        ? shadows.brand
        : shadows.heavy
      : {}),
  };

  return {
    container,
    iconSize: sizeMetrics.iconSize,
    iconColor: palette.iconColor,
  };
}
