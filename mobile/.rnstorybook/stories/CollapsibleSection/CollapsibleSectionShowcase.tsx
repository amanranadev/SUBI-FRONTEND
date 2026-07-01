import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "@/assets/icon-system";
import { Badge } from "@/components/ChipsBadges";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { PrimaryButton } from "@/components/PrimaryButton";

import {
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

function DemoContent({ lines }: { lines: string[] }) {
  return (
    <View style={styles.content}>
      {lines.map((line) => (
        <Text key={line} style={styles.bodyText}>
          {line}
        </Text>
      ))}
    </View>
  );
}

const DEMO_LINES = [
  "Section body content belongs to the parent.",
  "CollapsibleSection only controls presentation and expand/collapse.",
];

export type CollapsibleSectionShowcaseSection =
  | "all"
  | "expanded"
  | "collapsed"
  | "badge"
  | "footer"
  | "accessory"
  | "longTitle"
  | "controlled"
  | "disabled";

export function CollapsibleSectionShowcase({
  section = "all",
}: {
  section?: CollapsibleSectionShowcaseSection;
}) {
  const [controlledExpanded, setControlledExpanded] = useState(true);
  const show = (name: CollapsibleSectionShowcaseSection) =>
    section === "all" || section === name;

  return (
    <GalleryScreen>
      {show("expanded") ? (
        <GallerySection title="Expanded by default">
          <GalleryItem label="Default expanded" wide>
            <CollapsibleSection
              title="TRANSACTION SUMMARY"
              defaultExpanded
            >
              <DemoContent lines={DEMO_LINES} />
            </CollapsibleSection>
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("collapsed") ? (
        <GallerySection title="Collapsed by default">
          <GalleryItem label="Default collapsed" wide>
            <CollapsibleSection title="PROPERTY DETAILS">
              <DemoContent lines={DEMO_LINES} />
            </CollapsibleSection>
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("badge") ? (
        <GallerySection title="With badge">
          <GalleryItem label="Needs Review" wide>
            <CollapsibleSection
              title="TRANSACTION SUMMARY"
              badge={<Badge label="Needs Review" variant="warning" size="lg" />}
              defaultExpanded
            >
              <DemoContent lines={DEMO_LINES} />
            </CollapsibleSection>
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("footer") ? (
        <GallerySection title="With footer">
          <GalleryItem label="Looks Good" wide>
            <CollapsibleSection
              title="TRANSACTION SUMMARY"
              defaultExpanded
              footer={
                <PrimaryButton size="sm" onPress={() => {}}>
                  Looks Good
                </PrimaryButton>
              }
            >
              <DemoContent lines={DEMO_LINES} />
            </CollapsibleSection>
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("accessory") ? (
        <GallerySection title="With header accessory">
          <GalleryItem label="Edit action" wide>
            <CollapsibleSection
              title="DOCUMENTS"
              defaultExpanded
              headerAccessory={
                <Icon
                  name="edit"
                  size={16}
                  color="#2C2C2C"
                  accessibilityLabel="Edit section"
                />
              }
            >
              <DemoContent lines={DEMO_LINES} />
            </CollapsibleSection>
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("longTitle") ? (
        <GallerySection title="Long title">
          <GalleryItem label="Wrapping title" wide>
            <CollapsibleSection
              title="TRANSACTION SUMMARY AND COMPLIANCE REVIEW DETAILS"
              badge={<Badge label="Needs Review" variant="warning" size="lg" />}
              defaultExpanded
            >
              <DemoContent lines={DEMO_LINES} />
            </CollapsibleSection>
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("controlled") ? (
        <GallerySection title="Controlled">
          <GalleryItem label="External state" wide>
            <CollapsibleSection
              title="CONTROLLED SECTION"
              expanded={controlledExpanded}
              onExpandedChange={setControlledExpanded}
              footer={
                <PrimaryButton
                  fullWidth
                  variant="outline"
                  onPress={() => setControlledExpanded((value) => !value)}
                >
                  Toggle from footer
                </PrimaryButton>
              }
            >
              <DemoContent
                lines={[
                  `Expanded: ${controlledExpanded ? "true" : "false"}`,
                  "Parent owns expanded state via the expanded prop.",
                ]}
              />
            </CollapsibleSection>
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("disabled") ? (
        <GallerySection title="Disabled">
          <GalleryItem label="No interaction" wide>
            <CollapsibleSection
              title="DISABLED SECTION"
              defaultExpanded
              disabled
              badge={<Badge label="Done" variant="success" size="lg" />}
            >
              <DemoContent lines={DEMO_LINES} />
            </CollapsibleSection>
          </GalleryItem>
        </GallerySection>
      ) : null}
    </GalleryScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#2C2C2C",
  },
});
