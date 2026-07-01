import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import type { Preview } from "@storybook/react-native";
import React from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAppFonts } from "@/hooks/useAppFonts";

function StorybookFontGate({ children }: { children: React.ReactNode }) {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) {
    return null;
  }

  return <>{children}</>;
}

const preview: Preview = {
  decorators: [
    (Story) => (
      <StorybookFontGate>
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.root}>
            <BottomSheetModalProvider>
              <Story />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </StorybookFontGate>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default preview;
