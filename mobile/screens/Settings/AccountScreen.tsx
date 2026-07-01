import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header/Header";
import { colors } from "../../constants/colors";
import useUser from "../../hooks/useUser";
import { changePassword } from "../../services/authService";
import { navigationService } from "../../services/navigationService";
import { useAuthStore } from "../../stores/authStore";
import { useUserStore } from "../../stores/userStore";

function AccountScreen() {
  const { user, updateUser } = useUserStore();
  const clearToken = useAuthStore((s) => s.clearToken);
  const [firstName, setFirstName] = useState<string>(user?.firstName || "");
  const [lastName, setLastName] = useState<string>(user?.lastName || "");
  const [nickname, setNickname] = useState<string>(user?.nickname || "");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const { updateUser: updateUserMutate, deleteUser: deleteUserMutate } =
    useUser();

  const onSave = () => {
    try {
      updateUserMutate({
        userId: user?.id || "",
        updates: { name: firstName, lastName, nickname },
      });
      updateUser({
        firstName,
        lastName,
        nickname,
        name: `${firstName} ${lastName}`.trim(),
      });
      Alert.alert("Saved", "Your profile has been updated.");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to update profile");
    }
  };

  const onChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert("Error", "Password is required");
      return;
    }

    if (!newPassword) {
      Alert.alert("Error", "Password is required");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      Alert.alert("Error", "Password must contain at least one uppercase letter");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      Alert.alert("Error", "Password must contain at least one number");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }

    if (newPassword === currentPassword) {
      Alert.alert("Error", "New password must be different from current password");
      return;
    }

    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      Keyboard.dismiss();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Success", "Your password has been updated.");
    } catch (e: any) {
      const status = e?.response?.status;
      const serverMessage = e?.response?.data?.message || e?.response?.data?.error;

      let errorMessage = "Failed to update password";
      if (status === 422) {
        errorMessage = serverMessage || "Current password is incorrect";
      } else if (serverMessage) {
        errorMessage = serverMessage;
      }

      Alert.alert("Error", errorMessage);
    }
  };

  const onDeleteAccount = () => {
    if (!user?.id) return;
    Alert.alert(
      "Delete Account",
      "This action is permanent. Are you sure you want to delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              deleteUserMutate(user.id);
              clearToken();
              updateUser(null as any);
              navigationService.navigateToLogin();
            } catch (e: any) {
              Alert.alert("Error", e?.message || "Failed to delete account");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View>
        <Header
          showMenuButton={false}
          leftComponent={
            <TouchableOpacity onPress={() => router.push("/settings")}>
              <Ionicons name="arrow-back" size={24} color={colors.gray[800]} />
            </TouchableOpacity>
          }
          title="Profile"
        />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Profile</Text>
          <Text style={styles.cardSubtitle}>
            Choose how you would like your name to be displayed.
          </Text>

          <Text style={styles.inputLabel}>First name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            autoCapitalize="words"

          />

          <Text style={[styles.inputLabel, { marginTop: 12 }]}>Last name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            autoCapitalize="words"
          />

          <Text style={[styles.inputLabel, { marginTop: 12 }]}>Nickname</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="Nickname"
            autoCapitalize="none"
          />

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.saveButton} onPress={onSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Change Password</Text>
          <Text style={styles.cardSubtitle}>
            Enter your current password and choose a new password.
          </Text>

          <Text style={styles.inputLabel}>Current password</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            secureTextEntry
            autoCapitalize="none"
            accessibilityLabel="current-password-input"
          />

          <Text style={[styles.inputLabel, { marginTop: 12 }]}>New password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            secureTextEntry
            autoCapitalize="none"
            accessibilityLabel="new-password-input"
          />

          <Text style={[styles.inputLabel, { marginTop: 12 }]}>Confirm password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            secureTextEntry
            autoCapitalize="none"
            accessibilityLabel="confirm-password-input"
          />

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.saveButton} onPress={onChangePassword} accessibilityLabel="update-password-button">
              <Text style={styles.saveButtonText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delete account</Text>
          <Text style={styles.cardSubtitle}>
            If you no longer wish to use Subi, you can permanently delete your
            account.
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDeleteAccount}
          >
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default AccountScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray[200],
  },

  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 0.574,
    borderColor: "#ebe6e3",
    padding: 16,
  },
  cardTitle: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    lineHeight: 24,
    color: "#2b2827",
    letterSpacing: -0.31,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    lineHeight: 18,
    color: "#867873",
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    lineHeight: 16,
    color: "#867873",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#faf7f5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ebe6e3",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Inter-Regular",
    fontSize: 15,
    color: "#2b2827",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  saveButton: {
    alignSelf: "flex-start",
    marginTop: 16,
    backgroundColor: colors.primary[400],
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  saveButtonText: {
    color: colors.white,
    fontFamily: "Inter-Medium",
    fontSize: 14,
  },
  deleteButton: {
    alignSelf: "flex-start",
    marginTop: 16,
    backgroundColor: "#fbe9e7",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#f5c6c2",
  },
  deleteButtonText: {
    color: "#b00020",
    fontFamily: "Inter-Medium",
    fontSize: 14,
  },
});
