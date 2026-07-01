import { StyleSheet } from "react-native";

import { formFieldInputTokens } from "../FormFieldInput/tokens";
import { buttonTokens } from "../PrimaryButton/tokens";

const { spacing, typography, sizes } = formFieldInputTokens;

export const personInfoSectionTokens = {
  spacing: {
    sectionGap: spacing.fieldGap,
    nameRowGap: spacing.iconGap,
    removeButtonOffset:
      typography.label.lineHeight + spacing.fieldGap,
  },
  colors: {
    removeIcon: buttonTokens.colors.destructive,
  },
  icon: {
    removeSize: buttonTokens.sizes.md.iconSize,
  },
} as const;

export const personInfoSectionStyles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "stretch",
    gap: personInfoSectionTokens.spacing.sectionGap,
  },
  nameRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: personInfoSectionTokens.spacing.nameRowGap,
  },
  nameField: {
    flex: 1,
    minWidth: 0,
  },
  removeButtonSlot: {
    flexShrink: 0,
    paddingTop: personInfoSectionTokens.spacing.removeButtonOffset,
    height:
      personInfoSectionTokens.spacing.removeButtonOffset +
      sizes.md.minHeight,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButton: {
    minWidth: buttonTokens.spacing.minTouchTarget,
    minHeight: buttonTokens.spacing.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidthField: {
    width: "100%",
    alignSelf: "stretch",
  },
});
