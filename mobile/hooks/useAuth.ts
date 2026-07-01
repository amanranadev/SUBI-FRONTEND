import {
  forgotPassword,
  GoogleLoginResult,
  login,
  loginWithGoogle,
  logout,
  register,
  RegisterRequest,
} from "@/services/authService";
import { queryKeys } from "@/services/queryClient";
import { ApiError, LoginRequest, LoginResponse } from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });
};

export const useLogin = () => {
  return useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: (credentials) => login(credentials),
    retry: false,
  });
};

export const useGoogleLogin = () => {
  return useMutation<GoogleLoginResult, Error>({
    mutationFn: () => loginWithGoogle(),
    retry: false,
    onError: (error) => {
      console.error("[useAuth] Google login error:", error?.message, error);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (userData: RegisterRequest) => register(userData),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
};

export const useAuth = () => {
  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();
  const logoutMutation = useLogout();
  const registerMutation = useRegister();
  const forgotPasswordMutation = useForgotPassword();

  return {
    logout: logoutMutation.mutate,
    login: loginMutation.mutate,
    loginWithGoogle: googleLoginMutation.mutate,
    register: registerMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    isLoginPending: loginMutation.isPending,
    isGoogleLoginPending: googleLoginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    isForgotPasswordPending: forgotPasswordMutation.isPending,
    isLoginSuccess:
      loginMutation.isSuccess ||
      googleLoginMutation.isSuccess ||
      registerMutation.isSuccess,

    isLoginError: loginMutation.isError,
    isGoogleLoginError: googleLoginMutation.isError,
    isRegisterError: registerMutation.isError,
    isForgotPasswordError: forgotPasswordMutation.isError,
    loginError: loginMutation.error,
    googleLoginError: googleLoginMutation.error,
    registerError: registerMutation.error,
    forgotPasswordError: forgotPasswordMutation.error,
  };
};
