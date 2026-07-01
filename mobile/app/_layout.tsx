import { configureGoogleSignIn } from "@/config/googleSignIn";
import { toastConfig } from "@/config/toastConfig";
import { useAppFonts } from "@/hooks/useAppFonts";
import { queryClient } from "@/services/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
import React, { useEffect } from "react";
import "react-native-reanimated";
import Toast from "react-native-toast-message";

SplashScreen.preventAutoHideAsync();

const isStorybookMode =
  process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true" ||
  process.env.STORYBOOK_ENABLED === "true";

const showStorybookRoute = __DEV__ || isStorybookMode;

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (isStorybookMode) {
      router.replace("/storybook");
    }
  }, []);

  // Handle OAuth callback deep links globally
  useEffect(() => {
    const subscription = Linking.addEventListener("url", (event) => {
      const { url } = event;

      // Handle OAuth callback: oksubi://auth/callback?token={jwt}
      if (url.includes("auth/callback")) {
        // Navigate to the callback route which will handle token extraction
        router.replace("/auth/callback");
      }
    });

    // Handle app opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url && url.includes("auth/callback")) {
        router.replace("/auth/callback");
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="registerForm" options={{ headerShown: false }} />
        <Stack.Screen name="forgotPassword" options={{ headerShown: false }} />
        <Stack.Screen name="(authenticated)" options={{ headerShown: false }} />
        {showStorybookRoute ? (
          <Stack.Screen name="storybook" options={{ headerShown: false }} />
        ) : null}
      </Stack>
      <StatusBar style="auto" />
      <Toast config={toastConfig} />
    </QueryClientProvider>
  );
}
