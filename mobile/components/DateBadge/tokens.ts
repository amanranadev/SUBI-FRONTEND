import { buttonTokens } from "@/components/PrimaryButton/tokens";
import { FONT_FAMILY } from "@subi/config";

const { colors: sharedColors } = buttonTokens;

export const DATE_BADGE_VARIANTS = ["default", "selected", "muted"] as const;
export const DATE_BADGE_SIZES = ["sm", "md", "lg"] as const;

export const dateBadgeColors = {
  brandOrange: sharedColors.brandOrange,
  textPrimary: sharedColors.textPrimary,
  textMuted: sharedColors.textMuted,
  textOnBrand: sharedColors.textOnBrand,
  surfaceSubtle: sharedColors.surfaceMuted,
  todayRing: sharedColors.brandOrange,
} as const;

export const dateBadgeTypography = {
  dateBadgeMonth: {
    fontFamily: FONT_FAMILY.medium,
    textTransform: "uppercase" as const,
  },
  dateBadgeDay: {
    fontFamily: FONT_FAMILY.medium,
  },
} as const;

export const dateBadgeRadius = {
  dateBadgeRadius: 12,
} as const;

export const dateBadgeSpacing = {
  dateBadgeGap: 2,
} as const;

export const dateBadgeSizes = {
  sm: {
    width: 40,
    height: 40,
    paddingVertical: 6,
    monthFontSize: 9,
    monthLetterSpacing: 0.54,
    monthLineHeight: 11,
    dayFontSize: 14,
    dayLineHeight: 16,
    todayRingWidth: 1.5,
  },
  md: {
    width: 48,
    height: 48,
    paddingVertical: 8,
    monthFontSize: 10,
    monthLetterSpacing: 0.6,
    monthLineHeight: 12,
    dayFontSize: 16,
    dayLineHeight: 18,
    todayRingWidth: 2,
  },
  lg: {
    width: 56,
    height: 56,
    paddingVertical: 10,
    monthFontSize: 11,
    monthLetterSpacing: 0.66,
    monthLineHeight: 13,
    dayFontSize: 20,
    dayLineHeight: 22,
    todayRingWidth: 2,
  },
} as const;

export const dateBadgeOpacity = {
  disabled: 0.5,
} as const;

export const dateBadgeTokens = {
  colors: dateBadgeColors,
  typography: dateBadgeTypography,
  radius: dateBadgeRadius,
  spacing: dateBadgeSpacing,
  sizes: dateBadgeSizes,
  opacity: dateBadgeOpacity,
} as const;
