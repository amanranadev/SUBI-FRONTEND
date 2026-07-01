import { useUserStore } from "@/stores";
import { useAuthStore } from "@/stores/authStore";
import { ErrorResponse, LoginRequest, LoginResponse, User } from "@/types/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";
import { AxiosError } from "axios";
import apiClient from "./api";
import { navigationService } from "./navigationService";
import { setGoogleSignInInProgress } from "./oauthState";
import { queryClient } from "./queryClient";

// Types for register and forgot password
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  lastName: string;
  nickname?: string;
  picture?: string;
  invitation_id?: string;
}

export interface RegisterResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    nickname: string;
    picture: string;
    subscription: string;
    onboardingCompleted: boolean;
    startedOnboarding: boolean;
    teams: any[];
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const storeToken = (token: string) => {
  try {
    console.log("💾 Storing token in auth store:", {
      tokenLength: token.length,
      tokenStart: token.substring(0, 20) + "...",
      tokenEnd: "..." + token.substring(token.length - 20),
    });
    useAuthStore.getState().setToken(token);
    console.log("✅ Token stored successfully");
  } catch (error) {
    console.error("❌ Error storing token:", error);
    throw new Error("Failed to store authentication token");
  }
};

export const getToken = (): string | null => {
  try {
    const token = useAuthStore.getState().token;
    return token || null;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

// Helper function to decode JWT token for debugging
export const inspectToken = (token: string) => {
  try {
    console.log("🔍 Inspecting JWT token:");
    console.log("🔍 Full token:", token);

    // Split the token into parts
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.log(
        "❌ Invalid JWT format - expected 3 parts, got:",
        parts.length
      );
      return;
    }

    console.log("🔍 Token parts:", {
      header: parts[0],
      payload: parts[1],
      signature: parts[2].substring(0, 20) + "...",
    });

    // Decode header (base64)
    const header = JSON.parse(atob(parts[0]));
    console.log("📋 JWT Header:", header);

    // Decode payload (base64)
    const payload = JSON.parse(atob(parts[1]));
    console.log("📋 JWT Payload:", {
      ...payload,
      exp: payload.exp
        ? new Date(payload.exp * 1000).toISOString()
        : "No expiration",
      iat: payload.iat
        ? new Date(payload.iat * 1000).toISOString()
        : "No issued at",
    });

    console.log("🔍 Token analysis:", {
      algorithm: header.alg,
      type: header.typ,
      issuer: payload.iss,
      subject: payload.sub,
      audience: payload.aud,
      expiresAt: payload.exp
        ? new Date(payload.exp * 1000).toISOString()
        : "No expiration",
      isExpired: payload.exp ? Date.now() > payload.exp * 1000 : false,
    });

    // Check for common algorithm issues
    if (header.alg === "HS256") {
      console.log("⚠️  Token uses HS256 - server might expect RS256");
    } else if (header.alg === "RS256") {
      console.log("⚠️  Token uses RS256 - server might expect HS256");
    } else {
      console.log("⚠️  Token uses unexpected algorithm:", header.alg);
    }
  } catch (error) {
    console.error("❌ Error inspecting token:", error);
  }
};

export const removeToken = () => {
  try {
    useAuthStore.getState().clearToken();
  } catch (error) {
    console.error("Error removing token:", error);
    throw new Error("Failed to remove authentication token");
  }
};
export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    console.log("🔐 Attempting login with credentials:", {
      email: credentials.email,
      passwordLength: credentials.password.length,
    });

    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials
    );

    const { token, user } = response.data;

    if (!token) throw new Error("No token received from server");

    // Clear React Query cache to prevent showing previous user's data
    queryClient.clear();

    useUserStore.getState().setUser({ ...user, firstName: user.name });
    storeToken(token);
    inspectToken(token);

    return response.data;
  } catch (err) {
    // The API interceptor already transforms errors to ApiError format
    // with message, status, code, and errors properties
    console.error("❌ Login error:", err);
    throw err;
  }
};

export const logout = async () => {
  try {
    await apiClient.delete("/auth/logout");
    useAuthStore.getState().clearToken();
  } catch (error) {
    console.warn("Logout API call failed:", error);
  }

  try {
    removeToken();
    useUserStore.getState().clearUser();
    // Clear React Query cache to prevent showing previous user's data
    queryClient.clear();
    navigationService.navigateToLogin();
  } catch (error) {
    console.error("Error during logout cleanup:", error);
    throw new Error("Failed to complete logout");
  }
};

export interface GoogleLoginResult {
  success: boolean;
  user?: User;
  requiresOnboarding?: boolean;
  requiresTeamSelection?: boolean;
  teams?: any[];
}

