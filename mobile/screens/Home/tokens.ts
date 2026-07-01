import { buttonTokens } from "@/components/PrimaryButton/tokens";

const { colors, spacing } = buttonTokens;

export const homeScreenTokens = {
  colors: {
    screenBackground: colors.surfaceBackground,
  },
  spacing: {
    containerPaddingTop: spacing.gapDefault,
    containerPaddingHorizontal: spacing.paddingHorizontalMd,
    containerPaddingBottom: spacing.paddingHorizontalMd,
  },
} as const;
