/** PostScript names registered via expo-font / useAppFonts in mobile. */
export const FONT_FAMILY = {
  light: "StyLight",
  regular: "StyRegular",
  medium: "StyMedium",
  bold: "StyBold",
} as const;

export type FontFamilyToken = (typeof FONT_FAMILY)[keyof typeof FONT_FAMILY];

/** CSS-style weight tokens for documentation and cross-platform mapping. */
export const FONT_WEIGHT = {
  thin: "100",
  light: "300",
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export type FontWeightToken = (typeof FONT_WEIGHT)[keyof typeof FONT_WEIGHT];
