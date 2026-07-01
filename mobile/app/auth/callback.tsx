import { colors } from "@/constants/colors";
import { storeToken } from "@/services/authService";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (!url || !url.includes("auth/callback")) {
          router.replace("/(authenticated)/(settings)/calendar-syncing");
          return;
        }

        const urlObj = Linking.parse(url);
        const token = urlObj.queryParams?.token as string;

        if (token) {
          storeToken(token);
        }

        router.replace("/(authenticated)/(settings)/calendar-syncing");
      } catch {
        router.replace("/(authenticated)/(settings)/calendar-syncing");
      }
    };

    handleCallback();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.white,
      }}
    >
      <ActivityIndicator size="large" color={colors.blue[500]} />
    </View>
  );
}
