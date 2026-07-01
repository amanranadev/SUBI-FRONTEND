const {
  withStorybook,
} = require("@storybook/react-native/metro/withStorybook");

const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Force a single React instance (avoids invalid hook call from nested copies e.g. react-hook-form).
const reactPath = path.dirname(
  require.resolve("react/package.json", { paths: [projectRoot, monorepoRoot] })
);
const reactDomPath = path.dirname(
  require.resolve("react-dom/package.json", { paths: [projectRoot, monorepoRoot] })
);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  react: reactPath,
  "react-dom": reactDomPath,
};

config.resolver.assetExts.push("pdf");

const isStorybookEnabled =
  process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true" ||
  process.env.STORYBOOK_ENABLED === "true" ||
  process.env.NODE_ENV !== "production";

module.exports = withStorybook(config, {
  // Route-based setup: keep Storybook active in dev so imports are not stubbed out.
  enabled: isStorybookEnabled,
  configPath: "./.rnstorybook",
});
