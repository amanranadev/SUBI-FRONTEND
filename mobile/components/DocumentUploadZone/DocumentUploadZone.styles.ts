import { StyleSheet } from "react-native";

import { buttonTokens } from "@/components/PrimaryButton/tokens";

const { colors: sharedColors } = buttonTokens;

export const documentUploadZoneColors = {
  textPrimary: sharedColors.textPrimary,
  textMuted: sharedColors.textMuted,
  borderStrong: sharedColors.borderStrong,
  neutralCircle: "#F0F0F0",
  iconMuted: "#8A8A8A",
  error: sharedColors.destructive,
} as const;

export const documentUploadZoneTypography = {
  uploadTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    lineHeight: 26,
    letterSpacing: 0,
  },
  uploadDescription: {
    fontSize: 16,
    fontWeight: "500" as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  uploadError: {
    fontSize: 14,
    fontWeight: "500" as const,
    lineHeight: 18,
    letterSpacing: 0,
  },
} as const;

export const documentUploadZoneRadius = {
  zone: 24,
  iconCircle: 48,
} as const;

export const documentUploadZoneSpacing = {
  zonePaddingVertical: 40,
  zonePaddingHorizontal: 24,
  contentGap: 24,
  textGap: 10,
} as const;

export const documentUploadZoneSizing = {
  iconCircle: 96,
  iconSize: 42,
  flexGrow: 1,
  flexShrink: 0,
  flexBasis: 0,
} as const;

export const documentUploadZoneBorder = {
  zoneWidth: 2,
  zoneStyle: "dashed" as const,
} as const;

export const documentUploadZoneOpacity = {
  disabled: 0.5,
} as const;

export const documentUploadZoneTokens = {
  colors: documentUploadZoneColors,
  typography: documentUploadZoneTypography,
  radius: documentUploadZoneRadius,
  spacing: documentUploadZoneSpacing,
  sizing: documentUploadZoneSizing,
  border: documentUploadZoneBorder,
  opacity: documentUploadZoneOpacity,
} as const;

const {
  colors,
  typography,
  radius,
  spacing,
  sizing,
  border,
  opacity,
} = documentUploadZoneTokens;

export const documentUploadZoneStyles = StyleSheet.create({
  pressable: {
    alignSelf: "stretch",
    width: "100%",
    flexGrow: sizing.flexGrow,
    flexShrink: sizing.flexShrink,
    flexBasis: sizing.flexBasis,
  },
  zone: {
    paddingVertical: spacing.zonePaddingVertical,
    paddingHorizontal: spacing.zonePaddingHorizontal,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.contentGap,
    alignSelf: "stretch",
    width: "100%",
    flexGrow: sizing.flexGrow,
    flexShrink: sizing.flexShrink,
    flexBasis: sizing.flexBasis,
    borderRadius: radius.zone,
    borderWidth: border.zoneWidth,
    borderStyle: border.zoneStyle,
    borderColor: colors.borderStrong,
    backgroundColor: "transparent",
  },
  zoneDisabled: {
    opacity: opacity.disabled,
  },
  iconCircle: {
    width: sizing.iconCircle,
    height: sizing.iconCircle,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.iconCircle,
    backgroundColor: colors.neutralCircle,
  },
  textBlock: {
    alignSelf: "stretch",
    gap: spacing.textGap,
  },
  title: {
    alignSelf: "stretch",
    fontSize: typography.uploadTitle.fontSize,
    fontWeight: typography.uploadTitle.fontWeight,
    lineHeight: typography.uploadTitle.lineHeight,
    letterSpacing: typography.uploadTitle.letterSpacing,
    color: colors.textPrimary,
    textAlign: "center",
  },
  description: {
    alignSelf: "stretch",
    fontSize: typography.uploadDescription.fontSize,
    fontWeight: typography.uploadDescription.fontWeight,
    lineHeight: typography.uploadDescription.lineHeight,
    letterSpacing: typography.uploadDescription.letterSpacing,
    color: colors.textMuted,
    textAlign: "center",
  },
  error: {
    alignSelf: "stretch",
    fontSize: typography.uploadError.fontSize,
    fontWeight: typography.uploadError.fontWeight,
    lineHeight: typography.uploadError.lineHeight,
    letterSpacing: typography.uploadError.letterSpacing,
    color: colors.error,
    textAlign: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.zone,
    backgroundColor: "rgba(255, 255, 255, 0.72)",
  },
});
