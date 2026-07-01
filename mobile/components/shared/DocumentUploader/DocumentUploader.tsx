import { colors } from "@/constants/colors";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";
import type { ExtractedData } from "@/types/document";
import { ApiError } from "@/types/auth";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { memo, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface DocumentUploaderProps {
  onUploadComplete?: (fileId: string) => void;
  onExtractionComplete?: (data: ExtractedData) => void;
  onError?: (error: ApiError) => void;
  onSkip?: () => void;
  allowSkip?: boolean;
  onProcessingStateChange?: (isProcessing: boolean) => void;
  onCancel?: () => void;
  transactionCategory?: "PSA" | "LISTING";
}

/**
 * DocumentUploader component for uploading and analyzing documents
 */
export const DocumentUploader: React.FC<DocumentUploaderProps> = memo(({
  onUploadComplete,
  onExtractionComplete,
  onError,
  onSkip,
  allowSkip = true,
  onProcessingStateChange,
  onCancel,
  transactionCategory,
}) => {
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    type: string;
    size?: number;
  } | null>(null);

  const {
    processDocument,
    retryAnalysis,
    cancel: cancelProcessing,
    reset: resetProcessing,
    fileId,
    filename,
    extractedData,
    overallProgress,
    progressMessage,
    analysisStatus,
    isUploading,
    isAnalyzing,
    isComplete,
    isFailed,
    error: processingError,
  } = useDocumentProcessing({
    transactionCategory,
    onUploadComplete,
    onExtractionComplete,
    onError,
    onProcessingStateChange,
    onTimeout: () => {
      Alert.alert(
        "Analysis Timeout",
        "Document analysis is taking longer than expected. You can continue with manual entry or try again later.",
        [
          {
            text: "Continue Manually",
            onPress: () => onSkip?.(),
          },
          {
            text: "Try Again",
            onPress: () => {
              void retryAnalysis();
            },
          },
        ],
      );
    },
    maxDuration: 5 * 60 * 1000,
  });

  const analysisError = processingError;

  // Handle file selection
  const handleSelectFile = useCallback(async () => {
    try {
      // Use expo-document-picker for PDFs, Word docs, text files, etc.
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
          "text/rtf",
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const file = {
          uri: asset.uri,
          name: asset.name || `document_${Date.now()}.pdf`,
          type: asset.mimeType || "application/pdf",
          size: asset.size,
        };
        setSelectedFile(file);
      }
    } catch (error: any) {
      console.error("❌ Error selecting file:", error);
      onError?.({
        message: error.message || "Failed to select file",
        status: undefined,
        code: error.code,
      });
    }
  }, [onError]);

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      await processDocument(selectedFile);
    } catch (error) {
      console.error("❌ Upload error:", error);
    }
  }, [selectedFile, processDocument]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      if (isUploading || isAnalyzing) {
        cancelProcessing();
      }
      setSelectedFile(null);
      resetProcessing();
    }
  }, [isUploading, isAnalyzing, cancelProcessing, resetProcessing, onCancel]);

  // Show errors with user-friendly messages
  useEffect(() => {
    const error = processingError;
    if (error) {
      let title = "Error";
      let message = error.message || (isFailed ? "Analysis failed" : "Upload failed");
      let buttons: Array<{ text: string; style?: "default" | "cancel" | "destructive"; onPress?: () => void }> = [{ text: "OK" }];

      // Provide user-friendly messages based on error type
      if (error.code === "CONFIGURATION_ERROR") {
        title = "Configuration Error";
        message = "Upload failed due to a configuration issue. Please contact support if the problem persists.";
      } else if (error.code === "ERR_NETWORK" || error.code === "NETWORK_ERROR") {
        title = "Network Error";
        message = "Unable to connect to the server. Please check your internet connection and try again.";
        buttons = [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: () => selectedFile && handleUpload() },
        ];
      } else if (error.code === "ECONNABORTED" || error.code === "TIMEOUT") {
        title = "Upload Timeout";
        message = "The upload took too long to complete. Please try again with a smaller file or check your connection.";
        buttons = [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: () => selectedFile && handleUpload() },
        ];
      } else if (error.code === "ERR_CANCELED" || error.code === "ABORTED") {
        // Don't show alert for user-initiated cancellations
        return;
      } else if (error.status === 413) {
        title = "File Too Large";
        message = "The file you selected is too large. Please choose a smaller file (maximum 500MB).";
      } else if (error.status === 415) {
        title = "Unsupported File Type";
        message = "The file type is not supported. Please upload a PDF, DOC, or TXT file.";
      } else if (error.status === 401) {
        title = "Authentication Required";
        message = "Your session has expired. Please log in again.";
      } else if (error.status && error.status >= 500) {
        title = "Server Error";
        message = "The server encountered an error. Please try again later or contact support if the problem persists.";
        buttons = [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: () => selectedFile && handleUpload() },
        ];
      }

      Alert.alert(title, message, buttons);

      // Call onError callback if provided
      if (onError) {
        onError(error);
      }
    }
  }, [processingError, analysisError, selectedFile, handleUpload, onError, isFailed]);

  return (
    <View style={styles.container}>
      {!selectedFile && !filename && (
        <View style={styles.uploadArea}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleSelectFile}
            accessibilityLabel="Select document to upload"
          >
            <Ionicons name="cloud-upload-outline" size={48} color={colors.gray[600]} />
            <Text style={styles.uploadButtonText}>
              Tap to select document
            </Text>
            <Text style={styles.uploadHint}>
              Supports PDF, DOCX, TXT files up to 500MB
            </Text>
          </TouchableOpacity>

          {allowSkip && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
              accessibilityLabel="Skip document upload"
            >
              <Text style={styles.skipButtonText}>
                Manually enter information
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {selectedFile && !filename && !isUploading && (
        <View style={styles.fileSelected}>
          <View style={styles.fileInfo}>
            <Ionicons name="document-text" size={24} color={colors.gray[600]} />
            <View style={styles.fileDetails}>
              <Text style={styles.fileName} numberOfLines={1}>
                {selectedFile.name}
              </Text>
              {selectedFile.size && (
                <Text style={styles.fileSize}>
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </Text>
              )}
            </View>
          </View>
          <View style={styles.fileActions}>
            <TouchableOpacity
              style={styles.uploadActionButton}
              onPress={handleUpload}
              accessibilityLabel="Upload document"
            >
              <Text style={styles.uploadActionButtonText}>Upload</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelActionButton}
              onPress={() => setSelectedFile(null)}
              accessibilityLabel="Cancel selection"
            >
              <Ionicons name="close" size={20} color={colors.gray[600]} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {(isUploading || isAnalyzing) && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="large" color={colors.gray[900]} />
          <Text style={styles.progressText}>{progressMessage}</Text>
          <Text style={styles.progressPercent}>{Math.round(overallProgress)}%</Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressBarFill, { width: `${overallProgress}%` }]}
            />
          </View>
          {isAnalyzing && analysisStatus?.progress !== undefined && (
            <Text
              style={styles.statusText}
              accessibilityLabel={`Analysis status: ${analysisStatus.status} at ${analysisStatus.progress} percent`}
            >
              Status: {analysisStatus.status} ({Math.min(100, analysisStatus.progress)}%)
            </Text>
          )}
          {isAnalyzing && analysisStatus?.message && (
            <Text
              style={styles.statusMessageText}
              accessibilityLabel={analysisStatus.message}
            >
              {analysisStatus.message}
            </Text>
          )}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            accessibilityLabel={isUploading ? "Cancel upload" : "Cancel analysis"}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {isComplete && extractedData && (
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={48} color={colors.accentGreen} />
          <Text style={styles.successText}>
            Document analyzed successfully!
          </Text>
          <Text style={styles.successSubtext}>
            {extractedData.extractedFields && extractedData.extractedFields.length > 0
              ? `Found ${extractedData.extractedFields.length} fields. Preparing form...`
              : "Form fields have been auto-filled with extracted information."}
          </Text>
          {extractedData.warnings && extractedData.warnings.length > 0 && (
            <View style={styles.warningsContainer}>
              <Text style={styles.warningsTitle}>Warnings:</Text>
              {extractedData.warnings.map((warning, index) => (
                <Text key={index} style={styles.warningText}>
                  • {warning}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {isFailed && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.red[500]} />
          <Text style={styles.errorText}>Analysis failed</Text>
          <Text style={styles.errorSubtext}>
            {analysisStatus?.error || "Unable to analyze document. Please try manual entry."}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              if (filename || fileId) {
                void retryAnalysis();
              }
            }}
            accessibilityLabel="Retry analysis"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          {allowSkip && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
              accessibilityLabel="Skip and enter manually"
            >
              <Text style={styles.skipButtonText}>
                Enter information manually
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
});

DocumentUploader.displayName = "DocumentUploader";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  uploadArea: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    borderWidth: 2,
    borderColor: colors.gray[300],
    borderStyle: "dashed",
    borderRadius: 12,
    backgroundColor: colors.gray[100],
  },
  uploadButton: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
    textAlign: "center",
  },
  uploadHint: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: "center",
    marginTop: 4,
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontSize: 14,
    color: colors.gray[600],
    textDecorationLine: "underline",
  },
  fileSelected: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  fileDetails: {
    flex: 1,
    gap: 4,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  fileSize: {
    fontSize: 12,
    color: colors.gray[600],
  },
  fileActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  uploadActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.gray[900],
    borderRadius: 6,
  },
  uploadActionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.white,
  },
  cancelActionButton: {
    padding: 4,
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
    textAlign: "center",
  },
  progressPercent: {
    fontSize: 14,
    color: colors.gray[600],
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.gray[900],
    borderRadius: 2,
  },
  statusText: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: "center",
  },
  statusMessageText: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: "center",
    marginTop: 4,
    fontStyle: "italic",
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    fontSize: 14,
    color: colors.gray[600],
    textDecorationLine: "underline",
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
    backgroundColor: colors.accentGreenLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.green[200],
  },
  successText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[900],
    textAlign: "center",
  },
  successSubtext: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: "center",
  },
  warningsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.yellow[100],
    borderRadius: 8,
    width: "100%",
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[900],
    marginBottom: 8,
  },
  warningText: {
    fontSize: 12,
    color: colors.gray[700],
    marginBottom: 4,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
    backgroundColor: colors.red[100],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.red[500],
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.red[800],
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.gray[900],
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.white,
  },
});
