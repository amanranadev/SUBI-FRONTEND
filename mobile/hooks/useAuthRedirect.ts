import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

interface UseAuthRedirectParams {
  isLoginSuccess: boolean;
  isLoginError: boolean;
}

/**
 * Hook to handle redirect after successful authentication.
 * Used by both Login and Registration screens to avoid code duplication.
 */
export const useAuthRedirect = ({
  isLoginSuccess,
  isLoginError,
}: UseAuthRedirectParams) => {
  const { token, isAuthenticated } = useAuthStore();
  const { user } = useUserStore();
  const [hasRedirected, setHasRedirected] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (
        (!hasRedirected && !isLoginError && isLoginSuccess) ||
        (token && isAuthenticated && user)
      ) {
        setHasRedirected(true);
        router.replace("/home");
      } else {
        setHasRedirected(false);
      }
    }, [isLoginSuccess, isLoginError, token, isAuthenticated, user, hasRedirected])
  );

  return { hasRedirected };
};

export default useAuthRedirect;
