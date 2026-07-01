import { StyleSheet } from "react-native";

import { formFieldInputTokens } from "../FormFieldInput/tokens";
import { buttonTokens } from "../PrimaryButton/tokens";

const { spacing } = formFieldInputTokens;

export const personInfoListTokens = {
  spacing: {
    sectionGap: spacing.fieldGap,
    headerActionsGap: spacing.iconGap,
    personEntryGap: 20,
    personHeaderGap: spacing.labelRowGap,
  },
  icon: {
    actionSize: buttonTokens.sizes.sm.iconSize,
  },
} as const;

export const personInfoListStyles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "stretch",
    gap: personInfoListTokens.spacing.sectionGap,
  },
  headerActions: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: personInfoListTokens.spacing.headerActionsGap,
  },
  peopleSection: {
    width: "100%",
    gap: personInfoListTokens.spacing.personEntryGap,
  },
  personEntry: {
    width: "100%",
    gap: personInfoListTokens.spacing.personEntryGap,
  },
  personEntryHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: personInfoListTokens.spacing.personHeaderGap,
  },
  sourceBadgeSlot: {
    flex: 1,
    minWidth: 0,
  },
});
