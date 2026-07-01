import { StyleSheet } from "react-native";

import { typography } from "@/constants/typography";
import { loginScreenTokens } from "./loginScreen.tokens";

const { colors, spacing, greetingCircle } = loginScreenTokens;

export const loginScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: spacing.contentMaxWidth,
    alignSelf: "center",
  },
  mainContent: {
    flexGrow: 1,
    width: "100%",
    gap: spacing.sectionGap,
  },
  greetingCircle: {
    width: greetingCircle.size,
    height: greetingCircle.size,
    borderRadius: greetingCircle.borderRadius,
    backgroundColor: colors.greetingCircleBackground,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  greetingEmoji: {
    fontSize: greetingCircle.emojiSize,
    lineHeight: greetingCircle.emojiSize + 4,
    color: colors.headingPrimary,
  },
  welcomeHeadingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.headingInlineGap,
  },
  welcomeHeadingPrimary: {
    ...typography.headingLg,
    color: colors.headingPrimary,
    textAlign: "center",
  },
  welcomeHeadingBrand: {
    ...typography.headingLg,
    color: colors.headingBrand,
    textAlign: "center",
  },
  formSection: {
    width: "100%",
    gap: spacing.sectionGap,
  },
  formFields: {
    width: "100%",
    gap: spacing.formFieldGap,
  },
  actions: {
    width: "100%",
    gap: spacing.sectionGap,
  },
  supportingSection: {
    width: "100%",
    alignItems: "center",
    gap: spacing.supportingRowGap,
  },
  supportingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.supportingInlineGap,
  },
  supportingMuted: {
    ...typography.bodyMd,
    color: colors.bodyMuted,
    textAlign: "center",
  },
  supportingBrand: {
    ...typography.bodyMd,
    color: colors.linkBrand,
    textAlign: "center",
  },
  supportingPrimary: {
    ...typography.bodyMd,
    color: colors.bodyPrimary,
    textAlign: "center",
  },
  termsSection: {
    width: "100%",
    alignItems: "center",
    gap: spacing.termsLineGap,
    paddingTop: spacing.sectionGap,
  },
  termsIntro: {
    ...typography.bodySm,
    color: colors.bodyMuted,
    textAlign: "center",
  },
  termsLinksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.termsLinkGap,
  },
  termsLink: {
    ...typography.bodySm,
    color: colors.linkBrand,
    textAlign: "center",
  },
  termsMuted: {
    ...typography.bodySm,
    color: colors.bodyMuted,
    textAlign: "center",
  },
});
