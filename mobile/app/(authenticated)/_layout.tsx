import { AuthGuard } from "@/components/AuthGuard";
import { BottomTabBar } from "@/components/BottomTabBar";
import { SubiChat } from "@/components/BottomNavigation";
import { CustomDrawerContent } from "@/components/CustomDrawerContent";
import { APP_BOTTOM_TABS } from "@/constants/bottomTabs";
import { colors } from "@/constants/colors";
import { TaskDetailProvider, useTaskDetailContext } from "@/contexts/TaskDetailContext";
import { useWakeWordDetection } from "@/hooks/useWakeWordDetection";
import { useAuthStore } from "@/stores/authStore";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { usePathname, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useMemo } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function DrawerContent() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isTaskDetailOpen } = useTaskDetailContext();

  const isHomeScreen = useMemo(() => {
    return pathname === "/home" || pathname === "/";
  }, [pathname]);

  const isVoiceMode = useMemo(() => {
    return pathname === "/voice-mode";
  }, [pathname]);

  // Show SubiChat on home screen only when task detail is open (for comment input)
  // Hide SubiChat entirely on voice mode screen
  const shouldHideSubiChat = (isHomeScreen && !isTaskDetailOpen) || isVoiceMode;
  const showBottomTabBar = pathname === "/home" || pathname === "/";

  return (
    <View style={styles.content}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: colors.white,
            width: 280,
          },
          drawerInactiveTintColor: colors.gray[600],
          drawerLabelStyle: {
            fontSize: 16,
            fontWeight: "500",
          },
        }}
      >
        <Drawer.Screen
          name="home"
          options={{
            drawerLabel: "Home",
            title: "Home",
          }}
        />
        {/* Hidden stack for settings subpages */}
        <Drawer.Screen
          name="(settings)"
          options={{
            headerShown: false,
            drawerItemStyle: { display: "none" },
          }}
        />

        <Drawer.Screen
          name="(transactions)"
          options={{
            drawerLabel: "Transactions",
            title: "Transactions",
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: "Settings",
            title: "Settings",
          }}
        />
        <Drawer.Screen
          name="logout"
          options={{
            drawerLabel: "Logout",
            title: "Logout",
          }}
        />

        <Drawer.Screen
          name="chat"
          options={{
            drawerLabel: "Chat",
            title: "Chat",
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="voice-mode"
          options={{
            drawerLabel: "Voice Mode",
            title: "Voice Mode",
            drawerItemStyle: { display: "none" },
          }}
        />
      </Drawer>
      {showBottomTabBar ? (
        <BottomTabBar
          items={APP_BOTTOM_TABS}
          value="home"
          onValueChange={(tab) => {
            if (tab === "home") {
              router.replace("/home");
            }
          }}
          size="md"
          showLabels
          showHomeIndicator={false}
          elevated
          containerStyle={{ paddingBottom: insets.bottom }}
        />
      ) : null}
      {!shouldHideSubiChat && <SubiChat />}
    </View>
  );
}

export default function DrawerLayout() {
  const { isAuthenticated } = useAuthStore();

  // Wake word detection disabled
  // useWakeWordDetection(isAuthenticated);

  return (
    <AuthGuard>
      <TaskDetailProvider>
        <GestureHandlerRootView style={styles.container}>
          <BottomSheetModalProvider>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardAvoidingView}
              keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
              <DrawerContent />
            </KeyboardAvoidingView>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </TaskDetailProvider>
    </AuthGuard>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
