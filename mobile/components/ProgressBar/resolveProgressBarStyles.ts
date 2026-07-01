import type { TextStyle, ViewStyle } from "react-native";

import { progressBarTokens } from "./tokens";
import type {
  ProgressBarSize,
  ProgressBarVariant,
  ResolvedProgressBarMetrics,
} from "./ProgressBar.types";

const { colors, sizes, typography } = progressBarTokens;

interface ResolveOptions {
  variant: ProgressBarVariant;
  size: ProgressBarSize;
}

function resolveFillColor(variant: ProgressBarVariant): string {
  switch (variant) {
    case "success":
      return colors.fillSuccess;
    case "warning":
      return colors.fillWarning;
    case "danger":
      return colors.fillDanger;
    case "muted":
      return colors.fillMuted;
    case "default":
    default:
      return colors.fillDefault;
  }
}

function resolveTrackColor(variant: ProgressBarVariant): string {
  return variant === "muted" ? colors.trackMuted : colors.track;
}

export function clampProgressValue(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
}

export function resolveProgressBarStyles({
  variant,
  size,
}: ResolveOptions): ResolvedProgressBarMetrics {
  const sizeMetrics = sizes[size];
  const fillColor = resolveFillColor(variant);

  const track: ViewStyle = {
    width: "100%",
    height: sizeMetrics.height,
    borderRadius: sizeMetrics.radius,
    backgroundColor: resolveTrackColor(variant),
    overflow: "hidden",
  };

  const fill: ViewStyle = {
    height: "100%",
    borderRadius: sizeMetrics.radius,
    backgroundColor: fillColor,
    overflow: "hidden",
  };

  const label: TextStyle = {
    ...typography.label,
    color: variant === "muted" ? colors.textMuted : colors.textPrimary,
  };

  return {
    track,
    fill,
    label,
    stripeColor: colors.stripeLight,
    height: sizeMetrics.height,
  };
}
