export const progressBarColors = {
  track: "#F7F0EE",
  trackMuted: "#ECECEC",
  fillDefault: "#FD4D03",
  fillSuccess: "#28A862",
  fillWarning: "#F5821E",
  fillDanger: "#E5484D",
  fillMuted: "#9A9A9A",
  textPrimary: "#2C2C2C",
  textMuted: "#6B6B6B",
  stripeLight: "rgba(255, 255, 255, 0.42)",
} as const;

export const progressBarSizes = {
  sm: {
    height: 4,
    radius: 2,
  },
  md: {
    height: 10,
    radius: 999,
  },
  lg: {
    height: 14,
    radius: 999,
  },
} as const;

export const progressBarTypography = {
  label: {
    fontSize: 12,
    fontWeight: "600" as const,
    lineHeight: 16,
    letterSpacing: 0,
  },
} as const;

export const progressBarSpacing = {
  labelGap: 8,
  stripeWidth: 7,
  stripeGap: 8,
  stripeHeight: 32,
} as const;

export const progressBarMotion = {
  durationMs: 500,
} as const;

export const progressBarTokens = {
  colors: progressBarColors,
  sizes: progressBarSizes,
  typography: progressBarTypography,
  spacing: progressBarSpacing,
  motion: progressBarMotion,
} as const;