interface GoogleAuthResponse {
  token: string;
  user: User;
  message: string;
}

export const loginWithGoogle = async (): Promise<GoogleLoginResult> => {
  try {
    // Clear old auth data
    useAuthStore.getState().clearToken();
    useUserStore.getState().clearUser();
    // Clear React Query cache to prevent showing previous user's data
    queryClient.clear();

    // Set OAuth in progress flag (critical to prevent 401 logout)
    setGoogleSignInInProgress(true);

    // Check if already signed in and sign out first to clear cached state
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        await GoogleSignin.signOut();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch {
      // Ignore sign-out errors
    }

    // Re-configure Google Sign-In to ensure fresh state
    const { configureGoogleSignIn } = await import("@/config/googleSignIn");
    configureGoogleSignIn();

    // Sign in with Google native SDK
    await GoogleSignin.hasPlayServices();
    const signInResult = await GoogleSignin.signIn();

    if (!signInResult.data?.idToken) {
      throw new Error("No ID token received from Google");
    }

    const idToken = signInResult.data.idToken;

    // Exchange Google ID token for backend JWT
    const response = await apiClient.post<GoogleAuthResponse>("/auth/google", {
      id_token: idToken,
    });

    const { token, user: userData } = response.data;

    // Store the JWT token
    storeToken(token);

    // Store user data
    useUserStore.getState().setUser(userData);

    // Clear the OAuth flag
    setGoogleSignInInProgress(false);

    // Determine navigation hints
    const requiresOnboarding = userData.onboardingCompleted === false;
    const requiresTeamSelection = userData.teams && userData.teams.length > 1;

    return {
      success: true,
      user: userData,
      requiresOnboarding,
      requiresTeamSelection,
      teams: userData.teams,
    };
  } catch (error: unknown) {
    setGoogleSignInInProgress(false);

    const err = error as { code?: string; message?: string };
    console.error("[Google Sign-In] Error:", {
      code: err?.code,
      message: err?.message,
      error,
    });

    if (err?.code === "SIGN_IN_CANCELLED") {
      throw new Error("Google sign-in was cancelled");
    }
    if (err?.code === "IN_PROGRESS") {
      throw new Error("Google sign-in is already in progress");
    }
    if (err?.code === "PLAY_SERVICES_NOT_AVAILABLE") {
      throw new Error("Google Play Services not available");
    }
    if (String(err?.code) === "10") {
      throw new Error(
        "DEVELOPER_ERROR: SHA-1 fingerprint or package name not configured correctly in Google Cloud Console."
      );
    }
    if (String(err?.code) === "12500") {
      const androidPackage = Constants.expoConfig?.android?.package ?? "unknown";
      console.error("[Google Sign-In] 12500: Use this package name in Google Cloud Console Android OAuth client:", androidPackage);
      const message = `Google Sign-In failed (12500). Add Android OAuth client in Google Cloud Console with package name: ${androidPackage} and your debug/release SHA-1 fingerprint.`;
      throw new Error(message);
    }

    throw error;
  }
};

export const register = async (
  userData: RegisterRequest
): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>(
      "/auth/signup",
      userData
    );

    console.log("📝 Registration response received:", {
      status: response.status,
      hasToken: !!response.data.token,
      tokenLength: response.data.token?.length,
      hasUser: !!response.data.user,
      user: response.data.user,
    });

    const { token, user } = response.data;

    if (!token) {
      throw new Error("No token received from server");
    }

    // Clear React Query cache to prevent showing previous user's data
    queryClient.clear();

    // Store user data
    useUserStore.getState().setUser({
      ...user,
      firstName: user.name,
      subscription: user.subscription as
        | "FREE"
        | "PREMIUM_MONTHLY"
        | "PREMIUM_YEARLY",
    });

    // Store token
    storeToken(token);

    // Inspect the token for debugging
    inspectToken(token);

    return response.data;
  } catch (error) {
    console.error("❌ Registration error:", error);
    throw error;
  }
};

export const forgotPassword = async (
  email: string
): Promise<ForgotPasswordResponse> => {
  try {
    console.log("🔑 Requesting password reset for email:", email);

    const response = await apiClient.post<ForgotPasswordResponse>(
      "/auth/password",
      { email }
    );

    console.log("🔑 Password reset response received:", {
      status: response.status,
      message: response.data.message,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    throw error;
  }
};

export const changePassword = async (
  data: ChangePasswordRequest
): Promise<void> => {
  try {
    await apiClient.post("/auth/change-password", data);
  } catch (error) {
    console.error("❌ Change password error:", error);
    throw error;
  }
};
