// Use Expo's native environment variables (embedded at build time)
export type Config = {
  [key: string]: string | undefined;
};

export const config: Config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
  websocketUrl: process.env.EXPO_PUBLIC_WEBSOCKET_URL,
  googleKey: process.env.EXPO_PUBLIC_GOOGLE_KEY,
  env: process.env.EXPO_PUBLIC_ENV,
};
