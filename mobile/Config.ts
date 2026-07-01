import { Platform } from "react-native";

// Use Expo's native environment variables (embedded at build time)
export const API_URL = process.env.EXPO_PUBLIC_API_URL;
export const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_KEY;
export const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
export const ENV = process.env.EXPO_PUBLIC_ENV || "development";

// Get WebSocket URL from environment or use platform-specific default
const getDefaultWebSocketUrl = () => {
  // Use environment variable if set (highest priority)
  if (process.env.EXPO_PUBLIC_WEBSOCKET_URL) {
    return process.env.EXPO_PUBLIC_WEBSOCKET_URL;
  }

  // Only use local development URLs if explicitly in development mode
  const env = process.env.EXPO_PUBLIC_ENV?.toLowerCase();
  if (env === "development") {
    // Platform-specific defaults for Docker
    if (Platform.OS === "android") {
      // Android emulator uses 10.0.2.2 to access host machine
      return "ws://10.0.2.2:8080/cable";
    } else {
      // iOS: Use Mac's IP for physical devices
      // Make sure your device is on the same Wi-Fi network as your Mac
      return "ws://192.168.0.10:8080/cable";
    }
  }

  // Default fallback: Use staging backend (for TestFlight/Production builds)
  return "wss://staging-backend.oksubi.com/cable";
};

const websocketUrl = getDefaultWebSocketUrl();
console.log(
  `🔌 WebSocket URL configured: ${websocketUrl.replace(
    /token=[^&]*/,
    "token=HIDDEN"
  )}`
);

export const WEBSOCKET_URL = websocketUrl;
