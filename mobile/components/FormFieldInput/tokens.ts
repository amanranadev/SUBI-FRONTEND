import { typography } from "@/constants/typography";

export const formFieldInputColors = {
  textPrimary: "#2C2C2C",
  textMuted: "#9A9A9A",
  textSubtle: "#6B6B6B",
  surfaceField: "#F6F6F6",
  surfaceCard: "#FFFFFF",
  surfaceMuted: "#F2F2F2",
  borderStrong: "#CFCFCF",
  borderDefault: "#ECECEC",
  brandOrange: "#F5821E",
  success: "#28A862",
  successBackground: "#E7F6ED",
  danger: "#E5484D",
  dangerBackground: "#FEE2E2",
  disabledText: "#9A9A9A",
} as const;

export const formFieldInputTypography = {
  label: typography.overline,
  body: typography.bodyMd,
  message: typography.caption,
} as const;

export const formFieldInputSizes = {
  sm: {
    minHeight: 40,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    iconSlot: 34,
  },
  md: {
    minHeight: 48,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    iconSlot: 42,
  },
  lg: {
    minHeight: 52,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 16,
    iconSlot: 44,
  },
} as const;

export const formFieldInputSpacing = {
  fieldGap: 8,
  labelRowGap: 8,
  iconGap: 10,
  messageGap: 6,
} as const;

export const formFieldInputBorder = {
  /** Resting / unfocused default field — matches Figma Border-Strong. */
  defaultWidth: 1,
  /** Focused default field — matches login focused email spec. */
  focusWidth: 2,
} as const;

export const formFieldInputFocus = {
  borderWidth: formFieldInputBorder.focusWidth,
  /** Matches login focused input: box-shadow 0 0 0 3px rgba(44, 44, 44, 0.15). */
  ringSpread: 3,
  ringColor: "rgba(44, 44, 44, 0.15)",
} as const;

export const formFieldInputTokens = {
  colors: formFieldInputColors,
  typography: formFieldInputTypography,
  sizes: formFieldInputSizes,
  spacing: formFieldInputSpacing,
  border: formFieldInputBorder,
  focus: formFieldInputFocus,
} as const;
