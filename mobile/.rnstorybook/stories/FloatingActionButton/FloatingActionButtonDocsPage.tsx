import React from "react";

import { FloatingActionButton } from "../../../components/FloatingActionButton";
import {
  DocCodeBlock,
  DocGalleryGrid,
  DocGalleryItem,
  DocParagraph,
  DocPreviewCard,
  DocPropsTable,
  DocScreen,
  DocSection,
  DocSubtitle,
  DocTitle,
} from "../../components/DocsPrimitives";
import {
  FLOATING_ACTION_BUTTON_DOCS_DESCRIPTION,
  FLOATING_ACTION_BUTTON_PROP_DEFINITIONS,
} from "./floatingActionButtonArgTypes";
import { FloatingActionButtonShowcase } from "./FloatingActionButtonShowcase";

const USAGE_FIGMA = `<FloatingActionButton onPress={handleOpenActions} />`;

const USAGE_CUSTOM = `<FloatingActionButton accessibilityLabel="Add item">
  <Icon name="add" color="#FFFFFF" />
</FloatingActionButton>`;

export function FloatingActionButtonDocsPage() {
  return (
    <DocScreen>
      <DocTitle>FloatingActionButton</DocTitle>
      <DocSubtitle>{FLOATING_ACTION_BUTTON_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview preview">
        <DocParagraph>
          Use the default for the mobile Home FAB. Use children only when the
          action is not the Subi brand trigger.
        </DocParagraph>
        <DocPreviewCard label="Figma FAB">
          <FloatingActionButton />
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...FLOATING_ACTION_BUTTON_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage examples">
        <DocCodeBlock code={USAGE_FIGMA} />
        <DocCodeBlock code={USAGE_CUSTOM} />
        <DocGalleryGrid>
          <DocGalleryItem label="Default">
            <FloatingActionButton />
          </DocGalleryItem>
          <DocGalleryItem label="Dark">
            <FloatingActionButton variant="dark" />
          </DocGalleryItem>
          <DocGalleryItem label="Disabled">
            <FloatingActionButton disabled />
          </DocGalleryItem>
        </DocGalleryGrid>
      </DocSection>

      <DocSection title="Component gallery">
        <DocParagraph>
          Examples grouped by Figma reference, sizes, variants, shapes, states,
          and custom content.
        </DocParagraph>
        <FloatingActionButtonShowcase />
      </DocSection>
    </DocScreen>
  );
}
