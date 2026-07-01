import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { ProgressBar, progressBarTokens } from "../../../components/ProgressBar";
import {
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

export type ProgressBarShowcaseSection =
  | "all"
  | "figma"
  | "values"
  | "sizes"
  | "variants"
  | "labels"
  | "striped";

export interface ProgressBarShowcaseProps {
  section?: ProgressBarShowcaseSection;
}

export function ProgressBarShowcase({
  section = "all",
}: ProgressBarShowcaseProps) {
  const show = (key: Exclude<ProgressBarShowcaseSection, "all">) =>
    section === "all" || section === key;

  return (
    <GalleryScreen>
      {show("figma") ? (
        <GallerySection
          title="1. Figma Processing"
          description="Mobile Home processing state, sized for the 345px content column."
        >
          <GalleryItem label="Processing" wide>
            <View style={styles.figmaPreview}>
              <Text style={styles.figmaTitle}>Processing Your Document</Text>
              <Text style={styles.figmaMessage}>
                Checking cache and starting analysis...
              </Text>
              <ProgressBar value={37} size="md" striped animated />
            </View>
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("values") ? (
        <GallerySection title="2. Values" description="Clamped 0-100 progress.">
          <GalleryItem label="Empty">
            <ProgressBar value={0} />
          </GalleryItem>
          <GalleryItem label="Partial">
            <ProgressBar value={32} />
          </GalleryItem>
          <GalleryItem label="Complete">
            <ProgressBar value={100} />
          </GalleryItem>
          <GalleryItem label="Clamped">
            <ProgressBar value={140} showLabel labelPosition="right" />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("sizes") ? (
        <GallerySection title="3. Sizes" description="Use md for Figma processing.">
          <GalleryItem label="Small">
            <ProgressBar value={64} size="sm" />
          </GalleryItem>
          <GalleryItem label="Medium">
            <ProgressBar value={64} size="md" />
          </GalleryItem>
          <GalleryItem label="Large">
            <ProgressBar value={64} size="lg" />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("variants") ? (
        <GallerySection title="4. Variants" description="Semantic fill colors.">
          <GalleryItem label="Default">
            <ProgressBar value={56} variant="default" />
          </GalleryItem>
          <GalleryItem label="Success">
            <ProgressBar value={88} variant="success" />
          </GalleryItem>
          <GalleryItem label="Warning">
            <ProgressBar value={46} variant="warning" />
          </GalleryItem>
          <GalleryItem label="Danger">
            <ProgressBar value={22} variant="danger" />
          </GalleryItem>
          <GalleryItem label="Muted">
            <ProgressBar value={40} variant="muted" />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("labels") ? (
        <GallerySection title="5. Labels" description="Optional label placement.">
          <GalleryItem label="Top" wide>
            <ProgressBar value={72} showLabel labelPosition="top" />
          </GalleryItem>
          <GalleryItem label="Bottom" wide>
            <ProgressBar value={72} showLabel labelPosition="bottom" />
          </GalleryItem>
          <GalleryItem label="Right" wide>
            <ProgressBar value={72} showLabel labelPosition="right" />
          </GalleryItem>
          <GalleryItem label="Custom" wide>
            <ProgressBar
              value={50}
              showLabel
              labelPosition="top"
              label="Text Extraction"
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("striped") ? (
        <GallerySection
          title="6. Striped"
          description="Static stripe overlay inspired by the web primitive."
        >
          <GalleryItem label="Default" wide>
            <ProgressBar value={68} striped />
          </GalleryItem>
          <GalleryItem label="Success" wide>
            <ProgressBar value={82} variant="success" striped />
          </GalleryItem>
          <GalleryItem label="Danger" wide>
            <ProgressBar value={28} variant="danger" striped />
          </GalleryItem>
        </GallerySection>
      ) : null}
    </GalleryScreen>
  );
}

const styles = StyleSheet.create({
  figmaPreview: {
    width: "100%",
    maxWidth: 345,
    gap: 12,
  },
  figmaTitle: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 28,
    color: progressBarTokens.colors.textPrimary,
    textAlign: "center",
  },
  figmaMessage: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
    color: progressBarTokens.colors.textMuted,
    textAlign: "center",
  },
});
