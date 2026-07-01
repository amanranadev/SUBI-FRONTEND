import React from "react";

import {
  DOCUMENT_UPLOAD_ALLOWED_MIME_TYPE,
  DOCUMENT_UPLOAD_MAX_FILE_SIZE_MB,
  DocumentUploadZone,
  documentUploadZoneTokens,
} from "../../../components/DocumentUploadZone";

import {
  DocBulletList,
  DocCallout,
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
  DocTokenGroup,
} from "../../components/DocsPrimitives";
import { DocumentUploadZoneShowcase } from "./DocumentUploadZoneShowcase";
import { DocumentUploadZoneStoryFrame } from "./DocumentUploadZoneStoryFrame";
import {
  DOCUMENT_UPLOAD_ZONE_DOCS_DESCRIPTION,
  DOCUMENT_UPLOAD_ZONE_PROP_DEFINITIONS,
} from "./documentUploadZoneArgTypes";

const {
  colors: c,
  typography: t,
  radius: r,
  spacing: s,
  sizing: sz,
  border: b,
} = documentUploadZoneTokens;

const USAGE_BASIC = `<DocumentUploadZone
  onFileSelected={handleFile}
/>`;

export function DocumentUploadZoneDocsPage() {
  return (
    <DocScreen>
      <DocTitle>DocumentUploadZone</DocTitle>
      <DocSubtitle>{DOCUMENT_UPLOAD_ZONE_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview preview">
        <DocParagraph>
          Tap the zone to open the system document picker. Only PDF files within
          the configured size limit are accepted. Upload logic stays outside this
          component — consume onFileSelected in your screen.
        </DocParagraph>
        <DocPreviewCard label="Default">
          <DocumentUploadZoneStoryFrame>
            <DocumentUploadZone onFileSelected={() => {}} />
          </DocumentUploadZoneStoryFrame>
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...DOCUMENT_UPLOAD_ZONE_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage examples">
        <DocCodeBlock code={USAGE_BASIC} />
        <DocGalleryGrid>
          <DocGalleryItem label="Default">
            <DocumentUploadZoneStoryFrame>
              <DocumentUploadZone onFileSelected={() => {}} />
            </DocumentUploadZoneStoryFrame>
          </DocGalleryItem>
          <DocGalleryItem label="Disabled">
            <DocumentUploadZoneStoryFrame>
              <DocumentUploadZone disabled onFileSelected={() => {}} />
            </DocumentUploadZoneStoryFrame>
          </DocGalleryItem>
          <DocGalleryItem label="Loading">
            <DocumentUploadZoneStoryFrame>
              <DocumentUploadZone loading onFileSelected={() => {}} />
            </DocumentUploadZoneStoryFrame>
          </DocGalleryItem>
        </DocGalleryGrid>
      </DocSection>

      <DocSection title="File restrictions">
        <DocBulletList
          items={[
            `Supported type: PDF (${DOCUMENT_UPLOAD_ALLOWED_MIME_TYPE})`,
            `Default maximum size: ${DOCUMENT_UPLOAD_MAX_FILE_SIZE_MB} MB`,
            "Configurable via maxFileSizeMB prop and DOCUMENT_UPLOAD_MAX_FILE_SIZE_MB constant",
            "Non-PDF and oversized files show inline error messages",
          ]}
        />
      </DocSection>

      <DocSection title="Component gallery">
        <DocumentUploadZoneShowcase />
      </DocSection>
    </DocScreen>
  );
}
