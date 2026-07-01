import { StyleSheet } from "react-native";

import { taskCardTokens } from "./tokens";

const {
  colors,
  typography,
  spacing,
  radius,
  sizing,
  shadow,
  opacity,
} = taskCardTokens;

export { taskCardTokens };

export const taskCardStyles = StyleSheet.create({
  card: {
    width: "100%",
    alignSelf: "stretch",
    padding: spacing.cardPadding,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: spacing.sectionGap,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    ...shadow,
  },
  cardDone: {
    borderColor: colors.borderDone,
  },
  cardSkipped: {
    opacity: opacity.skipped,
  },
  cardDisabled: {
    opacity: opacity.disabled,
  },
  transactionName: {
    width: "100%",
    color: colors.transactionName,
    ...typography.transactionName,
  },
  taskHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.headerActionGap,
  },
  taskName: {
    flex: 1,
    minWidth: 0,
    color: colors.taskName,
    fontFamily: typography.taskName.fontFamily,
    fontSize: typography.taskName.fontSize,
    lineHeight: typography.taskName.lineHeight,
    letterSpacing: typography.taskName.letterSpacing,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.headerActionGap,
    flexShrink: 0,
  },
  headerActionButton: {
    width: sizing.headerIcon,
    height: sizing.headerIcon,
    alignItems: "center",
    justifyContent: "center",
  },
  datePicker: {
    alignSelf: "flex-start",
  },
  divider: {
    width: "100%",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.actionGap,
  },
});
