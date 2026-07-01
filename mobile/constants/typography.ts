import { FONT_FAMILY } from "@subi/config";
import type { TextStyle } from "react-native";

/**
 * Semantic Styrene typography presets for the mobile design system.
 * Always set `fontFamily` to the matching file — do not rely on `fontWeight`.
 */
export const typography = {
  bodySm: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0,
  },
  bodyMd: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 15,
    lineHeight: 19,
    letterSpacing: 0,
  },
  bodyLg: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 0,
  },
  labelSm: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.66,
  },
  labelMd: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
    lineHeight: 17,
    letterSpacing: 0,
  },
  labelLg: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 15,
    lineHeight: 19,
    letterSpacing: 0,
  },
  headingSm: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 0,
  },
  headingMd: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0,
  },
  headingLg: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: 0,
  },
  overline: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.66,
    textTransform: "uppercase",
  },
  caption: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyPreset = keyof typeof typography;
