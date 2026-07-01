import React, { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

/** Minimum parent height for DocumentUploadZone Storybook stories. */
export const DOCUMENT_UPLOAD_ZONE_STORY_MIN_HEIGHT = 550;

export function DocumentUploadZoneStoryFrame({
  children,
}: {
  children: ReactNode;
}) {
  return <View style={styles.frame}>{children}</View>;
}

const styles = StyleSheet.create({
  frame: {
    minHeight: DOCUMENT_UPLOAD_ZONE_STORY_MIN_HEIGHT,
    height: DOCUMENT_UPLOAD_ZONE_STORY_MIN_HEIGHT,
    width: "100%",
    alignSelf: "stretch",
  },
});
