import React, { memo, useCallback, useMemo } from "react";
import { Text, View } from "react-native";

import { Icon } from "@/assets/icon-system";
import { PrimaryButton } from "@/components/PrimaryButton";

import type { ProcessingFailedModalProps } from "./ProcessingFailedModal.types";
import {
  processingFailedModalStyles,
  processingFailedModalTokens,
} from "./ProcessingFailedModal.styles";

const DEFAULT_TITLE = "Processing Failed";
const RETRY_BUTTON_LABEL = "Try Again";
const CANCEL_BUTTON_LABEL = "Cancel";

const { colors, sizing } = processingFailedModalTokens;

function buildAccessibilityLabel(title: string, errorMessage: string): string {
  return `${title}. Error: ${errorMessage}`;
}

export const ProcessingFailedModal = memo(function ProcessingFailedModal({
  title = DEFAULT_TITLE,
  errorMessage,
  onRetry,
  onCancel,
  loading = false,
  testID,
}: ProcessingFailedModalProps) {
  const errorIcon = useMemo(
    () => (
      <Icon
        name="error-circle"
        size={sizing.errorIcon}
        color={colors.danger}
        accessible={false}
      />
    ),
    [],
  );

  const retryIcon = useMemo(
    () => (
      <Icon
        name="retry"
        size={sizing.buttonIcon}
        color={colors.textOnBrand}
        accessible={false}
      />
    ),
    [],
  );

  const cancelIcon = useMemo(
    () => (
      <Icon
        name="close"
        size={sizing.buttonIcon}
        color={colors.textPrimary}
        accessible={false}
      />
    ),
    [],
  );

  const handleRetry = useCallback(() => {
    onRetry?.();
  }, [onRetry]);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  const accessibilityLabel = useMemo(
    () => buildAccessibilityLabel(title, errorMessage),
    [title, errorMessage],
  );

  const showButtonRow = Boolean(onRetry ?? onCancel);

  return (
    <View
      style={processingFailedModalStyles.container}
      testID={testID}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={processingFailedModalStyles.iconContainer}>{errorIcon}</View>

      <View style={processingFailedModalStyles.textBlock}>
        <Text style={processingFailedModalStyles.title} accessible={false}>
          {title}
        </Text>
        <Text
          style={processingFailedModalStyles.errorMessage}
          accessible={false}
        >
          {errorMessage}
        </Text>
      </View>

      {showButtonRow ? (
        <View style={processingFailedModalStyles.buttonRow}>
          {onRetry ? (
            <PrimaryButton
              variant="primary"
              size="md"
              shape="pill"
              elevated
              leftIcon={retryIcon}
              onPress={handleRetry}
              loading={loading}
              disabled={loading}
              accessibilityLabel={RETRY_BUTTON_LABEL}
              testID={testID ? `${testID}-retry` : undefined}
              style={processingFailedModalStyles.actionButton}
            >
              {RETRY_BUTTON_LABEL}
            </PrimaryButton>
          ) : null}
          {onCancel ? (
            <PrimaryButton
              variant="outline"
              size="md"
              shape="pill"
              leftIcon={cancelIcon}
              onPress={handleCancel}
              disabled={loading}
              accessibilityLabel={CANCEL_BUTTON_LABEL}
              testID={testID ? `${testID}-cancel` : undefined}
              style={processingFailedModalStyles.actionButton}
            >
              {CANCEL_BUTTON_LABEL}
            </PrimaryButton>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});
