import { typography } from "@/constants/typography";

/**
 * Design tokens extracted from button.md (Figma button system).
 * PrimaryButton must reference these tokens only — no raw repeated values in styles.
 */

export const buttonColors = {
  brandOrange: "#F5821E",
  textOnBrand: "#FFFFFF",
  textPrimary: "#2C2C2C",
  textMuted: "#9A9A9A",
  surfaceBackground: "#FAFAFA",
  surfaceCard: "#FFFFFF",
  surfaceField: "#F6F6F6",
  surfaceChip: "#F4F4F4",
  surfaceMuted: "#F2F2F2",
  borderField: "#ECECEC",
  borderStrong: "#CFCFCF",
  success: "#28A862",
  successBackground: "#E7F6ED",
  iconMuted: "#9A9A9A",
  destructive: "#E5484D",
} as const;

export const buttonTypography = {
  buttonPrimary: typography.labelMd,
  bodySmall: typography.bodySm,
  labelCaps: typography.overline,
} as const;

export const buttonRadius = {
  pill: 28,
  rounded: 24,
  chip: 12,
  tag: 14,
  iconOnly: 12,
} as const;

export const buttonSpacing = {
  /** Space between icon and label in all buttons with both. */
  iconLabelGap: 8,
  gapSm: 5,
  gapMd: 7,
  gapDefault: 8,
  gapLg: 10,
  paddingHorizontalLg: 20,
  paddingHorizontalMd: 24,
  paddingHorizontalChipLeading: 14,
  paddingHorizontalChipTrailing: 16,
  paddingVerticalChip: 10,
  paddingVerticalTag: 7,
  paddingHorizontalTagLeading: 10,
  paddingHorizontalTagTrailing: 14,
  paddingVerticalFieldChip: 15,
  paddingHorizontalFieldChipLeading: 10,
  paddingHorizontalFieldChipTrailing: 12,
  paddingHorizontalFieldChipWide: 20,
  paddingIconOnly: 12,
  minTouchTarget: 44,
} as const;

export const buttonSizes = {
  lg: {
    height: 52,
    minHeight: 52,
    iconSize: 20,
  },
  md: {
    height: 48,
    minHeight: 48,
    iconSize: 16,
  },
  sm: {
    minHeight: 36,
    iconSize: 15,
  },
  xs: {
    minHeight: 28,
    iconSize: 12,
  },
} as const;

export const buttonShadows = {
  buttonPrimaryShadow: {
    shadowColor: buttonColors.brandOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

export const buttonTokens = {
  colors: buttonColors,
  typography: buttonTypography,
  radius: buttonRadius,
  spacing: buttonSpacing,
  sizes: buttonSizes,
  shadows: buttonShadows,
} as const;
