import React from "react";
import { Text, View } from "react-native";

import { Icon } from "@/assets/icon-system";
import {
  documentUploadZoneColors,
  documentUploadZoneSizing,
  documentUploadZoneStyles,
} from "@/components/DocumentUploadZone/DocumentUploadZone.styles";

const DEFAULT_TITLE = "Drop a document here";
const DEFAULT_DESCRIPTION =
  "I'll process it and start a new file for you!";

interface DocumentUploadZoneErrorPreviewProps {
  errorMessage: string;
  title?: string;
  description?: string;
}

/** Story-only preview for error states without triggering the document picker. */
export function DocumentUploadZoneErrorPreview({
  errorMessage,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
}: DocumentUploadZoneErrorPreviewProps) {
  return (
    <View style={documentUploadZoneStyles.pressable}>
      <View style={documentUploadZoneStyles.zone}>
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
          <Text
            style={documentUploadZoneStyles.error}
            accessibilityRole="alert"
          >
            {errorMessage}
          </Text>
        </View>
      </View>
    </View>
  );
}
