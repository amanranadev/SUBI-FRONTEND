import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Badge } from "@/components/ChipsBadges";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { PrimaryButton } from "@/components/PrimaryButton";

import {
  DocBulletList,
  DocCodeBlock,
  DocParagraph,
  DocPreviewCard,
  DocPropsTable,
  DocScreen,
  DocSection,
  DocSubtitle,
  DocTitle,
} from "../../components/DocsPrimitives";
import {
  COLLAPSIBLE_SECTION_DOCS_DESCRIPTION,
  COLLAPSIBLE_SECTION_PROP_DEFINITIONS,
} from "./collapsibleSectionArgTypes";
import { CollapsibleSectionShowcase } from "./CollapsibleSectionShowcase";

const USAGE_BASIC = `<CollapsibleSection
  title="TRANSACTION SUMMARY"
  defaultExpanded
>
  <TransactionSummaryForm />
</CollapsibleSection>`;

const USAGE_BADGE = `<CollapsibleSection
  title="TRANSACTION SUMMARY"
  badge={<Badge label="Needs Review" variant="warning" size="lg" />}
>
  <TransactionSummaryForm />
</CollapsibleSection>`;

const USAGE_FOOTER = `<CollapsibleSection
  title="TRANSACTION SUMMARY"
  footer={
    <PrimaryButton onPress={handleLooksGood}>
      Looks Good
    </PrimaryButton>
  }
>
  <TransactionSummaryForm />
</CollapsibleSection>`;

const USAGE_CONTROLLED = `<CollapsibleSection
  title="TRANSACTION SUMMARY"
  expanded={expanded}
  onExpandedChange={setExpanded}
>
  <TransactionSummaryForm />
</CollapsibleSection>`;

export function CollapsibleSectionDocsPage() {
  const [playgroundExpanded, setPlaygroundExpanded] = useState(true);

  return (
    <DocScreen>
      <DocTitle>CollapsibleSection</DocTitle>
      <DocSubtitle>{COLLAPSIBLE_SECTION_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview">
        <DocParagraph>
          CollapsibleSection is a composable primitive for expandable review
          panels. Parents pass business content, badges, accessories, and footer
          actions while the shell handles expand/collapse behavior.
        </DocParagraph>
      </DocSection>

      <DocSection title="Design principles">
        <DocBulletList
          items={[
            "Generic — no transaction, review, or workflow-specific props.",
            "Workflow agnostic — validation and status logic stay in parents.",
            "Composable — badge, accessory, and footer are ReactNode slots.",
          ]}
        />
      </DocSection>

      <DocSection title="Playground">
        <DocPreviewCard label="Interactive preview">
          <CollapsibleSection
            title="TRANSACTION SUMMARY"
            expanded={playgroundExpanded}
            onExpandedChange={setPlaygroundExpanded}
            badge={<Badge label="Needs Review" variant="warning" size="lg" />}
            footer={
              <PrimaryButton
                size="sm"
                onPress={() => setPlaygroundExpanded(false)}
              >
                Looks Good
              </PrimaryButton>
            }
          >
            <View style={styles.previewContent}>
              <Text style={styles.previewText}>
                Tap the header to expand or collapse this section.
              </Text>
            </View>
          </CollapsibleSection>
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...COLLAPSIBLE_SECTION_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage examples">
        <DocCodeBlock code={USAGE_BASIC} />
        <DocCodeBlock code={USAGE_BADGE} />
        <DocCodeBlock code={USAGE_FOOTER} />
        <DocCodeBlock code={USAGE_CONTROLLED} />
      </DocSection>

      <DocSection title="Accessibility">
        <DocBulletList
          items={[
            "Header is a single accessible button with expanded/collapsed state.",
            "Chevron is decorative and hidden from screen readers.",
            "Parents should provide meaningful badge and accessory labels.",
          ]}
        />
      </DocSection>

      <DocSection title="Component gallery">
        <CollapsibleSectionShowcase />
      </DocSection>
    </DocScreen>
  );
}

const styles = StyleSheet.create({
  previewContent: {
    gap: 8,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#2C2C2C",
  },
});
