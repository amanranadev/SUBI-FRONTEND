import localFont from "next/font/local";

/**
 * Styrene A Web via next/font/local — binaries live in `@subi/assets` (packages/assets/fonts).
 *
 * next/font requires string-literal paths (no runtime variables). Paths below resolve to the
 * shared package directory. Keep in sync with `styreneFontPaths` in `@subi/assets`.
 *
 * Legacy (removed): `@font-face` in globals.css + `web/public/fonts/*.ttf`.
 * Tailwind `font-body` / `font-headline` consume `var(--font-sty)` from `sty.variable` on `<html>`.
 */
export const sty = localFont({
  src: [
    {
      path: "../../../packages/assets/fonts/sty-thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../../packages/assets/fonts/sty-light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../../packages/assets/fonts/sty-regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../packages/assets/fonts/sty-medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../packages/assets/fonts/sty-medium.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../../packages/assets/fonts/sty-bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sty",
  display: "swap",
});
