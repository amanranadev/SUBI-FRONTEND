import React, { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

export function ProcessingFailedModalStoryFrame({
  children,
}: {
  children: ReactNode;
}) {
  return <View style={styles.frame}>{children}</View>;
}

const styles = StyleSheet.create({
  frame: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    alignSelf: "stretch",
  },
});
