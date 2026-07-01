import GoogleIcon from "@/assets/icons/GoogleIcon";
import Button from "@/components/Button/Button";
import PDFViewerModal, { PDFType } from "@/components/PDFViewerModal/PDFViewerModal";
import { colors } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RegistrationScreen = () => {
  const { loginWithGoogle, isLoginSuccess, isLoginError } = useAuth();

  // Handle redirect after successful login
  useAuthRedirect({ isLoginSuccess, isLoginError });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [aiDisclaimerAccepted, setAiDisclaimerAccepted] = useState(false);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [activePdfType, setActivePdfType] = useState<PDFType>("terms");

  const canProceed = termsAccepted && aiDisclaimerAccepted;

  const openPdfViewer = (type: PDFType) => {
    setActivePdfType(type);
    setPdfModalVisible(true);
  };

  const handleGoogleLogin = () => {
    if (canProceed) {
      loginWithGoogle();
    }
  };

  const handleEmailContinue = () => {
    if (canProceed) {
      router.push("/registerForm");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Smarter transactions, less busywork</Text>

        {/* Legal Agreements */}
        <View style={styles.legalContainer}>
          {/* Terms and Privacy Policy Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setTermsAccepted(!termsAccepted)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && (
                <Ionicons name="checkmark" size={14} color={colors.white} />
              )}
            </View>
            <Text style={styles.checkboxText}>
              By checking this box, I acknowledge that I have read, understand, and agree to the{" "}
              <Text
                style={styles.linkText}
                onPress={() => openPdfViewer("terms")}
              >
                Terms of Use
              </Text>
              {" "}and{" "}
              <Text
                style={styles.linkText}
                onPress={() => openPdfViewer("privacy")}
              >
                Privacy Policy
              </Text>
              {" "}of Marian Company d/b/a Subi, Inc., and understand that Subi does not provide legal, financial, or real estate advice.
            </Text>
          </TouchableOpacity>

          {/* AI Disclaimer Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAiDisclaimerAccepted(!aiDisclaimerAccepted)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, aiDisclaimerAccepted && styles.checkboxChecked]}>
              {aiDisclaimerAccepted && (
                <Ionicons name="checkmark" size={14} color={colors.white} />
              )}
            </View>
            <Text style={styles.checkboxText}>
              I understand that Subi uses artificial intelligence to assist with tasks and that I am responsible for reviewing and verifying all outputs before use or reliance.
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            icon={<GoogleIcon />}
            text="Continue with Google"
            onPress={handleGoogleLogin}
            disabled={!canProceed}
          />
          <Button
            text="Continue with email"
            onPress={handleEmailContinue}
            disabled={!canProceed}
          />
        </View>
        <View style={styles.footerContainer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/")}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <PDFViewerModal
        visible={pdfModalVisible}
        pdfType={activePdfType}
        onClose={() => setPdfModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "600",
    textAlign: "left",
    marginBottom: 8,
    color: colors.gray[800],
  },
  legalContainer: {
    gap: 16,
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray[400],
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.gray[800],
    borderColor: colors.gray[800],
  },
  checkboxText: {
    flex: 1,
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "400",
    color: colors.gray[600],
    lineHeight: 18,
  },
  linkText: {
    color: colors.brickOrange,
    textDecorationLine: "underline",
  },
  buttonContainer: {
    gap: 5,
  },
  footerContainer: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: "center",
  },
  footerLink: {
    textDecorationLine: "underline",
    color: colors.gray[600],
    textAlign: "center",
  },
});
export default RegistrationScreen;
