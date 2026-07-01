import React, { useCallback, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";
import { router } from "expo-router";

import { Icon } from "@/assets/icon-system";
import ErrorContainer from "@/components/ErrorContainer/ErrorContainer";
import { FormFieldInput } from "@/components/FormFieldInput";
import PDFViewerModal, {
  PDFType,
} from "@/components/PDFViewerModal/PDFViewerModal";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/hooks/useAuth";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

import { resolveLoginScrollContentStyle } from "./loginScreen.tokens";
import { loginScreenStyles as styles } from "./LoginScreen.styles";
import { LoginScreenHeader } from "./LoginScreenHeader";

type Inputs = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const {
    login,
    loginWithGoogle,
    isLoginSuccess,
    isLoginPending,
    isGoogleLoginPending,
    isLoginError,
    loginError,
    googleLoginError,
  } = useAuth();

  useAuthRedirect({ isLoginSuccess, isLoginError });

  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [activePdfType, setActivePdfType] = useState<PDFType>("terms");

  const openPdfViewer = useCallback((type: PDFType) => {
    setActivePdfType(type);
    setPdfModalVisible(true);
  }, []);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleGoogleLogin = async () => {
    try {
      loginWithGoogle();
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    try {
      console.log("🔐 Attempting login with credentials:", {
        email: data.email,
        passwordLength: data.password.length,
      });
      login({
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <LoginScreenHeader />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={resolveLoginScrollContentStyle()}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
            <View style={styles.mainContent}>
            <View style={styles.greetingCircle}>
              <Text style={styles.greetingEmoji}>👋</Text>
            </View>

            <View style={styles.welcomeHeadingRow}>
              <Text style={styles.welcomeHeadingPrimary}>Welcome back to</Text>
              <Text style={styles.welcomeHeadingBrand}>Subi</Text>
            </View>

            <View style={styles.formSection}>
              <View style={styles.formFields}>
                <Controller
                  name="email"
                  control={control}
                  rules={{ required: "Email is required" }}
                  render={({ field: { onChange, onBlur, value }, fieldState }) => (
                    <FormFieldInput
                      testID="email-input"
                      label="Email Address"
                      required
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      errorText={fieldState.error?.message}
                      placeholder="name@email.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      inputSize="lg"
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  rules={{ required: "Password is required" }}
                  render={({ field: { onChange, onBlur, value }, fieldState }) => (
                    <FormFieldInput
                      testID="password-input"
                      label="Password"
                      required
                      isPassword
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      errorText={fieldState.error?.message}
                      placeholder="••••••••"
                      autoCapitalize="none"
                      autoCorrect={false}
                      inputSize="lg"
                    />
                  )}
                />
              </View>

              {(loginError || googleLoginError) && (
                <ErrorContainer
                  title={loginError ? "Login Failed" : "Google Sign-In Failed"}
                  message={
                    (loginError?.message ?? googleLoginError?.message) ??
                    "Something went wrong."
                  }
                  status={loginError?.status}
                  code={loginError?.code}
                />
              )}

              <View style={styles.actions}>
                <PrimaryButton
                  testID="login-button"
                  fullWidth
                  size="lg"
                  disabled={isLoginPending}
                  onPress={handleSubmit(onSubmit)}
                >
                  {isLoginPending ? "Logging in..." : "Log in"}
                </PrimaryButton>

                <PrimaryButton
                  fullWidth
                  size="lg"
                  variant="secondary"
                  leftIcon={<Icon name="google" size={20} accessible={false} />}
                  disabled={isGoogleLoginPending || isLoginPending}
                  onPress={handleGoogleLogin}
                >
                  Continue with Google
                </PrimaryButton>
              </View>
            </View>

            <View style={styles.supportingSection}>
              <View style={styles.supportingRow}>
                <Text style={styles.supportingMuted}>New to</Text>
                <Text style={styles.supportingBrand}>SUBI?</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.replace("/register")}
                >
                  <Text style={styles.supportingPrimary}>Create an account</Text>
                </Pressable>
              </View>

              <View style={styles.supportingRow}>
                <Text style={styles.supportingMuted}>Forgot your password?</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.replace("/forgotPassword")}
                >
                  <Text style={styles.supportingPrimary}>Reset it</Text>
                </Pressable>
              </View>
            </View>
            </View>

            <View style={styles.termsSection}>
              <Text style={styles.termsIntro}>
                By signing in, you agree to our
              </Text>
              <View style={styles.termsLinksRow}>
                <Pressable
                  accessibilityRole="link"
                  testID="terms-of-use-link"
                  onPress={() => openPdfViewer("terms")}
                >
                  <Text style={styles.termsLink}>Terms of Use</Text>
                </Pressable>
                <Text style={styles.termsMuted}>and</Text>
                <Pressable
                  accessibilityRole="link"
                  testID="privacy-policy-link"
                  onPress={() => openPdfViewer("privacy")}
                >
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Pressable>
              </View>
            </View>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <PDFViewerModal
          visible={pdfModalVisible}
          pdfType={activePdfType}
          onClose={() => setPdfModalVisible(false)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
