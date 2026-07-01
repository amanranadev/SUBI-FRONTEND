import { StyleSheet } from "react-native";

import { formFieldInputTokens } from "@/components/FormFieldInput/tokens";
import { buttonTokens } from "@/components/PrimaryButton/tokens";

const { colors, typography, spacing } = formFieldInputTokens;

export const transactionResultDrawerTokens = {
  spacing: {
    screenGap: buttonTokens.spacing.gapDefault * 3,
    sectionGap: buttonTokens.spacing.gapDefault * 2,
    sectionDividerGap: buttonTokens.spacing.gapDefault * 2,
    subsectionGap: buttonTokens.spacing.gapDefault * 2,
    clientSubsectionGap: 20,
    fieldGap: spacing.iconGap,
    headerActionGap: buttonTokens.spacing.gapDefault + spacing.labelRowGap / 2,
    headerActionButtonRadius: buttonTokens.radius.chip,
    headerActionButtonBorderWidth: 1.5,
    footerGap: buttonTokens.spacing.gapDefault * 1.5,
    looksGoodFooterTop: buttonTokens.spacing.gapDefault * 2.5,
    closeButtonSize: buttonTokens.sizes.sm.minHeight,
    closeIconSize: buttonTokens.sizes.sm.iconSize + spacing.messageGap / 2,
  },
  colors: {
    textPrimary: colors.textPrimary,
    textMuted: colors.textMuted,
    closeButtonBackground: buttonTokens.colors.surfaceMuted,
    closeIcon: colors.textPrimary,
  },
  typography: {
    pageTitle: {
      fontSize: 26,
      fontWeight: "700" as const,
      lineHeight: 32,
      color: colors.textPrimary,
    },
    groupHeading: {
      fontSize: 18,
      fontWeight: "700" as const,
      lineHeight: 22,
      color: colors.textPrimary,
    },
    groupSubheading: {
      fontSize: 13,
      fontWeight: "500" as const,
      lineHeight: 16,
      color: colors.textMuted,
    },
    sectionSubheading: {
      ...typography.label,
      color: colors.textMuted,
      textTransform: "uppercase" as const,
    },
    dateLabel: {
      ...typography.label,
      color: colors.textMuted,
      textTransform: "uppercase" as const,
    },
  },
} as const;

export const transactionResultDrawerStyles = StyleSheet.create({
  content: {
    width: "100%",
    gap: transactionResultDrawerTokens.spacing.screenGap,
    backgroundColor: buttonTokens.colors.surfaceCard,
  },
  topRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.labelRowGap,
  },
  pageTitle: {
    flex: 1,
    ...transactionResultDrawerTokens.typography.pageTitle,
  },
  closeButton: {
    width: transactionResultDrawerTokens.spacing.closeButtonSize,
    height: transactionResultDrawerTokens.spacing.closeButtonSize,
    borderRadius: transactionResultDrawerTokens.spacing.closeButtonSize / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: transactionResultDrawerTokens.colors.closeButtonBackground,
  },
  introBlock: {
    width: "100%",
    gap: transactionResultDrawerTokens.spacing.sectionGap,
  },
  groupHeading: {
    ...transactionResultDrawerTokens.typography.groupHeading,
  },
  groupSubheading: {
    ...transactionResultDrawerTokens.typography.groupSubheading,
  },
  topActions: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: transactionResultDrawerTokens.spacing.headerActionGap,
  },
  topHeaderActionButton: {
    paddingVertical: buttonTokens.spacing.paddingVerticalChip,
    paddingLeft: buttonTokens.spacing.paddingHorizontalChipLeading,
    paddingRight: buttonTokens.spacing.paddingHorizontalChipTrailing,
    borderRadius: transactionResultDrawerTokens.spacing.headerActionButtonRadius,
    borderWidth: transactionResultDrawerTokens.spacing.headerActionButtonBorderWidth,
    borderColor: buttonTokens.colors.borderStrong,
    backgroundColor: buttonTokens.colors.surfaceCard,
  },
  sections: {
    width: "100%",
  },
  sectionDivider: {
    width: "100%",
    paddingVertical: transactionResultDrawerTokens.spacing.sectionDividerGap,
  },
  sectionContent: {
    width: "100%",
    gap: transactionResultDrawerTokens.spacing.fieldGap,
  },
  clientSubsectionList: {
    gap: transactionResultDrawerTokens.spacing.clientSubsectionGap,
  },
  sectionSubheading: {
    ...transactionResultDrawerTokens.typography.sectionSubheading,
  },
  subsection: {
    width: "100%",
    gap: transactionResultDrawerTokens.spacing.subsectionGap,
  },
  dateField: {
    width: "100%",
    gap: spacing.messageGap,
  },
  dateLabel: {
    ...transactionResultDrawerTokens.typography.dateLabel,
  },
  footer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    gap: transactionResultDrawerTokens.spacing.footerGap,
  },
  footerButton: {
    flex: 1,
    minWidth: 0,
  },
  actionCardGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: transactionResultDrawerTokens.spacing.headerActionGap,
    alignItems: "stretch",
  },
  actionCardGridItem: {
    width: "47%",
    minWidth: buttonTokens.spacing.minTouchTarget * 3,
    flexGrow: 1,
  },
  taskList: {
    width: "100%",
    gap: transactionResultDrawerTokens.spacing.sectionGap,
  },
  formsAndTasksContent: {
    width: "100%",
    gap: transactionResultDrawerTokens.spacing.sectionGap,
  },
  looksGoodFooter: {
    paddingTop: transactionResultDrawerTokens.spacing.looksGoodFooterTop,
  },
});
