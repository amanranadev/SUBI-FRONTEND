import * as DocumentPicker from "expo-document-picker";
import React, { memo, useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

import { Icon } from "@/assets/icon-system";

import {
  DOCUMENT_UPLOAD_ALLOWED_MIME_TYPE,
  DOCUMENT_UPLOAD_ERROR_MESSAGES,
  DOCUMENT_UPLOAD_MAX_FILE_SIZE_MB,
} from "./constants";
import type { DocumentUploadZoneProps } from "./DocumentUploadZone.types";
import {
  documentUploadZoneColors,
  documentUploadZoneSizing,
  documentUploadZoneStyles,
} from "./DocumentUploadZone.styles";
import { validateDocumentFile } from "./validateDocumentFile";

const DEFAULT_TITLE = "Drop a document here";
const DEFAULT_DESCRIPTION =
  "I'll process it and start a new file for you!";

export const DocumentUploadZone = memo(function DocumentUploadZone({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  disabled = false,
  loading = false,
  maxFileSizeMB = DOCUMENT_UPLOAD_MAX_FILE_SIZE_MB,
  onFileSelected,
  testID,
}: DocumentUploadZoneProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const maxFileSizeBytes = useMemo(
    () => maxFileSizeMB * 1024 * 1024,
    [maxFileSizeMB],
  );

  const isInteractionDisabled = disabled || loading;

  const accessibilityLabel = useMemo(() => {
    const parts = [title, description];
    if (errorMessage) {
      parts.push(errorMessage);
    }
    if (loading) {
      parts.push("Loading");
    }
    return parts.join(". ");
  }, [title, description, errorMessage, loading]);

  const handlePress = useCallback(async () => {
    if (isInteractionDisabled) {
      return;
    }

    setErrorMessage(null);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: DOCUMENT_UPLOAD_ALLOWED_MIME_TYPE,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const file = result.assets[0];
      const validation = validateDocumentFile(
        file,
        maxFileSizeBytes,
        maxFileSizeMB,
      );

      if (!validation.valid) {
        setErrorMessage(
          validation.errorMessage ?? DOCUMENT_UPLOAD_ERROR_MESSAGES.generic,
        );
        return;
      }

      onFileSelected?.(file);
    } catch {
      setErrorMessage(DOCUMENT_UPLOAD_ERROR_MESSAGES.generic);
    }
  }, [
    isInteractionDisabled,
    maxFileSizeBytes,
    maxFileSizeMB,
    onFileSelected,
  ]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={isInteractionDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isInteractionDisabled, busy: loading }}
      testID={testID}
      style={documentUploadZoneStyles.pressable}
    >
      <View
        style={[
          documentUploadZoneStyles.zone,
          isInteractionDisabled ? documentUploadZoneStyles.zoneDisabled : null,
        ]}
      >
        <View style={documentUploadZoneStyles.iconCircle}>
          <Icon
            name="document-upload"
            size={documentUploadZoneSizing.iconSize}
            color={documentUploadZoneColors.iconMuted}
            accessible={false}
          />
        </View>

        <View style={documentUploadZoneStyles.textBlock}>
          <Text style={documentUploadZoneStyles.title}>{title}</Text>
          <Text style={documentUploadZoneStyles.description}>
            {description}
          </Text>
          {errorMessage ? (
            <Text
              style={documentUploadZoneStyles.error}
              accessibilityRole="alert"
            >
              {errorMessage}
            </Text>
          ) : null}
        </View>

        {loading ? (
          <View style={documentUploadZoneStyles.loadingOverlay}>
            <ActivityIndicator
              color={documentUploadZoneColors.textPrimary}
              size="large"
            />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
});
