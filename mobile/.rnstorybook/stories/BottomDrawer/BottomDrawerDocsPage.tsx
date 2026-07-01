import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { bottomDrawerTokens } from "../../../components/BottomDrawer";
import { PrimaryButton } from "../../../components/PrimaryButton";
import {
  DocBulletList,
  DocCodeBlock,
  DocGalleryGrid,
  DocGalleryItem,
  DocHeading,
  DocParagraph,
  DocPreviewCard,
  DocPropsTable,
  DocScreen,
  DocSection,
  DocSubtitle,
  DocTitle,
} from "../../components/DocsPrimitives";
import {
  BOTTOM_DRAWER_DOCS_DESCRIPTION,
  BOTTOM_DRAWER_PROP_DEFINITIONS,
} from "./bottomDrawerArgTypes";
import { BottomDrawerStoryShell } from "./BottomDrawerStoryShell";

const USAGE_EXAMPLE = `<BottomDrawer
  open={open}
  size="lg"
  footer={
    <PrimaryButton>
      Save
    </PrimaryButton>
  }
>
  <TransactionReviewForm />
</BottomDrawer>`;

const DEMO_PARAGRAPHS = [
  "Review the uploaded documents and confirm the extracted fields before saving.",
  "The drawer handles scrolling, backdrop dismissal, and safe-area padding automatically.",
  "Pass titles, descriptions, forms, and actions through children and footer only.",
];

function DemoContent({ lines = DEMO_PARAGRAPHS }: { lines?: string[] }) {
  return (
    <View style={docDemoStyles.content}>
      {lines.map((line) => (
        <Text key={line} style={docDemoStyles.bodyText}>
          {line}
        </Text>
      ))}
    </View>
  );
}

export function BottomDrawerDocsPage() {
  const [playgroundSize, setPlaygroundSize] =
    useState<"content" | "sm" | "md" | "lg" | "full">("content");
  const [playgroundFooterBehavior, setPlaygroundFooterBehavior] =
    useState<"sticky" | "scroll">("sticky");

  return (
    <DocScreen>
      <DocTitle>BottomDrawer</DocTitle>
      <DocSubtitle>{BOTTOM_DRAWER_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview">
        <DocParagraph>
          BottomDrawer is a design-system primitive for modal bottom surfaces.
          It centralizes presentation concerns so feature screens can focus on
          business content through children and an optional footer slot.
        </DocParagraph>
      </DocSection>

      <DocSection title="Design principles">
        <DocBulletList
          items={[
            "Presentation only — no titles, forms, or business props on the shell.",
            "Business content is always rendered through children and footer.",
            "Scrolling is automatic; consumers never pass a scrollable flag.",
            "Snap points are internal; consumers choose a size preset instead.",
          ]}
        />
      </DocSection>

      <DocSection title="Playground">
        <DocParagraph>
          Adjust size and footer behavior, then open the drawer to inspect
          backdrop dismissal, swipe-to-close, and footer layout.
        </DocParagraph>
        <DocGalleryGrid>
          {(["content", "sm", "md", "lg", "full"] as const).map((size) => (
            <DocGalleryItem key={size} label={size}>
              <PrimaryButton
                size="sm"
                variant={playgroundSize === size ? "primary" : "outline"}
                onPress={() => setPlaygroundSize(size)}
              >
                {size}
              </PrimaryButton>
            </DocGalleryItem>
          ))}
        </DocGalleryGrid>
        <DocGalleryGrid>
          {(["sticky", "scroll"] as const).map((behavior) => (
            <DocGalleryItem key={behavior} label={behavior}>
              <PrimaryButton
                size="sm"
                variant={
                  playgroundFooterBehavior === behavior ? "primary" : "outline"
                }
                onPress={() => setPlaygroundFooterBehavior(behavior)}
              >
                {behavior}
              </PrimaryButton>
            </DocGalleryItem>
          ))}
        </DocGalleryGrid>
        <DocPreviewCard label="Interactive preview">
          <BottomDrawerStoryShell
            showTrigger
            triggerLabel="Open playground drawer"
            size={playgroundSize}
            footerBehavior={playgroundFooterBehavior}
            footer={<PrimaryButton fullWidth>Save</PrimaryButton>}
          >
            <DemoContent />
          </BottomDrawerStoryShell>
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...BOTTOM_DRAWER_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage example">
        <DocCodeBlock code={USAGE_EXAMPLE} />
      </DocSection>

      <DocSection title="Footer behavior">
        <DocHeading level={3}>sticky</DocHeading>
        <DocParagraph>
          Footer stays visible while the body scrolls behind it. Safe-area
          padding is applied to the footer container.
        </DocParagraph>
        <DocHeading level={3}>scroll</DocHeading>
        <DocParagraph>
          Footer is rendered after the body inside the scroll view so it moves
          with long content.
        </DocParagraph>
      </DocSection>

      <DocSection title="Size mapping">
        <DocBulletList
          items={[
            "content → dynamic sizing based on body height",
            "sm → 30% viewport height",
            "md → 50% viewport height",
            "lg → 80% viewport height",
            "full → 95% viewport height",
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <DocBulletList
          items={[
            "Drawer is presented as a modal for assistive technologies.",
            "Backdrop is exposed as a close button with an accessibility label.",
            "Consumers should provide meaningful labels on interactive footer content.",
            "Parent must set open to false inside onClose after dismissal.",
          ]}
        />
      </DocSection>
    </DocScreen>
  );
}

const docDemoStyles = StyleSheet.create({
  content: {
    gap: 12,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: bottomDrawerTokens.colors.backdrop,
  },
});
