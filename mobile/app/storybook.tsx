import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const isStorybookEnabled =
  process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true" ||
  process.env.STORYBOOK_ENABLED === "true" ||
  __DEV__;

function StorybookUnavailable() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Storybook unavailable</Text>
      <Text style={styles.subtitle}>
        Run with EXPO_PUBLIC_STORYBOOK_ENABLED=true or use a development build.
      </Text>
    </View>
  );
}

let StorybookUIRoot: React.ComponentType = StorybookUnavailable;

if (isStorybookEnabled) {
  const { view } = require("../.rnstorybook/storybook.requires");
  StorybookUIRoot = view.getStorybookUI({
    shouldPersistSelection: true,
    storage: {
      getItem: AsyncStorage.getItem,
      setItem: AsyncStorage.setItem,
    },
  });
}

export default StorybookUIRoot;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
  },
});
