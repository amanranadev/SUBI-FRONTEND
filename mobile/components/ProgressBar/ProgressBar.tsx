import React, { memo, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import {
  clampProgressValue,
  resolveProgressBarStyles,
} from "./resolveProgressBarStyles";
import type { ProgressBarProps } from "./ProgressBar.types";
import { progressBarTokens } from "./tokens";

const DEFAULT_VARIANT = "default" as const;
const DEFAULT_SIZE = "md" as const;
const DEFAULT_LABEL_POSITION = "none" as const;
const STRIPE_COUNT = 24;

function renderStripes(stripeColor: string) {
  return (
    <View pointerEvents="none" style={styles.stripeLayer}>
      {Array.from({ length: STRIPE_COUNT }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.stripe,
            {
              backgroundColor: stripeColor,
              left:
                index *
                (progressBarTokens.spacing.stripeWidth +
                  progressBarTokens.spacing.stripeGap),
            },
          ]}
        />
      ))}
    </View>
  );
}

export const ProgressBar = memo(function ProgressBar({
  value,
  variant = DEFAULT_VARIANT,
  size = DEFAULT_SIZE,
  striped = false,
  animated = false,
  showLabel = false,
  labelPosition = DEFAULT_LABEL_POSITION,
  label,
  accessibilityLabel,
  testID,
  style,
  trackStyle,
  fillStyle,
  labelStyle,
}: ProgressBarProps) {
  const safeValue = clampProgressValue(value);
  const animatedValue = useRef(new Animated.Value(safeValue)).current;

  const metrics = useMemo(
    () => resolveProgressBarStyles({ variant, size }),
    [variant, size],
  );

  useEffect(() => {
    if (!animated) {
      animatedValue.setValue(safeValue);
      return;
    }

    Animated.timing(animatedValue, {
      toValue: safeValue,
      duration: progressBarTokens.motion.durationMs,
      useNativeDriver: false,
    }).start();
  }, [animated, animatedValue, safeValue]);

  const labelText = label ?? `${Math.round(safeValue)}%`;
  const shouldRenderLabel = showLabel && labelPosition !== "none";

  const fillWidth = animated
    ? animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: ["0%", "100%"],
      })
    : `${safeValue}%`;

  const progressNode = (
    <View
      accessibilityLabel={
        accessibilityLabel ?? `Progress ${Math.round(safeValue)} percent`
      }
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(safeValue) }}
      testID={testID}
      style={[styles.track, metrics.track, trackStyle]}
    >
      <Animated.View
        style={[
          styles.fill,
          metrics.fill,
          { width: fillWidth } as ViewStyle,
          fillStyle,
        ]}
      >
        {striped ? renderStripes(metrics.stripeColor) : null}
      </Animated.View>
    </View>
  );

  if (labelPosition === "right" && shouldRenderLabel) {
    return (
      <View style={[styles.rightLabelContainer, style]}>
        {progressNode}
        <Text style={[styles.label, metrics.label, labelStyle]}>
          {labelText}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {labelPosition === "top" && shouldRenderLabel ? (
        <Text style={[styles.label, metrics.label, labelStyle]}>
          {labelText}
        </Text>
      ) : null}
      {progressNode}
      {labelPosition === "bottom" && shouldRenderLabel ? (
        <Text style={[styles.label, metrics.label, labelStyle]}>
          {labelText}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: progressBarTokens.spacing.labelGap,
  },
  rightLabelContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: progressBarTokens.spacing.labelGap,
  },
  track: {
    flexShrink: 1,
  },
  fill: {
    minWidth: 0,
  },
  label: {
    flexShrink: 0,
  },
  stripeLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  stripe: {
    position: "absolute",
    top: -8,
    width: progressBarTokens.spacing.stripeWidth,
    height: progressBarTokens.spacing.stripeHeight,
    opacity: 0.65,
    transform: [{ rotate: "30deg" }],
  },
});
