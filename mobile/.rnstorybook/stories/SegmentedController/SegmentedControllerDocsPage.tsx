import React, { useState } from "react";

import { SegmentedController } from "../../../components/SegmentedController";
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
  SEGMENTED_CONTROLLER_DOCS_DESCRIPTION,
  SEGMENTED_CONTROLLER_PROP_DEFINITIONS,
} from "./segmentedControllerArgTypes";
import { SegmentedControllerShowcase } from "./SegmentedControllerShowcase";

const TASK_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
] as const;

const USAGE_BASIC = `<SegmentedController
  options={[
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
  ]}
  value={status}
  onValueChange={setStatus}
/>`;

const USAGE_FULL_WIDTH = `<SegmentedController
  options={taskOptions}
  value={status}
  onValueChange={setStatus}
  fullWidth
/>`;

const USAGE_DISABLED = `<SegmentedController
  options={[
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed", disabled: true },
  ]}
  value="active"
/>`;

export function SegmentedControllerDocsPage() {
  const [status, setStatus] = useState("active");

  return (
    <DocScreen>
      <DocTitle>SegmentedController</DocTitle>
      <DocSubtitle>{SEGMENTED_CONTROLLER_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview preview">
        <DocParagraph>
          Use this when a screen needs to switch between closely related views
          without leaving the current context.
        </DocParagraph>
        <DocPreviewCard label="Figma tasks">
          <SegmentedController
            options={TASK_OPTIONS}
            value={status}
            onValueChange={setStatus}
          />
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...SEGMENTED_CONTROLLER_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage examples">
        <DocCodeBlock code={USAGE_BASIC} />
        <DocCodeBlock code={USAGE_FULL_WIDTH} />
        <DocCodeBlock code={USAGE_DISABLED} />
        <DocGalleryGrid>
          <DocGalleryItem label="Default">
            <SegmentedController options={TASK_OPTIONS} value="active" />
          </DocGalleryItem>
          <DocGalleryItem label="Full width">
            <SegmentedController
              options={TASK_OPTIONS}
              value="completed"
              fullWidth
            />
          </DocGalleryItem>
          <DocGalleryItem label="Disabled item">
            <SegmentedController
              options={[
                { value: "active", label: "Active" },
                { value: "completed", label: "Completed", disabled: true },
              ]}
              value="active"
            />
          </DocGalleryItem>
        </DocGalleryGrid>
      </DocSection>

      <DocSection title="Component gallery">
        <DocParagraph>
          Examples grouped by Figma reference, segment count, sizes, width, and
          states.
        </DocParagraph>
        <SegmentedControllerShowcase />
      </DocSection>
    </DocScreen>
  );
}
