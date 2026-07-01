import { inspectToken } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";

// Debug utility to inspect current token
export const debugCurrentToken = () => {
  const token = useAuthStore.getState().token;
  if (token) {
    console.log("🔍 Debugging current token:");
    inspectToken(token);
  } else {
    console.log("❌ No token found in store");
  }
};

// You can call this function from anywhere in your app to debug the token
// Example: debugCurrentToken()
