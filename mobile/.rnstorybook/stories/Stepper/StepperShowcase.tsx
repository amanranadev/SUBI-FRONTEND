import React from "react";

import { Stepper } from "../../../components/Stepper";
import {
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

import { LONG_LABEL_STEPS, WORKFLOW_STEPS } from "./stepperConstants";

export type StepperShowcaseSection =
  | "upload-active"
  | "text-extraction-active"
  | "ai-analysis-active"
  | "all-reached"
  | "long-labels";

interface StepperShowcaseProps {
  section: StepperShowcaseSection;
}

export function StepperShowcase({ section }: StepperShowcaseProps) {
  switch (section) {
    case "upload-active":
      return (
        <GalleryScreen>
          <GallerySection
            title="Upload active"
            description="activeStep={0} — Upload is the current step; later steps are upcoming."
          >
            <GalleryItem label="Upload active">
              <Stepper activeStep={0} steps={WORKFLOW_STEPS} />
            </GalleryItem>
          </GallerySection>
        </GalleryScreen>
      );
    case "text-extraction-active":
      return (
        <GalleryScreen>
          <GallerySection
            title="Text Extraction active"
            description="activeStep={1} — Upload is completed; Text Extraction is current."
          >
            <GalleryItem label="Text Extraction active">
              <Stepper activeStep={1} steps={WORKFLOW_STEPS} />
            </GalleryItem>
          </GallerySection>
        </GalleryScreen>
      );
    case "ai-analysis-active":
      return (
        <GalleryScreen>
          <GallerySection
            title="AI Analysis active"
            description="activeStep={2} — Upload and Text Extraction are completed; AI Analysis is current."
          >
            <GalleryItem label="AI Analysis active">
              <Stepper activeStep={2} steps={WORKFLOW_STEPS} />
            </GalleryItem>
          </GallerySection>
        </GalleryScreen>
      );
    case "all-reached":
      return (
        <GalleryScreen>
          <GallerySection
            title="All steps reached"
            description="activeStep={3} — Every step is completed when activeStep is past the last index."
          >
            <GalleryItem label="All completed">
              <Stepper activeStep={3} steps={WORKFLOW_STEPS} />
            </GalleryItem>
          </GallerySection>
        </GalleryScreen>
      );
    case "long-labels":
      return (
        <GalleryScreen>
          <GallerySection
            title="Long labels"
            description="Demonstrates wrapping and spacing with longer step labels."
          >
            <GalleryItem label="Long labels (Text Extraction active)">
              <Stepper activeStep={1} steps={LONG_LABEL_STEPS} />
            </GalleryItem>
          </GallerySection>
        </GalleryScreen>
      );
  }
}
