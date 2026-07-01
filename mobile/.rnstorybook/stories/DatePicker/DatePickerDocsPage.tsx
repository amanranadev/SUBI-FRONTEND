import React from "react";

import { DatePicker, datePickerTokens } from "../../../components/DatePicker";

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
import { DatePickerShowcase } from "./DatePickerShowcase";
import {
  DATE_PICKER_DOCS_DESCRIPTION,
  DATE_PICKER_PROP_DEFINITIONS,
} from "./datePickerArgTypes";

const { colors: c, typography: t, radius: r, spacing: s } = datePickerTokens;

const USAGE_BASIC = `const [date, setDate] = useState<Date>();

<DatePicker
  value={date}
  onChange={setDate}
/>`;

const USAGE_WITH_CONSTRAINTS = `<DatePicker
  value={date}
  onChange={setDate}
  minDate={new Date("2026-01-01")}
  maxDate={new Date("2026-12-31")}
  placeholder="Select Date"
/>`;

export function DatePickerDocsPage() {
  return (
    <DocScreen>
      <DocTitle>DatePicker</DocTitle>
      <DocSubtitle>{DATE_PICKER_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview preview">
        <DocParagraph>
          Use the section stories in the sidebar (Default States, Constraints,
          Formats, Disabled, Interactive) to browse states. The chip opens a
          calendar modal on press — see Usage examples below.
        </DocParagraph>
        <DocPreviewCard label="Default chip">
          <DatePicker />
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...DATE_PICKER_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage examples">
        <DocHeading level={3}>Basic</DocHeading>
        <DocCodeBlock code={USAGE_BASIC} />
        <DocHeading level={3}>With date constraints</DocHeading>
        <DocCodeBlock code={USAGE_WITH_CONSTRAINTS} />
        <DocHeading level={3}>Live previews</DocHeading>
        <DocGalleryGrid>
          <DocGalleryItem label="Default">
            <DatePicker />
          </DocGalleryItem>
          <DocGalleryItem label="Selected">
            <DatePicker value={new Date("2026-04-09")} />
          </DocGalleryItem>
          <DocGalleryItem label="Disabled">
            <DatePicker disabled value={new Date("2026-04-09")} />
          </DocGalleryItem>
        </DocGalleryGrid>
      </DocSection>

      <DocSection title="Component gallery">
        <DocParagraph>
          Examples grouped by purpose — default states, date constraints,
          format strings, disabled, and interactive controlled usage.
        </DocParagraph>
        <DatePickerShowcase />
      </DocSection>
    </DocScreen>
  );
}
