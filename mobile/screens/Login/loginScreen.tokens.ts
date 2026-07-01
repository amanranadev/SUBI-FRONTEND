import type { ViewStyle } from "react-native";

import { formFieldInputTokens } from "@/components/FormFieldInput/tokens";
import { buttonTokens } from "@/components/PrimaryButton/tokens";

const { colors: fieldColors } = formFieldInputTokens;
const { colors: buttonColors, spacing: buttonSpacing } = buttonTokens;

export const loginScreenTokens = {
  colors: {
    screenBackground: fieldColors.surfaceCard,
    greetingCircleBackground: fieldColors.borderDefault,
    headingPrimary: fieldColors.textPrimary,
    headingBrand: buttonColors.brandOrange,
    bodyMuted: fieldColors.textMuted,
    bodyPrimary: fieldColors.textPrimary,
    linkBrand: buttonColors.brandOrange,
    emailInputShadow: "rgba(44, 44, 44, 0.15)",
  },
  spacing: {
    sectionGap: 24,
    formFieldGap: 20,
    supportingRowGap: 6,
    supportingInlineGap: buttonSpacing.gapSm,
    termsLineGap: 4,
    termsLinkGap: buttonSpacing.gapDefault,
    headingInlineGap: buttonSpacing.gapMd,
    horizontalPadding: 23,
    /** Space between the fixed login header and scrollable welcome content. */
    headerContentGap: 24,
    contentBottomInset: 36,
    contentMaxWidth: 345,
  },
  greetingCircle: {
    size: 80,
    borderRadius: 40,
    emojiSize: 36,
  },
} as const;

export function resolveLoginScrollContentStyle(): ViewStyle {
  const { spacing } = loginScreenTokens;

  return {
    flexGrow: 1,
    paddingHorizontal: spacing.horizontalPadding,
    paddingTop: spacing.headerContentGap,
    /** 36px below terms — SafeAreaView `edges={['bottom']}` handles home indicator separately. */
    paddingBottom: spacing.contentBottomInset,
  };
}
