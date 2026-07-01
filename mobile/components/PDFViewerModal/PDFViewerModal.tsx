import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

// Import PDF assets
const PDF_ASSETS = {
  terms: require("@/assets/documents/terms-of-service.pdf"),
  privacy: require("@/assets/documents/privacy-policy.pdf"),
};

export type PDFType = "terms" | "privacy";

interface PDFViewerModalProps {
  visible: boolean;
  pdfType: PDFType;
  onClose: () => void;
}

const PDF_TITLES: Record<PDFType, string> = {
  terms: "Terms of Service",
  privacy: "Privacy Policy",
};

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  visible,
  pdfType,
  onClose,
}) => {
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (visible) {
      loadPDF();
    } else {
      setPdfUri(null);
      setIsLoading(true);
      setError(null);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [visible, pdfType]);

  const loadPDF = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const asset = PDF_ASSETS[pdfType];
      const [loadedAsset] = await Asset.loadAsync(asset);

      // Check if still mounted
      if (!isMountedRef.current) return;

      // Get the local URI
      const sourceUri = loadedAsset.localUri || loadedAsset.uri;

      // Copy to document directory for reliable access
      const fileName = pdfType === "terms" ? "terms-of-service.pdf" : "privacy-policy.pdf";
      const destUri = `${FileSystem.documentDirectory}${fileName}`;

      // Always copy to ensure we have a fresh copy
      await FileSystem.copyAsync({
        from: sourceUri,
        to: destUri,
      });

      // Check if still mounted before updating state
      if (!isMountedRef.current) return;

      setPdfUri(destUri);
    } catch (err) {
      console.error("Error loading PDF:", err);
      if (isMountedRef.current) {
        setError("Failed to load document. Please try again.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[400]} />
          <Text style={styles.loadingText}>Loading document...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.gray[400]} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPDF}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!pdfUri) {
      return null;
    }

    if (Platform.OS === "ios") {
      // iOS WebView can display PDFs natively
      return (
        <WebView
          source={{ uri: pdfUri }}
          style={styles.webView}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color={colors.primary[400]} />
            </View>
          )}
          onError={(e) => {
            console.error("WebView error:", e.nativeEvent);
            setError("Failed to display document.");
          }}
          originWhitelist={["*"]}
          allowFileAccess
          allowFileAccessFromFileURLs
        />
      );
    }

    // For Android, use Google Docs viewer with a hosted URL or base64 approach
    // Since we have local files, we'll read as base64 and display in an iframe
    return (
      <AndroidPDFViewer uri={pdfUri} onError={() => setError("Failed to display document.")} />
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>{PDF_TITLES[pdfType]}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.gray[600]} />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>{renderContent()}</View>
      </SafeAreaView>
    </Modal>
  );
};

// Android PDF viewer component using base64
const AndroidPDFViewer: React.FC<{ uri: string; onError: () => void }> = ({ uri, onError }) => {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    loadAndConvert();

    return () => {
      isMountedRef.current = false;
    };
  }, [uri]);

  const loadAndConvert = async () => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!isMountedRef.current) return;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { background: #f5f5f5; }
              #container { width: 100%; }
              canvas { display: block; margin: 10px auto; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
            </style>
          </head>
          <body>
            <div id="container"></div>
            <script>
              const pdfData = atob('${base64}');
              const pdfjsLib = window['pdfjs-dist/build/pdf'];
              pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

              const loadingTask = pdfjsLib.getDocument({data: pdfData});
              loadingTask.promise.then(function(pdf) {
                const container = document.getElementById('container');
                for (let i = 1; i <= pdf.numPages; i++) {
                  pdf.getPage(i).then(function(page) {
                    const scale = 1.5;
                    const viewport = page.getViewport({scale: scale});
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    container.appendChild(canvas);
                    page.render({canvasContext: context, viewport: viewport});
                  });
                }
              });
            </script>
          </body>
        </html>
      `;
      setHtmlContent(html);
    } catch (err) {
      console.error("Error converting PDF:", err);
      if (isMountedRef.current) {
        onError();
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  if (loading || !htmlContent) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[400]} />
      </View>
    );
  }

  return (
    <WebView
      source={{ html: htmlContent }}
      style={styles.webView}
      originWhitelist={["*"]}
      javaScriptEnabled
      domStorageEnabled
      onError={onError}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[800],
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.gray[600],
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.gray[600],
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.gray[800],
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
});

export default PDFViewerModal;
