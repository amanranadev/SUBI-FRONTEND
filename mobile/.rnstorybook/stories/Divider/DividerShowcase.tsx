import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Divider } from "../../../components/Divider";

import {
  GalleryFullWidthRow,
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

export type DividerShowcaseSection =
  | "all"
  | "variants"
  | "orientation"
  | "thickness"
  | "inset"
  | "usage";

export interface DividerShowcaseProps {
  section?: DividerShowcaseSection;
}

function CardLayoutDemo() {
  return (
    <View style={showcaseStyles.card}>
      <Text style={showcaseStyles.cardHeader}>Header</Text>
      <Divider />
      <Text style={showcaseStyles.cardContent}>Content section below the divider.</Text>
    </View>
  );
}

function ActionLayoutDemo() {
  return (
    <View style={showcaseStyles.actionRow}>
      <Text style={showcaseStyles.actionLabel}>Edit</Text>
      <Divider orientation="vertical" />
      <Text style={showcaseStyles.actionLabel}>Delete</Text>
    </View>
  );
}

export function DividerShowcase({ section = "all" }: DividerShowcaseProps) {
  const show = (key: Exclude<DividerShowcaseSection, "all">) =>
    section === "all" || section === key;

  return (
    <GalleryScreen>
      {show("variants") ? (
        <GallerySection
          title="1. Variants"
          description="Solid (Figma default) and dashed line styles."
        >
          <GalleryItem label="Solid" wide>
            <Divider variant="solid" />
          </GalleryItem>
          <GalleryItem label="Dashed" wide>
            <Divider variant="dashed" />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("orientation") ? (
        <GallerySection
          title="2. Orientation"
          description="Horizontal for stacked layouts; vertical for inline actions."
        >
          <GalleryItem label="Horizontal" wide>
            <Divider orientation="horizontal" />
          </GalleryItem>
          <GalleryItem label="Vertical">
            <View style={showcaseStyles.verticalDemo}>
              <Divider orientation="vertical" />
            </View>
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("thickness") ? (
        <GallerySection
          title="3. Thickness"
          description="Hairline (1px) and strong (2px) weights."
        >
          <GalleryItem label="1px" wide>
            <Divider thickness={1} />
          </GalleryItem>
          <GalleryItem label="2px" wide>
            <Divider thickness={2} />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("inset") ? (
        <GallerySection
          title="4. Inset"
          description="Full token width versus inset horizontal margins."
        >
          <GalleryItem label="Full width" wide>
            <Divider />
          </GalleryItem>
          <GalleryItem label="Inset" wide>
            <Divider inset />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("usage") ? (
        <GallerySection
          title="5. Real usage"
          description="Card sections and inline action groups."
        >
          <GalleryItem label="Card layout" wide>
            <CardLayoutDemo />
          </GalleryItem>
          <GalleryItem label="Action layout" wide>
            <ActionLayoutDemo />
          </GalleryItem>
          <GalleryItem label="Combined row" wide>
            <GalleryFullWidthRow>
              <CardLayoutDemo />
              <ActionLayoutDemo />
            </GalleryFullWidthRow>
          </GalleryItem>
        </GallerySection>
      ) : null}
    </GalleryScreen>
  );
}

const showcaseStyles = StyleSheet.create({
  card: {
    width: "100%",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECECEC",
    backgroundColor: "#FFFFFF",
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C2C2C",
  },
  cardContent: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6B6B6B",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C2C2C",
  },
  verticalDemo: {
    minHeight: 40,
    justifyContent: "center",
  },
});
