import { useMemo } from "react";
import type { ViewStyle } from "react-native";

import type { BottomDrawerSize } from "./BottomDrawer.types";
import { bottomDrawerTokens } from "./BottomDrawer.styles";

export function resolveEstimatedStickyFooterHeight(): number {
  const { footer } = bottomDrawerTokens;

  return footer.paddingTop + footer.actionHeight;
}

export function resolveStickyFooterScrollInset(
  measuredFooterContentHeight: number,
): number {
  const { footer } = bottomDrawerTokens;
  const estimatedFooterHeight = resolveEstimatedStickyFooterHeight();
  const measuredFooterHeight =
    measuredFooterContentHeight > 0
      ? footer.paddingTop + measuredFooterContentHeight
      : 0;

  return (
    Math.max(measuredFooterHeight, estimatedFooterHeight) + footer.scrollPadding
  );
}

export function resolveStickyFooterScrollContentStyle(
  measuredFooterContentHeight: number,
): ViewStyle {
  return {
    paddingBottom: resolveStickyFooterScrollInset(measuredFooterContentHeight),
  };
}

export type BottomDrawerSheetConfig =
  | {
      enableDynamicSizing: true;
      snapPoints?: undefined;
    }
  | {
      enableDynamicSizing: false;
      snapPoints: string[];
    };

export function resolveBottomDrawerSheetConfig(
  size: BottomDrawerSize,
): BottomDrawerSheetConfig {
  if (size === "content") {
    return {
      enableDynamicSizing: true,
      snapPoints: undefined,
    };
  }

  return {
    enableDynamicSizing: false,
    snapPoints: [bottomDrawerTokens.snapPoints[size]],
  };
}

export function useBottomDrawerSheetConfig(
  size: BottomDrawerSize,
): BottomDrawerSheetConfig {
  return useMemo(() => resolveBottomDrawerSheetConfig(size), [size]);
}
