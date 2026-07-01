import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header/Header";
import { colors } from "../../constants/colors";

function SettingsScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View>
        <Header title="Settings" />
      </View>

      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/account")}
          >
            <Text style={styles.itemTitle}>Profile</Text>
            <Text style={styles.itemSubtitle}>Update your basic info</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/preferences")}
          >
            <Text style={styles.itemTitle}>App Preferences</Text>
            <Text style={styles.itemSubtitle}>Theme, notifications</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calendar Syncing</Text>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/calendar-syncing")}
          >
            <Text style={styles.itemTitle}>Connected Calendars</Text>
            <Text style={styles.itemSubtitle}>Google, Apple</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/subscription")}
          >
            <Text style={styles.itemTitle}>Plan & Billing</Text>
            <Text style={styles.itemSubtitle}>Manage plan, payment method</Text>
          </TouchableOpacity>
        </View>

        {__DEV__ && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Developer</Text>
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push("/storybook")}
            >
              <Text style={styles.itemTitle}>Storybook</Text>
              <Text style={styles.itemSubtitle}>
                Browse and develop UI components
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export default SettingsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray[200],
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    lineHeight: 20,
    color: "#867873",
    letterSpacing: -0.15,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 0.574,
    borderColor: "#ebe6e3",
    padding: 16,
  },
  formRow: {
    marginTop: 12,
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
  saveButton: {
    alignSelf: "flex-start",
    marginTop: 14,
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
  itemTitle: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    lineHeight: 24,
    color: "#2b2827",
    letterSpacing: -0.31,
  },
  itemSubtitle: {
    marginTop: 4,
    fontFamily: "Inter-Regular",
    fontSize: 13,
    lineHeight: 18,
    color: "#867873",
  },
});
