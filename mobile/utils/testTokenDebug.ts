import { debugCurrentToken } from "@/utils/debugToken";

// Add this to your Home screen or any component to debug the current token
// You can call this function to see what's wrong with your token

export const testTokenDebug = () => {
  console.log("🧪 Testing token debug...");
  debugCurrentToken();
};

// You can also call this directly in your console:
// import { testTokenDebug } from '@/utils/testTokenDebug'
// testTokenDebug()
