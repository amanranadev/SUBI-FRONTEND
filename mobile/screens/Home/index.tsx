import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "@/components/AppHeader";
import { DocumentUploadZone } from "@/components/DocumentUploadZone";
import { ProcessingFailedModal } from "@/components/ProcessingFailedModal";
import { ProcessingProgressModal } from "@/components/ProcessingProgressModal";
import { TransactionResultDrawer } from "@/components/TransactionResultDrawer";
import { TransactionSuccessModal } from "@/components/TransactionSuccessModal";
import { useHomeUploadFlow } from "@/hooks/useHomeUploadFlow";

import { homeScreenStyles as styles } from "./styles";

export default function Home() {
  const uploadFlow = useHomeUploadFlow();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <AppHeader containerStyle={styles.header} testID="home-header" />
        <View style={styles.uploadZone}>
          {uploadFlow.showProgressModal ? (
            <View style={styles.uploadPanel}>
              <ProcessingProgressModal
                testID="home-upload-progress"
                description={uploadFlow.progressDescription}
                progress={uploadFlow.overallProgress}
                steps={uploadFlow.processingSteps}
                activeStep={uploadFlow.activeStep}
                onStopProcessing={uploadFlow.handleStopProcessing}
              />
            </View>
          ) : uploadFlow.showFailedModal ? (
            <View style={styles.uploadPanel}>
              <ProcessingFailedModal
                testID="home-upload-failed"
                errorMessage={uploadFlow.failureMessage}
                onRetry={uploadFlow.handleRetry}
                onCancel={uploadFlow.handleCancelFailure}
              />
            </View>
          ) : (
            <DocumentUploadZone
              testID="home-document-upload-zone"
              onFileSelected={uploadFlow.handleFileSelected}
            />
          )}
        </View>
      </View>

      {uploadFlow.transactionDrawerKey ? (
        <TransactionResultDrawer
          key={uploadFlow.transactionDrawerKey}
          testID="home-transaction-result-drawer"
          open={uploadFlow.showTransactionDrawer}
          initialState={uploadFlow.transactionResultState}
          onClose={uploadFlow.handleDrawerClose}
          onDiscardDraft={uploadFlow.handleDrawerClose}
          onSaveTransaction={uploadFlow.handleSaveTransaction}
        />
      ) : null}

      <TransactionSuccessModal
        visible={uploadFlow.showSuccessModal}
        transactionId={uploadFlow.createdTransactionId}
        onCreateAnother={uploadFlow.handleCreateAnother}
        onClose={uploadFlow.handleSuccessModalClose}
      />
    </SafeAreaView>
  );
}
