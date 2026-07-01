import { DocumentUploader } from "@/components/shared/DocumentUploader/DocumentUploader";
import { ExtractedData } from "@/services/documentService";
import { ApiError } from "@/types/auth";
import React from "react";
import { StyleSheet, View } from "react-native";

interface DocumentUploadStepProps {
  onUploadComplete?: (fileId: string) => void;
  onExtractionComplete?: (data: ExtractedData) => void;
  onError?: (error: ApiError) => void;
  onSkip?: () => void;
  onProcessingStateChange?: (isProcessing: boolean) => void;
  onCancel?: () => void;
}

export const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
  onUploadComplete,
  onExtractionComplete,
  onError,
  onSkip,
  onProcessingStateChange,
  onCancel,
}) => {
  return (
    <View style={styles.container}>
      <DocumentUploader
        onUploadComplete={onUploadComplete}
        onExtractionComplete={onExtractionComplete}
        onError={onError}
        onSkip={onSkip}
        allowSkip={true}
        onProcessingStateChange={onProcessingStateChange}
        onCancel={onCancel}
        transactionCategory="LISTING"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
