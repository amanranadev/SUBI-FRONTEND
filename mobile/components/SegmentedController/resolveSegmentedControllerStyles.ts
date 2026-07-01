import type { TextStyle, ViewStyle } from "react-native";

import type {
  ResolvedSegmentedControllerMetrics,
  SegmentedControllerSize,
  SegmentedControllerVariant,
} from "./SegmentedController.types";
import { segmentedControllerTokens } from "./tokens";

const { colors, shadow, sizes, typography } = segmentedControllerTokens;

export function resolveSegmentedControllerStyles({
  size,
  variant,
  fullWidth,
}: {
  size: SegmentedControllerSize;
  variant: SegmentedControllerVariant;
  fullWidth: boolean;
}): ResolvedSegmentedControllerMetrics {
  const sizeTokens = sizes[size];
  const isRounded = variant === "rounded";

  const track: ViewStyle = {
    minHeight: sizeTokens.minHeight,
    padding: sizeTokens.padding,
    borderRadius: isRounded ? 12 : sizeTokens.trackRadius,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: StyleSheetHairlineWidth,
    borderColor: colors.borderSubtle,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: fullWidth ? "stretch" : "flex-start",
  };

  const item: ViewStyle = {
    minHeight: sizeTokens.minHeight - sizeTokens.padding * 2,
    borderRadius: isRounded ? 10 : sizeTokens.itemRadius,
    paddingHorizontal: sizeTokens.itemPaddingHorizontal,
    paddingVertical: sizeTokens.itemPaddingVertical,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flex: fullWidth ? 1 : undefined,
  };

  const activeItem: ViewStyle = {
    backgroundColor: colors.surfaceCard,
    ...shadow,
  };

  const disabledItem: ViewStyle = {
    opacity: 0.62,
  };

  const label: TextStyle = {
    ...typography.label,
    color: colors.textMuted,
    fontSize: sizeTokens.fontSize,
    lineHeight: sizeTokens.lineHeight,
    letterSpacing: sizeTokens.letterSpacing,
  };

  const activeLabel: TextStyle = {
    color: colors.textPrimary,
  };

  const disabledLabel: TextStyle = {
    color: colors.textDisabled,
  };

  const iconSlot: ViewStyle = {
    width: sizeTokens.fontSize + 2,
    height: sizeTokens.fontSize + 2,
    alignItems: "center",
    justifyContent: "center",
  };

  return {
    track,
    item,
    activeItem,
    disabledItem,
    label,
    activeLabel,
    disabledLabel,
    iconSlot,
  };
}

const StyleSheetHairlineWidth = 0;
