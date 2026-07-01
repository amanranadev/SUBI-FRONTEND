import type { TextStyle, ViewStyle } from "react-native";

import type {
  BottomTabBarSize,
  ResolvedBottomTabBarMetrics,
} from "./BottomTabBar.types";
import { bottomTabBarTokens } from "./tokens";

const { colors, shadows, sizes, typography } = bottomTabBarTokens;

export function resolveBottomTabBarStyles({
  size,
  elevated,
  showLabels,
}: {
  size: BottomTabBarSize;
  elevated: boolean;
  showLabels: boolean;
}): ResolvedBottomTabBarMetrics {
  const sizeTokens = sizes[size];

  const container: ViewStyle = {
    minHeight: sizeTokens.minHeight,
    backgroundColor: colors.background,
    alignItems: "center",
    paddingBottom: sizeTokens.bottomPadding,
    ...(elevated ? shadows.bar : {}),
  };

  const divider: ViewStyle = {
    width: "100%",
    height: sizeTokens.dividerHeight,
    backgroundColor: colors.border,
  };

  const tabs: ViewStyle = {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: sizeTokens.tabsPaddingHorizontal,
    paddingTop: sizeTokens.tabsPaddingTop,
    paddingBottom: showLabels ? sizeTokens.tabsPaddingBottom : 6,
  };

  const item: ViewStyle = {
    minWidth: sizeTokens.itemMinWidth,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: showLabels ? sizeTokens.itemGap : 0,
  };

  const iconBackground: ViewStyle = {
    width: sizeTokens.iconBackgroundWidth,
    height: sizeTokens.iconBackgroundHeight,
    borderRadius: sizeTokens.iconBackgroundRadius,
    alignItems: "center",
    justifyContent: "center",
  };

  const activeIconBackground: ViewStyle = {
    backgroundColor: colors.activeBackground,
  };

  const label: TextStyle = {
    ...typography.label,
    color: colors.inactive,
    fontSize: sizeTokens.labelFontSize,
    lineHeight: sizeTokens.labelLineHeight,
  };

  const activeLabel: TextStyle = {
    color: colors.active,
  };

  const disabledLabel: TextStyle = {
    color: colors.disabled,
  };

  const badge: ViewStyle = {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.badgeBackground,
    position: "absolute",
    top: -3,
    right: 6,
  };

  const badgeText: TextStyle = {
    ...typography.badge,
    color: colors.badgeText,
    fontSize: 10,
    lineHeight: 12,
  };

  const homeIndicator: ViewStyle = {
    width: sizeTokens.homeIndicatorWidth,
    height: sizeTokens.homeIndicatorHeight,
    borderRadius: sizeTokens.homeIndicatorRadius,
    backgroundColor: colors.homeIndicator,
  };

  return {
    container,
    divider,
    tabs,
    item,
    iconBackground,
    activeIconBackground,
    label,
    activeLabel,
    disabledLabel,
    badge,
    badgeText,
    homeIndicator,
    iconSize: sizeTokens.iconSize,
    inactiveIconColor: colors.inactive,
    activeIconColor: colors.active,
    disabledIconColor: colors.disabled,
  };
}
