import { Platform } from "react-native";
import { config } from "../constants/config";

const getDefaultApiUrl = () => {
  const sanitizedApiUrl = config.apiUrl?.trim();

  // Highest priority: explicit API URL from env/config
  if (sanitizedApiUrl) {
    return sanitizedApiUrl;
  }

  // Only use local development URLs if explicitly in development mode
  const env = config.env?.toLowerCase();
  if (env === "development") {
    // Platform-specific defaults for local development
    if (Platform.OS === "android") {
      // Android emulator uses 10.0.2.2 to access host machine
      return "http://10.0.2.2:4000";
    } else {
      // iOS: Use Mac's IP for physical devices
      // Make sure your device is on the same Wi-Fi network as your Mac
      return "http://192.168.0.10:4000";
    }
  }

  // Default fallback: Use staging backend (for TestFlight/Production builds)
  return "https://staging-backend.oksubi.com";
};

const apiUrl = getDefaultApiUrl();
console.log(`🌐 API Base URL configured: ${apiUrl}`);

export const API_CONFIG = {
  BASE_URL: apiUrl,
} as const;

export const APP_CONFIG = {
  NAME: "OkSubi",
  VERSION: "1.0.0",
} as const;
