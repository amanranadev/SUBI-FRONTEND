import { FONT_FAMILY } from "@subi/config";

export const bottomTabBarColors = {
  background: "#FFFFFF",
  border: "#EEEEEE",
  active: "#F5821E",
  activeBackground: "#FDEBD8",
  inactive: "#9A9A9A",
  disabled: "#C6C6C6",
  badgeBackground: "#E5484D",
  badgeText: "#FFFFFF",
  homeIndicator: "#1C1C1C",
  shadow: "#000000",
} as const;

export const bottomTabBarSizes = {
  md: {
    minHeight: 88.5,
    dividerHeight: 1.5,
    tabsPaddingHorizontal: 12,
    tabsPaddingTop: 10,
    tabsPaddingBottom: 12,
    itemMinWidth: 52,
    iconBackgroundWidth: 52,
    iconBackgroundHeight: 32,
    iconBackgroundRadius: 16,
    iconSize: 22,
    labelFontSize: 11,
    labelLineHeight: 14,
    itemGap: 6,
    homeIndicatorWidth: 134,
    homeIndicatorHeight: 5,
    homeIndicatorRadius: 2.5,
    bottomPadding: 8,
  },
  compact: {
    minHeight: 72,
    dividerHeight: 1,
    tabsPaddingHorizontal: 10,
    tabsPaddingTop: 8,
    tabsPaddingBottom: 8,
    itemMinWidth: 48,
    iconBackgroundWidth: 48,
    iconBackgroundHeight: 28,
    iconBackgroundRadius: 14,
    iconSize: 20,
    labelFontSize: 10,
    labelLineHeight: 13,
    itemGap: 5,
    homeIndicatorWidth: 120,
    homeIndicatorHeight: 4,
    homeIndicatorRadius: 2,
    bottomPadding: 6,
  },
} as const;

export const bottomTabBarTypography = {
  label: {
    fontFamily: FONT_FAMILY.medium,
    letterSpacing: 0,
    includeFontPadding: false,
  },
  badge: {
    fontFamily: FONT_FAMILY.bold,
    includeFontPadding: false,
  },
} as const;

export const bottomTabBarShadows = {
  bar: {
    shadowColor: bottomTabBarColors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    elevation: 6,
  },
} as const;

export const bottomTabBarTokens = {
  colors: bottomTabBarColors,
  sizes: bottomTabBarSizes,
  typography: bottomTabBarTypography,
  shadows: bottomTabBarShadows,
} as const;
