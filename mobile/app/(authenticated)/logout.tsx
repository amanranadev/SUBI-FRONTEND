import { colors } from "@/constants/colors";
import { queryClient } from "@/services/queryClient";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LogoutScreen() {
  const { clearToken } = useAuthStore();
  const { clearUser } = useUserStore();

  const handleLogout = () => {
    // Clear auth token and user data
    clearToken();
    clearUser();
    // Clear React Query cache to prevent showing previous user's data
    queryClient.clear();

    // Redirect to login screen
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardBody}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🚪</Text>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>Logout</Text>
              <Text style={styles.message}>
                Are you sure you want to logout? You'll need to sign in again to
                access your account.
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[200], // #FCFAFA
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 23,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[300], // #E5E7EB equivalent
    width: "100%",
    maxWidth: 343,
  },
  cardBody: {
    padding: 20,
    alignItems: "center",
    gap: 24,
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
  message: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[600], // #6B7280
    textAlign: "center",
    lineHeight: 24,
    letterSpacing: 0.08,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  logoutButton: {
    backgroundColor: "#1F2937", // Dark gray from Figma
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  logoutButtonText: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
    letterSpacing: 0.075,
  },
  cancelButton: {
    backgroundColor: colors.gray[400], // #F8FAFC equivalent
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  cancelButtonText: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "600",
    color: colors.gray[600], // #6B7280
    letterSpacing: 0.075,
  },
});
