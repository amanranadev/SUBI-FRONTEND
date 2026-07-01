import React from "react";

import {
  DATE_BADGE_SIZES,
  DATE_BADGE_VARIANTS,
  DateBadge,
  dateBadgeTokens,
} from "../../../components/DateBadge";

import {
  DocBulletList,
  DocCallout,
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
  DocTokenGroup,
} from "../../components/DocsPrimitives";
import { DateBadgeShowcase } from "./DateBadgeShowcase";
import {
  DATE_BADGE_DOCS_DESCRIPTION,
  DATE_BADGE_PROP_DEFINITIONS,
} from "./dateBadgeArgTypes";

const { colors: c, typography: t, radius: r, spacing: s, sizes } =
  dateBadgeTokens;

const SAMPLE_DATE = new Date("2026-04-10");

const USAGE_BASIC = `<DateBadge
  date={new Date('2026-04-10')}
/>`;

const USAGE_INTERACTIVE = `<DateBadge
  date={date}
  onPress={handlePress}
/>`;

const USAGE_SELECTED = `<DateBadge
  date={date}
  variant="selected"
/>`;

export function DateBadgeDocsPage() {
  return (
    <DocScreen>
      <DocTitle>DateBadge</DocTitle>
      <DocSubtitle>{DATE_BADGE_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview preview">
        <DocParagraph>
          Use the section stories in the sidebar (Variants, Sizes, Today,
          Disabled, Interactive, Calendar Strip) to browse states. Month and
          day labels are derived from a single Date prop — see Usage examples
          below.
        </DocParagraph>
        <DocPreviewCard label="Default (md)">
          <DateBadge date={SAMPLE_DATE} />
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...DATE_BADGE_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage examples">
        <DocHeading level={3}>Basic</DocHeading>
        <DocCodeBlock code={USAGE_BASIC} />
        <DocHeading level={3}>Interactive</DocHeading>
        <DocCodeBlock code={USAGE_INTERACTIVE} />
        <DocHeading level={3}>Selected</DocHeading>
        <DocCodeBlock code={USAGE_SELECTED} />
        <DocHeading level={3}>Live previews</DocHeading>
        <DocGalleryGrid>
          <DocGalleryItem label="Default">
            <DateBadge date={SAMPLE_DATE} />
          </DocGalleryItem>
          <DocGalleryItem label="Selected">
            <DateBadge date={SAMPLE_DATE} variant="selected" />
          </DocGalleryItem>
          <DocGalleryItem label="Muted">
            <DateBadge date={SAMPLE_DATE} variant="muted" />
          </DocGalleryItem>
        </DocGalleryGrid>
      </DocSection>

      <DocSection title="Component gallery">
        <DocParagraph>
          Examples grouped by purpose — variants, sizes, today highlight,
          disabled, interactive, and calendar strip layouts.
        </DocParagraph>
        <DateBadgeShowcase />
      </DocSection>
    </DocScreen>
  );
}
