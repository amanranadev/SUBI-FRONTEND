import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import {
  DOCUMENT_UPLOAD_ERROR_MESSAGES,
  DOCUMENT_UPLOAD_MAX_FILE_SIZE_MB,
  DocumentUploadZone,
} from "@/components/DocumentUploadZone";
import { buttonTokens } from "@/components/PrimaryButton";

import {
  DOCUMENT_UPLOAD_ZONE_DOCS_DESCRIPTION,
  documentUploadZoneArgTypes,
} from "./documentUploadZoneArgTypes";
import { DocumentUploadZoneDocsPage } from "./DocumentUploadZoneDocsPage";
import { DocumentUploadZoneErrorPreview } from "./DocumentUploadZoneErrorPreview";
import { DocumentUploadZoneStoryFrame } from "./DocumentUploadZoneStoryFrame";

const { colors: tokenColors } = buttonTokens;

const meta = {
  title: "Design System/DocumentUploadZone",
  component: DocumentUploadZone,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: DOCUMENT_UPLOAD_ZONE_DOCS_DESCRIPTION,
      },
    },
    notes: `
# DocumentUploadZone

${DOCUMENT_UPLOAD_ZONE_DOCS_DESCRIPTION}

## Stories

- **Documentation** — Full docs + grouped gallery.
- **Default**, **Disabled**, **Loading**, **UnsupportedFile**, **FileTooLarge** — State galleries.
    `.trim(),
  },
  decorators: [
    (Story, context) => {
      if (context.parameters.docsPage || context.parameters.galleryPage) {
        return (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
          >
            <Story />
          </ScrollView>
        );
      }
      return (
        <View style={styles.decorator}>
          <DocumentUploadZoneStoryFrame>
            <Story />
          </DocumentUploadZoneStoryFrame>
        </View>
      );
    },
  ],
  args: {
    title: "Drop a document here",
    description: "I'll process it and start a new file for you!",
    disabled: false,
    loading: false,
    maxFileSizeMB: DOCUMENT_UPLOAD_MAX_FILE_SIZE_MB,
  },
  argTypes: documentUploadZoneArgTypes,
} satisfies Meta<typeof DocumentUploadZone>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full component documentation with grouped gallery layout.",
    controls: { disable: true },
  },
  render: () => <DocumentUploadZoneDocsPage />,
};

export const Default: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => (
    <DocumentUploadZoneStoryFrame>
      <DocumentUploadZone onFileSelected={() => {}} />
    </DocumentUploadZoneStoryFrame>
  ),
};

export const Disabled: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => (
    <DocumentUploadZoneStoryFrame>
      <DocumentUploadZone disabled onFileSelected={() => {}} />
    </DocumentUploadZoneStoryFrame>
  ),
};

export const Loading: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => (
    <DocumentUploadZoneStoryFrame>
      <DocumentUploadZone loading onFileSelected={() => {}} />
    </DocumentUploadZoneStoryFrame>
  ),
};

export const UnsupportedFile: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => (
    <DocumentUploadZoneStoryFrame>
      <DocumentUploadZoneErrorPreview
        errorMessage={DOCUMENT_UPLOAD_ERROR_MESSAGES.unsupportedFileType}
      />
    </DocumentUploadZoneStoryFrame>
  ),
};

export const FileTooLarge: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => (
    <DocumentUploadZoneStoryFrame>
      <DocumentUploadZoneErrorPreview
        errorMessage={DOCUMENT_UPLOAD_ERROR_MESSAGES.fileTooLarge(
          DOCUMENT_UPLOAD_MAX_FILE_SIZE_MB,
        )}
      />
    </DocumentUploadZoneStoryFrame>
  ),
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: tokenColors.surfaceBackground,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  decorator: {
    flex: 1,
    padding: 16,
    backgroundColor: tokenColors.surfaceBackground,
    alignItems: "stretch",
    justifyContent: "flex-start",
    width: "100%",
  },
});
