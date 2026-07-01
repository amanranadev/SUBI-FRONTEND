import React from "react";

import { Divider, dividerTokens } from "../../../components/Divider";

import {
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
  DocTitle
} from "../../components/DocsPrimitives";
import { DividerShowcase } from "./DividerShowcase";
import {
  DIVIDER_DOCS_DESCRIPTION,
  DIVIDER_PROP_DEFINITIONS,
} from "./dividerArgTypes";

const { colors: c, dimensions: d, thickness: t, spacing: s } = dividerTokens;

const USAGE_BASIC = `<Divider />`;

const USAGE_DASHED = `<Divider variant="dashed" />`;

const USAGE_VERTICAL = `<Divider orientation="vertical" />`;

const USAGE_INSET = `<Divider inset />`;

export function DividerDocsPage() {
  return (
    <DocScreen>
      <DocTitle>Divider</DocTitle>
      <DocSubtitle>{DIVIDER_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview preview">
        <DocParagraph>
          Use the section stories in the sidebar (Variants, Orientation,
          Thickness, Inset, Real Usage) to browse configurations. Divider is
          decorative and token-driven — see Usage examples below.
        </DocParagraph>
        <DocPreviewCard label="Default (solid, horizontal)">
          <Divider />
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...DIVIDER_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage examples">
        <DocHeading level={3}>Basic</DocHeading>
        <DocCodeBlock code={USAGE_BASIC} />
        <DocHeading level={3}>Dashed</DocHeading>
        <DocCodeBlock code={USAGE_DASHED} />
        <DocHeading level={3}>Vertical</DocHeading>
        <DocCodeBlock code={USAGE_VERTICAL} />
        <DocHeading level={3}>Inset</DocHeading>
        <DocCodeBlock code={USAGE_INSET} />
        <DocHeading level={3}>Live previews</DocHeading>
        <DocGalleryGrid>
          <DocGalleryItem label="Solid">
            <Divider />
          </DocGalleryItem>
          <DocGalleryItem label="Dashed">
            <Divider variant="dashed" />
          </DocGalleryItem>
          <DocGalleryItem label="Vertical">
            <Divider orientation="vertical" />
          </DocGalleryItem>
          <DocGalleryItem label="Inset">
            <Divider inset />
          </DocGalleryItem>
        </DocGalleryGrid>
      </DocSection>

      <DocSection title="Component gallery">
        <DocParagraph>
          Examples grouped by variant, orientation, thickness, inset, and
          real-world card/action layouts.
        </DocParagraph>
        <DividerShowcase />
      </DocSection>
    </DocScreen>
  );
}
