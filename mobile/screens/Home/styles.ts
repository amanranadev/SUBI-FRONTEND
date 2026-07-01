import { StyleSheet } from "react-native";

import { homeScreenTokens } from "./tokens";

const { colors, spacing } = homeScreenTokens;

export const homeScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  container: {
    flex: 1,
    alignSelf: "stretch",
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: spacing.containerPaddingTop,
    paddingHorizontal: spacing.containerPaddingHorizontal,
    paddingBottom: spacing.containerPaddingBottom,
  },
  header: {
    alignSelf: "stretch",
    width: "100%",
  },
  uploadZone: {
    alignSelf: "stretch",
    width: "100%",
    flex: 1,
  },
  uploadPanel: {
    flex: 1,
    alignSelf: "stretch",
    width: "100%",
    justifyContent: "center",
  },
});
