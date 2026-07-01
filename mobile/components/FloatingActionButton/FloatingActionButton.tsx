import React, { memo, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { SubiMark } from "./SubiMark";
import { resolveFloatingActionButtonStyles } from "./resolveFloatingActionButtonStyles";
import type { FloatingActionButtonProps } from "./FloatingActionButton.types";
import { floatingActionButtonTokens } from "./tokens";

const DEFAULT_VARIANT = "brand" as const;
const DEFAULT_SIZE = "md" as const;
const DEFAULT_SHAPE = "rounded" as const;

export const FloatingActionButton = memo(function FloatingActionButton({
  children,
  variant = DEFAULT_VARIANT,
  size = DEFAULT_SIZE,
  shape = DEFAULT_SHAPE,
  disabled = false,
  elevated = true,
  accessibilityLabel = "Open Subi actions",
  testID,
  style,
  onPress,
  ...pressableProps
}: FloatingActionButtonProps) {
  const metrics = useMemo(
    () =>
      resolveFloatingActionButtonStyles({
        variant,
        size,
        shape,
        disabled,
        elevated,
      }),
    [variant, size, shape, disabled, elevated],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.pressable,
        metrics.container,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
      {...pressableProps}
    >
      <View pointerEvents="none" style={styles.content}>
        {children ?? (
          <SubiMark size={metrics.iconSize} color={metrics.iconColor} />
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  pressable: {
    flexShrink: 0,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: floatingActionButtonTokens.motion.pressedOpacity,
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: floatingActionButtonTokens.motion.disabledOpacity,
  },
});
