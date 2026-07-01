import type { TextStyle, ViewStyle } from "react-native";

import { appHeaderTokens } from "./tokens";
import type {
  AppHeaderSize,
  AppHeaderVariant,
  ResolvedAppHeaderMetrics,
} from "./AppHeader.types";

const { colors, sizes, typography } = appHeaderTokens;

function resolveBackground(variant: AppHeaderVariant): string {
  switch (variant) {
    case "transparent":
      return colors.transparent;
    case "default":
    default:
      return colors.background;
  }
}

export function resolveAppHeaderStyles({
  size,
  variant,
  disabled,
}: {
  size: AppHeaderSize;
  variant: AppHeaderVariant;
  disabled: boolean;
}): ResolvedAppHeaderMetrics {
  const sizeTokens = sizes[size];

  const container: ViewStyle = {
    width: "100%",
    height: sizeTokens.height,
    minHeight: sizeTokens.height,
    paddingHorizontal: sizeTokens.paddingHorizontal,
    backgroundColor: resolveBackground(variant),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  };

  const leftGroup: ViewStyle = {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: sizeTokens.leftGroupGap,
  };

  const title: TextStyle = {
    ...typography.title,
    color: disabled ? colors.disabledText : colors.textPrimary,
    fontSize: sizeTokens.titleFontSize,
    lineHeight: sizeTokens.titleLineHeight,
    flexShrink: 1,
  };

  const backButton: ViewStyle = {
    width: sizeTokens.backButtonSize,
    height: sizeTokens.backButtonSize,
    borderRadius: sizeTokens.backButtonSize / 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const rightSlot: ViewStyle = {
    minWidth: sizeTokens.rightSlotSize,
    minHeight: sizeTokens.rightSlotSize,
    alignItems: "flex-end",
    justifyContent: "center",
    flexShrink: 0,
    marginLeft: sizeTokens.leftGroupGap,
  };

  return {
    container,
    leftGroup,
    title,
    backButton,
    backIconSize: sizeTokens.backIconSize,
    backIconColor: disabled ? colors.disabledText : colors.iconPrimary,
    logoWidth: sizeTokens.logoWidth,
    logoHeight: sizeTokens.logoHeight,
    rightSlot,
  };
}
