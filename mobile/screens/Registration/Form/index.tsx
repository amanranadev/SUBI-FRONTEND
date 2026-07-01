import ErrorContainer from "@/components/ErrorContainer/ErrorContainer";
import FormTextInput from "@/components/FormTextInput/FormTextInput";
import { colors } from "@/constants/colors";
import { register } from "@/services/authService";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RegistrationFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  lastName: string;
  nickname: string;
  picture?: string;
};

const RegistrationFormScreen = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<{
    message: string;
    errors?: string[];
    status?: number;
    code?: string;
  } | null>(null);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      lastName: "",
      nickname: "",
      picture: "",
    },
  });

  const password = watch("password");

  const pickImage = async () => {
    console.log("pick Image");
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log(status);
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your photo library to select a profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Request permission when user tries to access camera
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your camera to take a profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      "Select Profile Picture",
      "Choose how you'd like to add your profile picture",
      [
        { text: "Camera", onPress: takePhoto },
        { text: "Photo Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const onSubmit: SubmitHandler<RegistrationFormData> = async (data) => {
    // Clear any previous error
    setRegistrationError(null);

    // Validate picture URL if provided
    if (data.picture && !/^https?:\/\/.+/.test(data.picture)) {
      setRegistrationError({ message: "Please enter a valid URL starting with http:// or https://" });
      return;
    }

    setIsLoading(true);
    try {
      const registrationData = {
        email: data.email,
        password: data.password,
        name: data.name,
        lastName: data.lastName,
        nickname: data.nickname || undefined,
        picture: selectedImage || data.picture || undefined,
        invitation_id: "optional_invitation_id",
      };

      console.log(registrationData.picture);
      await register(registrationData);
      router.replace("/home");
    } catch (error: any) {
      console.error("Registration failed:", error);

      // Handle API validation errors
      // The API interceptor transforms errors to ApiError format with errors array
      if (error?.errors && Array.isArray(error.errors)) {
        setRegistrationError({
          message: error.errors.join("\n"),
          errors: error.errors,
          status: error.status,
          code: error.code,
        });
      } else if (error?.message) {
        setRegistrationError({
          message: error.message,
          status: error.status,
          code: error.code,
        });
      } else {
        setRegistrationError({ message: "An unexpected error occurred. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      // Validate Step 1 (Email, Password, Confirm Password)
      const email = watch("email");
      const password = watch("password");
      const confirmPassword = watch("confirmPassword");

      // Check email
      if (!email) {
        Alert.alert("Validation Error", "Email is required");
        return;
      }
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
        Alert.alert("Validation Error", "Email is invalid");
        return;
      }

      // Check password
      if (!password) {
        Alert.alert("Validation Error", "Password is required");
        return;
      }
      if (password.length < 6) {
        Alert.alert(
          "Validation Error",
          "Password is too short (minimum is 6 characters)"
        );
        return;
      }

      // Check confirm password
      if (!confirmPassword) {
        Alert.alert("Validation Error", "Please confirm your password");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Validation Error", "Passwords do not match");
        return;
      }
    } else if (currentStep === 2) {
      // Validate Step 2 (Name, Last Name, Nickname)
      const name = watch("name");
      const lastName = watch("lastName");
      const nickname = watch("nickname");

      // Check first name
      if (!name) {
        Alert.alert("Validation Error", "First name is required");
        return;
      }
      if (name.length < 2) {
        Alert.alert(
          "Validation Error",
          "First name must be at least 2 characters"
        );
        return;
      }

      // Check last name
      if (!lastName) {
        Alert.alert("Validation Error", "Last name is required");
        return;
      }
      if (lastName.length < 2) {
        Alert.alert(
          "Validation Error",
          "Last name must be at least 2 characters"
        );
        return;
      }

      // Check nickname (optional, but validate format if provided)
      if (nickname) {
        if (nickname.length < 2) {
          Alert.alert(
            "Validation Error",
            "Nickname must be at least 2 characters"
          );
          return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
          Alert.alert(
            "Validation Error",
            "Nickname can only contain letters, numbers, and underscores"
          );
          return;
        }
      }
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipPicture = () => {
    handleSubmit(onSubmit)();
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View
          key={step}
          style={[
            styles.stepDot,
            currentStep >= step ? styles.stepDotActive : styles.stepDotInactive,
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>✉️</Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Let's start with your email and password.
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
                  message: "Email is invalid",
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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <FormTextInput
              name="password"
              control={control}
              rules={{
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password is too short (minimum is 6 characters)",
                },
              }}
              placeholder="••••••••"
              placeholderTextColor={colors.gray[600]}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              icon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.gray[600]}
                  />
                </TouchableOpacity>
              }
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm password</Text>
          <View style={styles.inputWrapper}>
            <FormTextInput
              name="confirmPassword"
              control={control}
              rules={{
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              }}
              placeholder="••••••••"
              placeholderTextColor={colors.gray[600]}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              icon={
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color={colors.gray[600]}
                  />
                </TouchableOpacity>
              }
            />
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>👤</Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Personal Information</Text>
        <Text style={styles.subtitle}>Tell us a bit about yourself.</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>First name</Text>
          <View style={styles.inputWrapper}>
            <FormTextInput
              name="name"
              control={control}
              rules={{
                required: "First name is required",
                minLength: {
                  value: 2,
                  message: "First name must be at least 2 characters",
                },
              }}
              placeholder="Enter your first name"
              placeholderTextColor={colors.gray[600]}
              autoCapitalize="words"
              autoCorrect={false}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Last name</Text>
          <View style={styles.inputWrapper}>
            <FormTextInput
              name="lastName"
              control={control}
              rules={{
                required: "Last name is required",
                minLength: {
                  value: 2,
                  message: "Last name must be at least 2 characters",
                },
              }}
              placeholder="Enter your last name"
              placeholderTextColor={colors.gray[600]}
              autoCapitalize="words"
              autoCorrect={false}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nickname</Text>
          <View style={styles.inputWrapper}>
            <FormTextInput
              name="nickname"
              control={control}
              rules={{
                minLength: {
                  value: 2,
                  message: "Nickname must be at least 2 characters",
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message:
                    "Nickname can only contain letters, numbers, and underscores",
                },
              }}
              placeholder="Choose a nickname (optional)"
              placeholderTextColor={colors.gray[600]}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>📷</Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Profile Picture</Text>
        <Text style={styles.subtitle}>Add a profile picture (optional).</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Image Preview */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.imagePreview}
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons
                name="close-circle"
                size={24}
                color={colors.gray[600]}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Image Picker Button */}
        <TouchableOpacity
          style={styles.imagePickerButton}
          onPress={showImagePickerOptions}
        >
          <Ionicons
            name={selectedImage ? "camera" : "camera-outline"}
            size={24}
            color={colors.gray[600]}
          />
          <Text style={styles.imagePickerButtonText}>
            {selectedImage ? "Change Picture" : "Select Picture"}
          </Text>
        </TouchableOpacity>

        {/* Manual URL Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Or enter picture URL</Text>
          <View style={styles.inputWrapper}>
            <FormTextInput
              name="picture"
              control={control}
              rules={{
                pattern: {
                  value: /^https?:\/\/.+/,
                  message:
                    "Please enter a valid URL starting with http:// or https://",
                },
              }}
              placeholder="https://example.com/avatar.jpg"
              placeholderTextColor={colors.gray[600]}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>
        </View>

        </View>

      {registrationError && (
        <ErrorContainer
          title="Registration Failed"
          message={registrationError.message}
          status={registrationError.status}
          code={registrationError.code}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          <Text style={styles.nextButtonText}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.skipButton} onPress={skipPicture}>
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {renderStepIndicator()}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
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
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepDotActive: {
    backgroundColor: colors.gray[800],
  },
  stepDotInactive: {
    backgroundColor: colors.gray[400],
  },
  stepContainer: {
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
    flexDirection: "row",
    gap: 12,
  },
  nextButton: {
    backgroundColor: "#1F2937", // Dark gray from Figma
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  nextButtonText: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
    letterSpacing: 0.075,
  },
  backButton: {
    backgroundColor: colors.gray[400], // #F8FAFC equivalent
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  backButtonText: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "600",
    color: colors.gray[600], // #6B7280
    letterSpacing: 0.075,
  },
  skipButton: {
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  skipButtonText: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "600",
    color: colors.gray[600], // #6B7280
    letterSpacing: 0.075,
    textDecorationLine: "underline",
  },
  imagePreviewContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 16,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.gray[300],
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 2,
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[400], // #F7F0EE
    borderWidth: 1,
    borderColor: colors.gray[300], // #E5E7EB
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  imagePickerButtonText: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "500",
    color: colors.gray[800],
    letterSpacing: 0.075,
  },
});

export default RegistrationFormScreen;
