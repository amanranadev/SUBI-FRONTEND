import React from "react";

import { ProcessingFailedModal } from "../../../components/ProcessingFailedModal";
import {
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

import {
  DEFAULT_ERROR_MESSAGE,
  DEFAULT_FAILED_TITLE,
  LONG_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  PERMISSION_ERROR_MESSAGE,
} from "./processingFailedModalConstants";
import { ProcessingFailedModalStoryFrame } from "./ProcessingFailedModalStoryFrame";

const noopRetry = () => undefined;
const noopCancel = () => undefined;

export type ProcessingFailedModalShowcaseSection =
  | "default"
  | "long-error"
  | "network-error"
  | "permission-error"
  | "loading-retry";

interface ProcessingFailedModalShowcaseProps {
  section: ProcessingFailedModalShowcaseSection;
  onRetry?: () => void;
  onCancel?: () => void;
}

export function ProcessingFailedModalShowcase({
  section,
  onRetry = noopRetry,
  onCancel = noopCancel,
}: ProcessingFailedModalShowcaseProps) {
  switch (section) {
    case "default":
      return (
        <GalleryScreen>
          <GallerySection
            title="Default failure"
            description="Default title and error message from the Figma spec."
          >
            <GalleryItem label="Default" wide>
              <ProcessingFailedModalStoryFrame>
                <ProcessingFailedModal
                  title={DEFAULT_FAILED_TITLE}
                  errorMessage={DEFAULT_ERROR_MESSAGE}
                  onRetry={onRetry}
                  onCancel={onCancel}
                />
              </ProcessingFailedModalStoryFrame>
            </GalleryItem>
          </GallerySection>
        </GalleryScreen>
      );
    case "long-error":
      return (
        <GalleryScreen>
          <GallerySection
            title="Long error message"
            description="Demonstrates centered text wrapping for longer errors."
          >
            <GalleryItem label="Long error" wide>
              <ProcessingFailedModalStoryFrame>
                <ProcessingFailedModal
                  title={DEFAULT_FAILED_TITLE}
                  errorMessage={LONG_ERROR_MESSAGE}
                  onRetry={onRetry}
                  onCancel={onCancel}
                />
              </ProcessingFailedModalStoryFrame>
            </GalleryItem>
          </GallerySection>
        </GalleryScreen>
      );
    case "network-error":
      return (
        <GalleryScreen>
          <GallerySection
            title="Network error"
            description="Example connectivity failure message."
          >
            <GalleryItem label="Network error" wide>
              <ProcessingFailedModalStoryFrame>
                <ProcessingFailedModal
                  title={DEFAULT_FAILED_TITLE}
                  errorMessage={NETWORK_ERROR_MESSAGE}
                  onRetry={onRetry}
                  onCancel={onCancel}
                />
              </ProcessingFailedModalStoryFrame>
            </GalleryItem>
          </GallerySection>
        </GalleryScreen>
      );
    case "permission-error":
      return (
        <GalleryScreen>
          <GallerySection
            title="Permission error"
            description="Example authorization failure message."
          >
            <GalleryItem label="Permission error" wide>
              <ProcessingFailedModalStoryFrame>
                <ProcessingFailedModal
                  title={DEFAULT_FAILED_TITLE}
                  errorMessage={PERMISSION_ERROR_MESSAGE}
                  onRetry={onRetry}
                  onCancel={onCancel}
                />
              </ProcessingFailedModalStoryFrame>
            </GalleryItem>
          </GallerySection>
        </GalleryScreen>
      );
    case "loading-retry":
      return (
        <GalleryScreen>
          <GallerySection
            title="Loading retry"
            description="Try Again button in loading state."
          >
            <GalleryItem label="Loading retry" wide>
              <ProcessingFailedModalStoryFrame>
                <ProcessingFailedModal
                  title={DEFAULT_FAILED_TITLE}
                  errorMessage={DEFAULT_ERROR_MESSAGE}
                  onRetry={onRetry}
                  onCancel={onCancel}
                  loading
                />
              </ProcessingFailedModalStoryFrame>
            </GalleryItem>
          </GallerySection>
        </GalleryScreen>
      );
  }
}
