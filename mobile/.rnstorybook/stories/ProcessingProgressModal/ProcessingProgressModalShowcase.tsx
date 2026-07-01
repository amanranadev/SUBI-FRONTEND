import React from "react";

import { ProcessingProgressModal } from "../../../components/ProcessingProgressModal";
import {
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

import {
  DEFAULT_PROCESSING_DESCRIPTION,
  DEFAULT_PROCESSING_TITLE,
  LONG_PROCESSING_DESCRIPTION,
  PROCESSING_WORKFLOW_STEPS,
} from "./processingProgressModalConstants";

export type ProcessingProgressModalShowcaseSection =
  | "initial"
  | "extraction"
  | "ai-analysis"
  | "complete"
  | "long-description";

const noopStopProcessing = () => undefined;

interface ProcessingProgressModalShowcaseProps {
  section: ProcessingProgressModalShowcaseSection;
  onStopProcessing?: () => void;
}

export function ProcessingProgressModalShowcase({
  section,
  onStopProcessing = noopStopProcessing,
}: ProcessingProgressModalShowcaseProps) {
  switch (section) {
    case "initial":
      return (
        <GalleryScreen>
          <GallerySection
            title="Initial processing"
            description="0% progress with Upload as the active step."
          >
            <GalleryItem label="0% — Upload active">
              <ProcessingProgressModal
                title={DEFAULT_PROCESSING_TITLE}
                description={DEFAULT_PROCESSING_DESCRIPTION}
                progress={0}
                activeStep={0}
                steps={PROCESSING_WORKFLOW_STEPS}
                onStopProcessing={onStopProcessing}
              />
            </GalleryItem>
          </GallerySection>
        </GalleryScreen>
      );
    case "extraction":
      return (
        <GalleryScreen>
          <GallerySection
            title="Extraction in progress"
            description="50% progress with Text Extraction as the active step."
          >
            <GalleryItem label="50% — Text Extraction active">
              <ProcessingProgressModal
                title={DEFAULT_PROCESSING_TITLE}
                description={DEFAULT_PROCESSING_DESCRIPTION}
                progress={50}
                activeStep={1}
                steps={PROCESSING_WORKFLOW_STEPS}
                onStopProcessing={onStopProcessing}
              />
            </GalleryItem>
          </GallerySection>
        </GalleryScreen>
      );
    case "ai-analysis":
      return (
        <GalleryScreen>
          <GallerySection
            title="AI analysis in progress"
            description="90% progress with AI Analysis as the active step."
          >
            <GalleryItem label="90% — AI Analysis active">
              <ProcessingProgressModal
                title={DEFAULT_PROCESSING_TITLE}
                description={DEFAULT_PROCESSING_DESCRIPTION}
                progress={90}
                activeStep={2}
                steps={PROCESSING_WORKFLOW_STEPS}
                onStopProcessing={onStopProcessing}
              />
            </GalleryItem>
          </GallerySection>
        </GalleryScreen>
      );
    case "complete":
      return (
        <GalleryScreen>
          <GallerySection
            title="Complete"
            description="100% progress with all workflow steps completed."
          >
            <GalleryItem label="100% — final state">
              <ProcessingProgressModal
                title={DEFAULT_PROCESSING_TITLE}
                description="Analysis complete. Preparing results..."
                progress={100}
                activeStep={3}
                steps={PROCESSING_WORKFLOW_STEPS}
                onStopProcessing={onStopProcessing}
              />
            </GalleryItem>
          </GallerySection>
        </GalleryScreen>
      );
    case "long-description":
      return (
        <GalleryScreen>
          <GallerySection
            title="Long description"
            description="Demonstrates centered text wrapping with longer copy."
          >
            <GalleryItem label="Long description">
              <ProcessingProgressModal
                title={DEFAULT_PROCESSING_TITLE}
                description={LONG_PROCESSING_DESCRIPTION}
                progress={35}
                activeStep={1}
                steps={PROCESSING_WORKFLOW_STEPS}
                onStopProcessing={onStopProcessing}
              />
            </GalleryItem>
          </GallerySection>
        </GalleryScreen>
      );
  }
}
