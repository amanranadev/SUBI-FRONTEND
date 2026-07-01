import { buttonTokens } from "@/components/PrimaryButton/tokens";
import { FONT_FAMILY } from "@subi/config";

export const appHeaderColors = {
  background: buttonTokens.colors.surfaceBackground,
  transparent: "transparent",
  textPrimary: buttonTokens.colors.textPrimary,
  iconPrimary: buttonTokens.colors.textPrimary,
  backButtonPressed: buttonTokens.colors.surfaceChip,
  disabledText: buttonTokens.colors.textMuted,
} as const;

export const appHeaderSizes = {
  sm: {
    height: 48,
    paddingHorizontal: 20,
    leftGroupGap: 8,
    backButtonSize: 36,
    backIconSize: 20,
    logoWidth: 84,
    logoHeight: 25,
    titleFontSize: 15,
    titleLineHeight: 19,
    rightSlotSize: 20,
  },
  md: {
    height: 56,
    paddingHorizontal: 24,
    leftGroupGap: 10,
    backButtonSize: 40,
    backIconSize: 24,
    logoWidth: 100,
    logoHeight: 30,
    titleFontSize: 17,
    titleLineHeight: 22,
    rightSlotSize: 24,
  },
  lg: {
    height: 64,
    paddingHorizontal: 24,
    leftGroupGap: 12,
    backButtonSize: 44,
    backIconSize: 24,
    logoWidth: 112,
    logoHeight: 34,
    titleFontSize: 20,
    titleLineHeight: 26,
    rightSlotSize: 24,
  },
} as const;

export const appHeaderTypography = {
  title: {
    fontFamily: FONT_FAMILY.bold,
    letterSpacing: 0,
    includeFontPadding: false,
  },
} as const;

export const appHeaderTokens = {
  colors: appHeaderColors,
  sizes: appHeaderSizes,
  typography: appHeaderTypography,
} as const;
