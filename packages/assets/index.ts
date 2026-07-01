import path from "node:path";

/**
 * Absolute path to `packages/assets` — single source of truth for shared binaries.
 * Mobile (Expo) can resolve these paths via `@subi/assets` or `./fonts/*` exports.
 */
export const assetsPackageRoot = path.resolve(__dirname);

/** Styrene A Web (Figma: "Styrene A Web") — absolute paths for next/font/local and future Expo. */
export const styreneFontPaths = {
  thin: path.join(assetsPackageRoot, "fonts", "sty-thin.ttf"),
  light: path.join(assetsPackageRoot, "fonts", "sty-light.ttf"),
  regular: path.join(assetsPackageRoot, "fonts", "sty-regular.ttf"),
  medium: path.join(assetsPackageRoot, "fonts", "sty-medium.ttf"),
  bold: path.join(assetsPackageRoot, "fonts", "sty-bold.ttf"),
} as const;

export type StyreneFontWeight = keyof typeof styreneFontPaths;
