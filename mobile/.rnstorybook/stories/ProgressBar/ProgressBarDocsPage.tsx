import React from "react";

import { ProgressBar } from "../../../components/ProgressBar";
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
import { ProgressBarShowcase } from "./ProgressBarShowcase";
import {
  PROGRESS_BAR_DOCS_DESCRIPTION,
  PROGRESS_BAR_PROP_DEFINITIONS,
} from "./progressBarArgTypes";

const USAGE_PROCESSING = `<ProgressBar value={37} size="md" striped />`;

const USAGE_LABEL = `<ProgressBar
  value={72}
  showLabel
  labelPosition="right"
/>`;

const USAGE_VARIANT = `<ProgressBar value={100} variant="success" />`;

export function ProgressBarDocsPage() {
  return (
    <DocScreen>
      <DocTitle>ProgressBar</DocTitle>
      <DocSubtitle>{PROGRESS_BAR_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview preview">
        <DocParagraph>
          Use this primitive anywhere the app needs percentage progress. Keep
          upload or processing logic outside the component and pass a plain
          value.
        </DocParagraph>
        <DocPreviewCard label="Figma processing">
          <ProgressBar value={37} size="md" striped />
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...PROGRESS_BAR_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage examples">
        <DocCodeBlock code={USAGE_PROCESSING} />
        <DocCodeBlock code={USAGE_LABEL} />
        <DocCodeBlock code={USAGE_VARIANT} />
        <DocGalleryGrid>
          <DocGalleryItem label="Default">
            <ProgressBar value={48} />
          </DocGalleryItem>
          <DocGalleryItem label="With label">
            <ProgressBar value={72} showLabel labelPosition="right" />
          </DocGalleryItem>
          <DocGalleryItem label="Success">
            <ProgressBar value={100} variant="success" />
          </DocGalleryItem>
        </DocGalleryGrid>
      </DocSection>

      <DocSection title="Component gallery">
        <DocParagraph>
          Examples grouped by Figma processing, values, sizes, variants, labels,
          and striped states.
        </DocParagraph>
        <ProgressBarShowcase />
      </DocSection>
    </DocScreen>
  );
}
