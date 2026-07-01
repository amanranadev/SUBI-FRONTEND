import AsyncStorage from "@react-native-async-storage/async-storage";

import { view } from "./storybook.requires";

/**
 * Default export for Expo Router: `export { default } from '../.rnstorybook'`
 * Entry-point swapping uses metro `withStorybook` when STORYBOOK_ENABLED is set.
 */
const StorybookUIRoot = view.getStorybookUI({
  shouldPersistSelection: true,
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
});

export default StorybookUIRoot;
