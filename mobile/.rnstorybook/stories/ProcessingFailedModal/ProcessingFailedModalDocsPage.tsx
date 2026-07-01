import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  ProcessingFailedModal,
  processingFailedModalTokens,
} from "../../../components/ProcessingFailedModal";
import { buttonTokens } from "../../../components/PrimaryButton";

import {
  DocCodeBlock,
  DocHeading,
  DocParagraph,
  DocPreviewCard,
  DocPropsTable,
  DocScreen,
  DocSection,
  DocSubtitle,
  DocTitle,
} from "../../components/DocsPrimitives";
import { ProcessingFailedModalShowcase } from "./ProcessingFailedModalShowcase";
import { ProcessingFailedModalStoryFrame } from "./ProcessingFailedModalStoryFrame";
import {
  PROCESSING_FAILED_MODAL_DOCS_DESCRIPTION,
  PROCESSING_FAILED_MODAL_PROP_DEFINITIONS,
} from "./processingFailedModalArgTypes";
import {
  DEFAULT_ERROR_MESSAGE,
  DEFAULT_FAILED_TITLE,
  LONG_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
} from "./processingFailedModalConstants";

const { colors, typography, spacing, sizing, radius } =
  processingFailedModalTokens;
const { colors: sharedColors, typography: sharedTypography } = buttonTokens;

const USAGE_EXAMPLE = `<ProcessingFailedModal
  errorMessage={error}
  onRetry={handleRetry}
  onCancel={handleCancel}
/>`;

const ERROR_PRESETS = [
  { label: "Default", value: DEFAULT_ERROR_MESSAGE },
  { label: "Network", value: NETWORK_ERROR_MESSAGE },
  { label: "Long", value: LONG_ERROR_MESSAGE },
] as const;

export function ProcessingFailedModalDocsPage() {
  const [playgroundErrorMessage, setPlaygroundErrorMessage] = useState(
    DEFAULT_ERROR_MESSAGE,
  );
  const [playgroundLoading, setPlaygroundLoading] = useState(false);

  return (
    <DocScreen>
      <DocTitle>ProcessingFailedModal</DocTitle>
      <DocSubtitle>{PROCESSING_FAILED_MODAL_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview">
        <DocParagraph>
          ProcessingFailedModal is the mobile document-processing failure
          experience. It composes existing design-system primitives and does
          not own retry logic, navigation, or error classification.
        </DocParagraph>
        <DocPreviewCard label="Default failure">
          <ProcessingFailedModalStoryFrame>
            <ProcessingFailedModal
              errorMessage={DEFAULT_ERROR_MESSAGE}
              onRetry={() => undefined}
              onCancel={() => undefined}
            />
          </ProcessingFailedModalStoryFrame>
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Playground">
        <DocParagraph>
          Adjust title, error message, and loading state to preview composed
          behavior.
        </DocParagraph>
        <View style={playgroundStyles.controlRow}>
          <Text style={playgroundStyles.controlHeading}>errorMessage</Text>
          <View style={playgroundStyles.controls}>
            {ERROR_PRESETS.map((preset) => {
              const selected = playgroundErrorMessage === preset.value;
              return (
                <Pressable
                  key={preset.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Use ${preset.label} error message`}
                  onPress={() => setPlaygroundErrorMessage(preset.value)}
                  style={[
                    playgroundStyles.control,
                    selected && playgroundStyles.controlSelected,
                  ]}
                >
                  <Text
                    style={[
                      playgroundStyles.controlLabel,
                      selected && playgroundStyles.controlLabelSelected,
                    ]}
                  >
                    {preset.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={playgroundStyles.controlRow}>
          <Text style={playgroundStyles.controlHeading}>loading</Text>
          <View style={playgroundStyles.controls}>
            {[false, true].map((value) => {
              const selected = playgroundLoading === value;
              return (
                <Pressable
                  key={String(value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Set loading to ${value}`}
                  onPress={() => setPlaygroundLoading(value)}
                  style={[
                    playgroundStyles.control,
                    selected && playgroundStyles.controlSelected,
                  ]}
                >
                  <Text
                    style={[
                      playgroundStyles.controlLabel,
                      selected && playgroundStyles.controlLabelSelected,
                    ]}
                  >
                    {value ? "true" : "false"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <DocPreviewCard label={DEFAULT_FAILED_TITLE}>
          <ProcessingFailedModalStoryFrame>
            <ProcessingFailedModal
              title={DEFAULT_FAILED_TITLE}
              errorMessage={playgroundErrorMessage}
              onRetry={() => undefined}
              onCancel={() => undefined}
              loading={playgroundLoading}
            />
          </ProcessingFailedModalStoryFrame>
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...PROCESSING_FAILED_MODAL_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage example">
        <DocCodeBlock code={USAGE_EXAMPLE} />
      </DocSection>

      <DocSection title="Composition">
        <DocParagraph>
          This component reuses existing primitives — do not recreate them
          inline:
        </DocParagraph>
        <DocCodeBlock
          code={`Icon — error-circle, retry, and close button icons
PrimaryButton — primary Try Again and outline Cancel actions`}
        />
      </DocSection>

      <DocSection title="Gallery">
        <ProcessingFailedModalShowcase section="default" />
        <ProcessingFailedModalShowcase section="long-error" />
        <ProcessingFailedModalShowcase section="network-error" />
        <ProcessingFailedModalShowcase section="permission-error" />
        <ProcessingFailedModalShowcase section="loading-retry" />
      </DocSection>
    </DocScreen>
  );
}

const playgroundStyles = StyleSheet.create({
  controlRow: {
    gap: processingFailedModalTokens.spacing.textGap,
    marginBottom: processingFailedModalTokens.spacing.sectionGap,
  },
  controlHeading: {
    ...sharedTypography.bodySmall,
    color: sharedColors.textMuted,
    fontWeight: "600",
  },
  controls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: processingFailedModalTokens.spacing.textGap,
  },
  control: {
    minWidth: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: sharedColors.borderField,
    backgroundColor: sharedColors.surfaceCard,
    alignItems: "center",
  },
  controlSelected: {
    borderColor: sharedColors.brandOrange,
    backgroundColor: sharedColors.surfaceMuted,
  },
  controlLabel: {
    ...sharedTypography.bodySmall,
    color: sharedColors.textPrimary,
  },
  controlLabelSelected: {
    color: sharedColors.brandOrange,
    fontWeight: "600",
  },
});
