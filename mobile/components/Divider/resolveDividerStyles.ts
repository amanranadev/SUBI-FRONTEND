import { StyleSheet, type ViewStyle } from "react-native";

import type {
  DividerOrientation,
  DividerThickness,
  DividerVariant,
} from "./Divider.types";
import { dividerTokens } from "./tokens";

const { colors, dimensions, spacing } = dividerTokens;

export interface DividerStyleMetrics {
  container: ViewStyle;
}

interface ResolveDividerStylesInput {
  variant: DividerVariant;
  orientation: DividerOrientation;
  thickness: DividerThickness;
  inset: boolean;
}

function resolveSolidStyles(
  orientation: DividerOrientation,
  thickness: DividerThickness,
): ViewStyle {
  if (orientation === "vertical") {
    return {
      width: thickness,
      height: dimensions.dividerVerticalHeight,
      backgroundColor: colors.borderHairline,
    };
  }

  return {
    width: dimensions.dividerWidth,
    height: thickness,
    backgroundColor: colors.borderHairline,
  };
}

function resolveDashedStyles(
  orientation: DividerOrientation,
  thickness: DividerThickness,
): ViewStyle {
  if (orientation === "vertical") {
    return {
      width: 0,
      height: dimensions.dividerVerticalHeight,
      borderLeftWidth: thickness,
      borderLeftColor: colors.borderHairline,
      borderStyle: "dashed",
    };
  }

  return {
    width: dimensions.dividerWidth,
    height: 0,
    borderBottomWidth: thickness,
    borderBottomColor: colors.borderHairline,
    borderStyle: "dashed",
  };
}

export function resolveDividerStyles(
  input: ResolveDividerStylesInput,
): DividerStyleMetrics {
  const { variant, orientation, thickness, inset } = input;

  const lineStyle =
    variant === "dashed"
      ? resolveDashedStyles(orientation, thickness)
      : resolveSolidStyles(orientation, thickness);

  return {
    container: {
      ...baseStyles.container,
      ...lineStyle,
      ...(inset ? { marginHorizontal: spacing.insetHorizontal } : null),
    },
  };
}

const baseStyles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    flexShrink: 0,
  },
});
