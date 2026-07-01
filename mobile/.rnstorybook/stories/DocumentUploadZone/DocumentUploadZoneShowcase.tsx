import React from "react";

import {
  DOCUMENT_UPLOAD_ERROR_MESSAGES,
  DOCUMENT_UPLOAD_MAX_FILE_SIZE_MB,
  DocumentUploadZone,
} from "../../../components/DocumentUploadZone";

import {
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";
import { DocumentUploadZoneErrorPreview } from "./DocumentUploadZoneErrorPreview";
import { DocumentUploadZoneStoryFrame } from "./DocumentUploadZoneStoryFrame";

function UploadZoneStory({ children }: { children: React.ReactNode }) {
  return <DocumentUploadZoneStoryFrame>{children}</DocumentUploadZoneStoryFrame>;
}

export type DocumentUploadZoneShowcaseSection =
  | "all"
  | "states"
  | "errors";

export interface DocumentUploadZoneShowcaseProps {
  section?: DocumentUploadZoneShowcaseSection;
}

export function DocumentUploadZoneShowcase({
  section = "all",
}: DocumentUploadZoneShowcaseProps) {
  const show = (key: Exclude<DocumentUploadZoneShowcaseSection, "all">) =>
    section === "all" || section === key;

  return (
    <GalleryScreen>
      {show("states") ? (
        <GallerySection
          title="1. States"
          description="Default, disabled, and loading appearances."
        >
          <GalleryItem label="Default" wide>
            <UploadZoneStory>
              <DocumentUploadZone onFileSelected={() => {}} />
            </UploadZoneStory>
          </GalleryItem>
          <GalleryItem label="Disabled" wide>
            <UploadZoneStory>
              <DocumentUploadZone disabled onFileSelected={() => {}} />
            </UploadZoneStory>
          </GalleryItem>
          <GalleryItem label="Loading" wide>
            <UploadZoneStory>
              <DocumentUploadZone loading onFileSelected={() => {}} />
            </UploadZoneStory>
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("errors") ? (
        <GallerySection
          title="2. Error states"
          description="Validation feedback for unsupported type and oversized files."
        >
          <GalleryItem label="Unsupported file" wide>
            <UploadZoneStory>
              <DocumentUploadZoneErrorPreview
                errorMessage={DOCUMENT_UPLOAD_ERROR_MESSAGES.unsupportedFileType}
              />
            </UploadZoneStory>
          </GalleryItem>
          <GalleryItem label="File too large" wide>
            <UploadZoneStory>
              <DocumentUploadZoneErrorPreview
                errorMessage={DOCUMENT_UPLOAD_ERROR_MESSAGES.fileTooLarge(
                  DOCUMENT_UPLOAD_MAX_FILE_SIZE_MB,
                )}
              />
            </UploadZoneStory>
          </GalleryItem>
          <GalleryItem label="Generic error" wide>
            <UploadZoneStory>
              <DocumentUploadZoneErrorPreview
                errorMessage={DOCUMENT_UPLOAD_ERROR_MESSAGES.generic}
              />
            </UploadZoneStory>
          </GalleryItem>
        </GallerySection>
      ) : null}

    </GalleryScreen>
  );
}
