import { GOOGLE_KEY } from "@/Config";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const configureGoogleSignIn = () => {
  if (!GOOGLE_KEY) {
    if (__DEV__) {
      console.warn("Google Sign-In: EXPO_PUBLIC_GOOGLE_KEY is not set. Google Sign-In will be disabled.");
    }
    return;
  }

  try {
    GoogleSignin.configure({
      webClientId: GOOGLE_KEY,
      iosClientId: GOOGLE_KEY,
      scopes: ["https://www.googleapis.com/auth/calendar"],
      offlineAccess: true,
      hostedDomain: "",
      forceCodeForRefreshToken: true,
    });
  } catch (error) {
    console.error("[Google Sign-In] configure error:", error);
    throw error;
  }
};
