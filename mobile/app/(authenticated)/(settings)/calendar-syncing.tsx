import { API_CONFIG } from "@/config/api";
import apiClient from "@/services/api";
import { getToken, storeToken } from "@/services/authService";
import { ensureSelectedGoogleCalendar } from "@/services/googleCalendarService";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header/Header";
import { colors } from "../../../constants/colors";
import { calendarService } from "../../../services/calendarService";
import { useCalendarStore } from "../../../stores/calendarStore";

function CalendarSyncingSettings() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const {
    isAppleCalendarConnected,
    connectAppleCalendar,
    disconnectAppleCalendar,
    isGoogleCalendarConnected,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
  } = useCalendarStore();

  // Check Google Calendar connection status on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkGoogleCalendarConnection();
    }, [])
  );

  // Handle deep link callbacks from OAuth flow
  useEffect(() => {
    const subscription = Linking.addEventListener("url", (event) => {
      const { url } = event;

      // Handle OAuth callback: oksubi://auth/callback?token={jwt}
      if (url.includes("auth/callback")) {
        const urlObj = Linking.parse(url);
        const token = urlObj.queryParams?.token as string;

        if (token) {
          storeToken(token);
          checkGoogleCalendarConnection();
        }
      }
    });

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url && url.includes("auth/callback")) {
        const urlObj = Linking.parse(url);
        const token = urlObj.queryParams?.token as string;
        if (token) {
          checkGoogleCalendarConnection();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const checkGoogleCalendarConnection = async () => {
    if (isCheckingConnection) return;

    setIsCheckingConnection(true);
    try {
      const response = await apiClient.get("/google_calendars/check_access");

      if (response.data?.accounts && response.data.accounts.length > 0) {
        const hasConnectedAccount = response.data.accounts.some(
          (account: any) => !account.needs_consent
        );

        if (hasConnectedAccount) {
          const hasSelectedCalendar = await ensureSelectedGoogleCalendar();
          if (hasSelectedCalendar) {
            connectGoogleCalendar();
          }
        }
      }
    } catch (error: any) {
      // 400 means no accounts connected, which is expected
      if (error.response?.status !== 400) {
        // Silent fail for connection check
      }
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleAppleCalendarConnect = async () => {
    if (Platform.OS !== "ios") {
      Alert.alert(
        "Not Available",
        "Apple Calendar is only available on iOS devices."
      );
      return;
    }

    setIsConnecting(true);
    try {
      const hasPermission = await calendarService.requestPermissions();
      if (hasPermission) {
        connectAppleCalendar();
        Alert.alert("Connected", "Apple Calendar has been connected successfully.");
      } else {
        Alert.alert(
          "Permission Denied",
          "Please enable calendar access in your device settings to connect Apple Calendar."
        );
      }
    } catch (error) {
      console.error("Error connecting Apple Calendar:", error);
      Alert.alert("Error", "Failed to connect Apple Calendar.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAppleCalendarDisconnect = () => {
    Alert.alert(
      "Disconnect Apple Calendar",
      "Are you sure you want to disconnect Apple Calendar?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: () => {
            disconnectAppleCalendar();
            Alert.alert("Disconnected", "Apple Calendar has been disconnected.");
          },
        },
      ]
    );
  };

  const handleGoogleCalendarConnect = async () => {
    setIsConnecting(true);

    try {
      const jwtToken = getToken();
      if (!jwtToken) {
        Alert.alert(
          "Authentication Required",
          "Please sign in to connect Google Calendar."
        );
        setIsConnecting(false);
        return;
      }

      const oauthQuery = new URLSearchParams({
        state: jwtToken,
        client: "mobile",
      }).toString();
      const oauthUrl = `${API_CONFIG.BASE_URL}/api/auth/google_oauth2?${oauthQuery}`;

      const canOpen = await Linking.canOpenURL(oauthUrl);
      if (!canOpen) {
        throw new Error("Cannot open OAuth URL. Please check your backend configuration.");
      }

      await Linking.openURL(oauthUrl);

      Alert.alert(
        "Complete OAuth Flow",
        "A browser window will open. Please sign in with Google and grant calendar permissions. You will be redirected back to the app automatically.",
        [
          {
            text: "OK",
            onPress: () => {
              setIsConnecting(false);
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "Failed to start Google Calendar connection. Please try again."
      );
      setIsConnecting(false);
    }
  };

  const handleGoogleCalendarDisconnect = async () => {
    Alert.alert(
      "Disconnect Google Calendar",
      "Are you sure you want to disconnect Google Calendar?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            try {
              const accountsResponse = await apiClient.get(
                "/google_calendars/check_access"
              );
              const accounts = accountsResponse.data?.accounts || [];

              for (const account of accounts) {
                try {
                  await apiClient.delete(`/connected_accounts/${account.id}`);
                } catch {
                  // Continue disconnecting other accounts
                }
              }

              disconnectGoogleCalendar();
              Alert.alert(
                "Disconnected",
                "Google Calendar has been disconnected successfully."
              );
            } catch (error: any) {
              disconnectGoogleCalendar();

              if (error.response?.status === 404) {
                Alert.alert("Disconnected", "Google Calendar has been disconnected.");
              } else {
                Alert.alert(
                  "Disconnected",
                  "Google Calendar has been disconnected locally."
                );
              }
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View>
        <Header
          showMenuButton={false}
          leftComponent={
            <TouchableOpacity onPress={() => router.push("/settings")}>
              <Ionicons name="arrow-back" size={24} color={colors.gray[800]} />
            </TouchableOpacity>
          }
          title="Calendar Syncing"
        />
      </View>

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Google Calendar</Text>
          <Text style={styles.cardSubtitle}>
            {isGoogleCalendarConnected ? "Connected" : "Not connected"}
          </Text>
          {isGoogleCalendarConnected ? (
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleGoogleCalendarDisconnect}
            >
              <Text style={styles.disconnectButtonText}>Disconnect</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, isConnecting && styles.buttonDisabled]}
              onPress={handleGoogleCalendarConnect}
              disabled={isConnecting}
            >
              <Text style={styles.buttonText}>
                {isConnecting ? "Connecting..." : "Connect"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {Platform.OS === "ios" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Apple Calendar</Text>
            <Text style={styles.cardSubtitle}>
              {isAppleCalendarConnected ? "Connected" : "Not connected"}
            </Text>
            {isAppleCalendarConnected ? (
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={handleAppleCalendarDisconnect}
              >
                <Text style={styles.disconnectButtonText}>Disconnect</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, isConnecting && styles.buttonDisabled]}
                onPress={handleAppleCalendarConnect}
                disabled={isConnecting}
              >
                <Text style={styles.buttonText}>
                  {isConnecting ? "Connecting..." : "Connect"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export default CalendarSyncingSettings;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray[200],
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
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
  },
  cardSubtitle: {
    marginTop: 4,
    fontFamily: "Inter-Regular",
    fontSize: 13,
    lineHeight: 18,
    color: "#867873",
  },
  button: {
    marginTop: 10,
    backgroundColor: colors.primary[400],
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: colors.white,
    fontFamily: "Inter-Medium",
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  disconnectButton: {
    marginTop: 10,
    backgroundColor: "#FBE9E7",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#F5C6C2",
  },
  disconnectButtonText: {
    color: "#B00020",
    fontFamily: "Inter-Medium",
    fontSize: 14,
  },
});
