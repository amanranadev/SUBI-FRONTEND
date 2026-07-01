export const segmentedControllerColors = {
  surfaceSubtle: "#F2F2F2",
  surfaceCard: "#FFFFFF",
  textPrimary: "#2C2C2C",
  textMuted: "#9A9A9A",
  textDisabled: "#C6C6C6",
  borderSubtle: "rgba(0, 0, 0, 0.03)",
  shadow: "#000000",
} as const;

export const segmentedControllerSizes = {
  sm: {
    minHeight: 32,
    padding: 3,
    trackRadius: 16,
    itemRadius: 13,
    itemPaddingHorizontal: 14,
    itemPaddingVertical: 6,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.6,
  },
  md: {
    minHeight: 38,
    padding: 4,
    trackRadius: 20,
    itemRadius: 16,
    itemPaddingHorizontal: 20,
    itemPaddingVertical: 8,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.66,
  },
  lg: {
    minHeight: 44,
    padding: 4,
    trackRadius: 22,
    itemRadius: 18,
    itemPaddingHorizontal: 24,
    itemPaddingVertical: 10,
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 0.72,
  },
} as const;

export const segmentedControllerTypography = {
  label: {
    fontWeight: "500" as const,
    textTransform: "uppercase" as const,
    includeFontPadding: false,
  },
} as const;

export const segmentedControllerShadow = {
  shadowColor: segmentedControllerColors.shadow,
  shadowOpacity: 0.2,
  shadowRadius: 3,
  shadowOffset: {
    width: 0,
    height: 1,
  },
  elevation: 3,
} as const;

export const segmentedControllerTokens = {
  colors: segmentedControllerColors,
  sizes: segmentedControllerSizes,
  typography: segmentedControllerTypography,
  shadow: segmentedControllerShadow,
} as const;
