declare module "react-native-config" {
  export interface NativeConfig {
    EXPO_PUBLIC_API_URL: string;
    EXPO_PUBLIC_WEBSOCKET_URL: string;
    EXPO_PUBLIC_GOOGLE_KEY: string;
    EXPO_PUBLIC_ENV: string;
    EXPO_PUBLIC_API_URL_DEV: string;
    EXPO_PUBLIC_WEBSOCKET_URL_DEV: string;
  }
  export const Config: NativeConfig;
  export default Config;
}
