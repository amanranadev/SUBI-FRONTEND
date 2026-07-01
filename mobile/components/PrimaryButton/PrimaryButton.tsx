import React, { memo, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { baseButtonStyles, resolveButtonStyles } from "./resolveButtonStyles";
import type { PrimaryButtonProps } from "./PrimaryButton.types";

const DEFAULT_VARIANT = "primary" as const;
const DEFAULT_SIZE = "lg" as const;
const DEFAULT_SHAPE = "pill" as const;

function isIconOnlyContent(
  children: PrimaryButtonProps["children"],
  leftIcon: PrimaryButtonProps["leftIcon"],
  rightIcon: PrimaryButtonProps["rightIcon"],
): boolean {
  return !children && Boolean(leftIcon) && !rightIcon;
}

function renderChildContent(
  children: PrimaryButtonProps["children"],
  textStyle: TextStyle,
): React.ReactNode {
  if (children === null || children === undefined) {
    return null;
  }
  if (typeof children === "string" || typeof children === "number") {
    return <Text style={[baseButtonStyles.label, textStyle]}>{children}</Text>;
  }
  return children;
}

export const PrimaryButton = memo(function PrimaryButton({
  children,
  variant = DEFAULT_VARIANT,
  size = DEFAULT_SIZE,
  shape = DEFAULT_SHAPE,
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  elevated = false,
  onPress,
  accessibilityLabel,
  testID,
  style,
  ...pressableProps
}: PrimaryButtonProps) {
  const isIconOnly = variant === "icon-only" || isIconOnlyContent(children, leftIcon, rightIcon);
  const isDisabled = disabled || loading;

  const metrics = useMemo(
    () =>
      resolveButtonStyles({
        variant,
        size,
        shape,
        disabled: isDisabled && variant !== "muted",
        elevated,
        fullWidth,
        isIconOnly,
      }),
    [variant, size, shape, isDisabled, elevated, fullWidth, isIconOnly],
  );

  const textStyle = useMemo<TextStyle>(
    () => ({
      fontFamily: metrics.text.fontFamily,
      fontSize: metrics.text.fontSize,
      lineHeight: metrics.text.lineHeight,
      letterSpacing: metrics.text.letterSpacing,
      color: metrics.text.color,
      ...(metrics.text.textTransform
        ? { textTransform: metrics.text.textTransform }
        : {}),
    }),
    [metrics.text],
  );

  const pressableStyle = useMemo(
    () => [
      baseButtonStyles.pressable,
      fullWidth && baseButtonStyles.pressableFullWidth,
      metrics.container,
      style,
    ],
    [fullWidth, metrics.container, style],
  );

  const contentRowStyle = useMemo(
    () => [baseButtonStyles.contentRow, { gap: metrics.gap }],
    [metrics.gap],
  );

  const defaultAccessibilityLabel = useMemo(() => {
    if (accessibilityLabel) {
      return accessibilityLabel;
    }
    if (typeof children === "string") {
      return children;
    }
    return undefined;
  }, [accessibilityLabel, children]);

  const showIcons = !loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={defaultAccessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        pressableStyle,
        pressed && !isDisabled ? pressedStyle : null,
      ]}
      {...pressableProps}
    >
      <View style={contentRowStyle}>
        {loading ? (
          <View style={baseButtonStyles.loadingSlot}>
            <ActivityIndicator color={metrics.indicatorColor} size="small" />
          </View>
        ) : null}
        {showIcons && leftIcon ? (
          <View style={baseButtonStyles.iconSlot}>{leftIcon}</View>
        ) : null}
        {!loading ? renderChildContent(children, textStyle) : null}
        {showIcons && rightIcon ? (
          <View style={baseButtonStyles.iconSlot}>{rightIcon}</View>
        ) : null}
      </View>
    </Pressable>
  );
});

const PRESSED_OPACITY = 0.9;

const pressedStyle: ViewStyle = {
  opacity: PRESSED_OPACITY,
};
