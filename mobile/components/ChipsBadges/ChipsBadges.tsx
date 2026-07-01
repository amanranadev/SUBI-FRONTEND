import React, { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { resolveBadgeStyles, resolveChipStyles } from "./resolveChipsBadgesStyles";
import type { BadgeProps, ChipProps } from "./ChipsBadges.types";

const DEFAULT_CHIP_VARIANT = "neutral" as const;
const DEFAULT_CHIP_SIZE = "sm" as const;
const DEFAULT_BADGE_VARIANT = "neutral" as const;
const DEFAULT_BADGE_SIZE = "md" as const;

export const Chip = memo(function Chip({
  label,
  variant = DEFAULT_CHIP_VARIANT,
  size = DEFAULT_CHIP_SIZE,
  selected = false,
  leftIcon,
  rightIcon,
  uppercase = true,
  disabled = false,
  containerStyle,
  textStyle,
  accessibilityLabel,
  onPress,
  ...pressableProps
}: ChipProps) {
  const effectiveVariant = selected ? "selected" : variant;
  const metrics = useMemo(
    () =>
      resolveChipStyles({
        variant: effectiveVariant,
        size,
        disabled,
      }),
    [disabled, effectiveVariant, size],
  );
  const displayLabel = uppercase ? label.toUpperCase() : label;
  const content = (
    <>
      {leftIcon ? <View style={metrics.iconSlot}>{leftIcon}</View> : null}
      <Text
        numberOfLines={1}
        style={[styles.label, metrics.text, textStyle]}
      >
        {displayLabel}
      </Text>
      {rightIcon ? <View style={metrics.iconSlot}>{rightIcon}</View> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        {...pressableProps}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          metrics.container,
          pressed && !disabled ? styles.pressed : null,
          containerStyle,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? label}
      style={[metrics.container, disabled ? styles.disabledView : null, containerStyle]}
    >
      {content}
    </View>
  );
});

export const Badge = memo(function Badge({
  label,
  variant = DEFAULT_BADGE_VARIANT,
  size = DEFAULT_BADGE_SIZE,
  leftIcon,
  rightIcon,
  uppercase = true,
  containerStyle,
  textStyle,
  accessibilityLabel,
}: BadgeProps) {
  const metrics = useMemo(
    () =>
      resolveBadgeStyles({
        variant,
        size,
      }),
    [size, variant],
  );
  const displayLabel = uppercase ? label.toUpperCase() : label;

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? label}
      style={[metrics.container, containerStyle]}
    >
      {leftIcon ? <View style={metrics.iconSlot}>{leftIcon}</View> : null}
      <Text
        numberOfLines={1}
        style={[styles.label, metrics.text, textStyle]}
      >
        {displayLabel}
      </Text>
      {rightIcon ? <View style={metrics.iconSlot}>{rightIcon}</View> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: {
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.72,
  },
  disabledView: {
    opacity: 0.72,
  },
});
