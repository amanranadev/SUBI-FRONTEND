import ErrorContainer from "@/components/ErrorContainer/ErrorContainer";
import FormTextInput from "@/components/FormTextInput/FormTextInput";
import { colors } from "@/constants/colors";
import { forgotPassword } from "@/services/authService";
import { router } from "expo-router";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ForgotPasswordFormData = {
  email: string;
};

const ForgotPasswordScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<{
    message: string;
    status?: number;
    code?: string;
  } | null>(null);

  const { control, handleSubmit } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    setError(null);
    setIsLoading(true);
    try {
      await forgotPassword(data.email);
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Forgot password failed:", err);
      setError({
        message: err?.message || "Failed to send reset instructions. Please try again.",
        status: err?.status,
        code: err?.code,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📧</Text>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.subtitle}>
                We've sent password reset instructions to your email address.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace("/")}
            >
              <Text style={styles.backButtonText}>Back to login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔑</Text>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you instructions to
                reset your password.
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email address</Text>
                <View style={styles.inputWrapper}>
                  <FormTextInput
                    name="email"
                    control={control}
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    }}
                    placeholder="name@email.com"
                    placeholderTextColor={colors.gray[600]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.input}
                  />
                </View>
              </View>
            </View>

            {error && (
              <ErrorContainer
                title="Reset Failed"
                message={error.message}
                status={error.status}
                code={error.code}
              />
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                <Text style={styles.resetButtonText}>
                  {isLoading ? "Sending..." : "Send Reset Instructions"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={() => router.replace("/")}
              >
                <Text style={styles.backToLoginButtonText}>Back to login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[200], // #FCFAFA
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 23,
    paddingVertical: 20,
  },
  content: {
    alignItems: "center",
    gap: 24,
    width: "100%",
    maxWidth: 335,
    alignSelf: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 48,
    lineHeight: 48,
  },
  textContainer: {
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  title: {
    fontFamily: "Inter",
    fontSize: 24,
    fontWeight: "600",
    color: colors.gray[800], // #1F2937
    textAlign: "center",
    letterSpacing: 0.12,
  },
  subtitle: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[600], // #6B7280
    textAlign: "center",
    lineHeight: 24,
    letterSpacing: 0.08,
  },
  formContainer: {
    width: "100%",
    gap: 16,
  },
  inputContainer: {
    gap: 12,
  },
  label: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[800], // #2B2927
    letterSpacing: 0.08,
  },
  inputWrapper: {
    width: "100%",
  },
  input: {
    backgroundColor: colors.gray[400], // #F7F0EE
    borderWidth: 1,
    borderColor: colors.gray[300], // #E5E7EB
    borderRadius: 8,
    paddingVertical: 22,
    paddingHorizontal: 20,
    fontSize: 15,
    fontFamily: "Inter",
    fontWeight: "500",
    color: colors.gray[800],
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  resetButton: {
    backgroundColor: "#1F2937", // Dark gray from Figma
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  resetButtonText: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
    letterSpacing: 0.075,
  },
  backToLoginButton: {
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  backToLoginButtonText: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "600",
    color: colors.gray[600], // #6B7280
    letterSpacing: 0.075,
    textDecorationLine: "underline",
  },
  backButton: {
    backgroundColor: "#1F2937", // Dark gray from Figma
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  backButtonText: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
    letterSpacing: 0.075,
  },
});

export default ForgotPasswordScreen;
