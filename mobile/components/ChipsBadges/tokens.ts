import { FONT_FAMILY } from "@subi/config";

export const chipsBadgesColors = {
  brand: "#F5821E",
  brandLightest: "#F9F3ED",
  success: "#28A862",
  successBg: "#E7F6ED",
  danger: "#E5484D",
  dangerBg: "#FEE2E2",
  warning: "#B7791F",
  warningBg: "#FEF3C7",
  surfaceChip: "#F4F4F4",
  surfaceCard: "#FFFFFF",
  borderSubtle: "#EEEEEE",
  textPrimary: "#2C2C2C",
  textMuted: "#9A9A9A",
  disabledBg: "#ECECEC",
  disabledText: "#B8B8B8",
} as const;

export const chipSizes = {
  sm: {
    minHeight: 25,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
    iconSize: 12,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.6,
  },
  md: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 5,
    iconSize: 12,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.66,
  },
  lg: {
    minHeight: 40,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 5,
    iconSize: 20,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.66,
  },
} as const;

export const badgeSizes = {
  sm: {
    minHeight: 16,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 4,
    iconSize: 10,
    fontSize: 8,
    lineHeight: 10,
    letterSpacing: 0.48,
  },
  md: {
    minHeight: 21,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    iconSize: 10,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.6,
  },
  lg: {
    minHeight: 24,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
    iconSize: 12,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.66,
  },
} as const;

export const chipsBadgesTypography = {
  caps: {
    fontFamily: FONT_FAMILY.medium,
    textTransform: "uppercase" as const,
    includeFontPadding: false,
  },
} as const;

export const chipsBadgesTokens = {
  colors: chipsBadgesColors,
  chipSizes,
  badgeSizes,
  typography: chipsBadgesTypography,
} as const;
