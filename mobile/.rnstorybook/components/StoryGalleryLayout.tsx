import React, { type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export const GALLERY_SPACING = {
  sectionGap: 28,
  rowGap: 12,
  columnGap: 12,
  itemMinWidth: 148,
} as const;

export function GalleryScreen({ children }: { children: ReactNode }) {
  return <View style={galleryStyles.screen}>{children}</View>;
}

export function GallerySection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <View style={galleryStyles.section}>
      <Text style={galleryStyles.sectionTitle}>{title}</Text>
      {description ? (
        <Text style={galleryStyles.sectionDescription}>{description}</Text>
      ) : null}
      <View style={galleryStyles.galleryRow}>{children}</View>
    </View>
  );
}

export function GalleryItem({
  label,
  children,
  wide,
}: {
  label?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <View
      style={[
        galleryStyles.galleryItem,
        wide ? galleryStyles.galleryItemWide : null,
      ]}
    >
      {label ? <Text style={galleryStyles.itemLabel}>{label}</Text> : null}
      <View
        style={[
          galleryStyles.itemBody,
          wide ? galleryStyles.itemBodyWide : null,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export function GalleryFullWidthRow({ children }: { children: ReactNode }) {
  return (
    <View style={galleryStyles.fullWidthRow}>{children}</View>
  );
}

const galleryStyles = StyleSheet.create({
  screen: {
    width: "100%",
    gap: GALLERY_SPACING.sectionGap,
    paddingBottom: 24,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C2C2C",
    letterSpacing: -0.2,
  },
  sectionDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6B6B6B",
    marginBottom: 2,
  },
  galleryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: GALLERY_SPACING.columnGap,
    rowGap: GALLERY_SPACING.rowGap,
  },
  galleryItem: {
    minWidth: GALLERY_SPACING.itemMinWidth,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECECEC",
    backgroundColor: "#FFFFFF",
    gap: 10,
  },
  galleryItemWide: {
    width: "100%",
    minWidth: "100%",
    maxWidth: "100%",
    flexBasis: "100%",
    overflow: "hidden",
  },
  itemLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9A9A9A",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  itemBody: {
    alignItems: "flex-start",
    justifyContent: "center",
    minHeight: 40,
  },
  itemBodyWide: {
    alignSelf: "stretch",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    overflow: "hidden",
  },
  fullWidthRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GALLERY_SPACING.columnGap,
    width: "100%",
    flexBasis: "100%",
  },
});
