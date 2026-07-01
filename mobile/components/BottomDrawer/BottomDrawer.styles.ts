import { StyleSheet } from "react-native";

import { colors } from "@/constants/colors";

export const bottomDrawerTokens = {
  contentPadding: {
    top: 20,
    horizontal: 24,
    bottom: 0,
  },
  snapPoints: {
    sm: "30%",
    md: "50%",
    lg: "80%",
    full: "95%",
  },
  backdrop: {
    opacity: 0.5,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.gray[500],
  },
  footer: {
    paddingTop: 16,
    paddingHorizontal: 24,
    actionHeight: 52,
    scrollPadding: 16,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  colors: {
    sheetBackground: colors.primary[100],
    backdrop: colors.gray[800],
  },
} as const;

export const bottomDrawerStyles = StyleSheet.create({
  backdrop: {
    backgroundColor: bottomDrawerTokens.colors.backdrop,
  },
  background: {
    backgroundColor: bottomDrawerTokens.colors.sheetBackground,
    borderTopLeftRadius: bottomDrawerTokens.sheet.borderTopLeftRadius,
    borderTopRightRadius: bottomDrawerTokens.sheet.borderTopRightRadius,
  },
  sheetContainer: {
    zIndex: 1000,
  },
  sheetContent: {
    flex: 1,
  },
  handle: {
    width: bottomDrawerTokens.handle.width,
    height: bottomDrawerTokens.handle.height,
    borderRadius: bottomDrawerTokens.handle.borderRadius,
    backgroundColor: bottomDrawerTokens.handle.backgroundColor,
  },
  stickyLayout: {
    flex: 1,
  },
  stickyScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: bottomDrawerTokens.contentPadding.top,
    paddingHorizontal: bottomDrawerTokens.contentPadding.horizontal,
    paddingBottom: bottomDrawerTokens.contentPadding.bottom,
  },
  footerContainer: {
    paddingTop: bottomDrawerTokens.footer.paddingTop,
    paddingHorizontal: bottomDrawerTokens.footer.paddingHorizontal,
  },
  footerContent: {
    width: "100%",
    alignSelf: "stretch",
  },
});
