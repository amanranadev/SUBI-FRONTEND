import { colors } from "@/constants/colors";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { router, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { token, isAuthenticated } = useAuthStore();
  const { user } = useUserStore();
  const [isChecking, setIsChecking] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Small delay to prevent flickering
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect if we're not checking and user is not authenticated
    // and we're not on a public route
    if (
      !isChecking &&
      (!token || !isAuthenticated || !user) &&
      pathname !== "/" &&
      pathname !== "/register" &&
      pathname !== "/forgotPassword"
    ) {
      console.log("User not authenticated, redirecting to login", {
        token: !!token,
        isAuthenticated,
        user: !!user,
        pathname,
      });
      router.replace("/");
    }
  }, [token, isAuthenticated, user, isChecking, pathname]);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.blue[500]} />
      </View>
    );
  }

  // Don't render children if not authenticated
  if (!token || !isAuthenticated || !user) {
    return null;
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
});
