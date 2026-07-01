import { useFonts } from "expo-font";

/**
 * Loads Styrene A Web font files from `@subi/assets`.
 * Register keys must match `FONT_FAMILY` in `@subi/config`.
 */
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    StyLight: require("@subi/assets/fonts/sty-light.ttf"),
    StyRegular: require("@subi/assets/fonts/sty-regular.ttf"),
    StyMedium: require("@subi/assets/fonts/sty-medium.ttf"),
    StyBold: require("@subi/assets/fonts/sty-bold.ttf"),
  });

  return loaded;
}
