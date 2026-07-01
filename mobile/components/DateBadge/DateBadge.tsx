import React, { memo, useCallback, useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import type { DateBadgeProps } from "./DateBadge.types";
import { formatDateParts, isSameCalendarDay } from "./formatDateParts";
import { resolveDateBadgeStyles } from "./resolveDateBadgeStyles";

const DEFAULT_SIZE = "md" as const;
const DEFAULT_VARIANT = "default" as const;

export const DateBadge = memo(function DateBadge({
  date,
  size = DEFAULT_SIZE,
  variant = DEFAULT_VARIANT,
  disabled = false,
  highlightToday = false,
  locale,
  onPress,
  accessibilityLabel,
  testID,
}: DateBadgeProps) {
  const isInteractive = Boolean(onPress) && !disabled;

  const formatted = useMemo(
    () => formatDateParts(date, locale),
    [date, locale],
  );

  const isToday = useMemo(
    () => isSameCalendarDay(date, new Date()),
    [date],
  );

  const metrics = useMemo(
    () =>
      resolveDateBadgeStyles({
        size,
        variant,
        disabled,
        highlightToday,
        isToday,
      }),
    [size, variant, disabled, highlightToday, isToday],
  );

  const resolvedAccessibilityLabel = useMemo(() => {
    if (accessibilityLabel) {
      return accessibilityLabel;
    }
    if (isInteractive) {
      return `${formatted.accessibilityDate}. Tap to select.`;
    }
    return formatted.accessibilityDate;
  }, [accessibilityLabel, formatted.accessibilityDate, isInteractive]);

  const handlePress = useCallback(() => {
    if (!disabled) {
      onPress?.();
    }
  }, [disabled, onPress]);

  const content = (
    <>
      <Text style={metrics.month} accessible={false}>
        {formatted.month}
      </Text>
      <Text style={metrics.day} accessible={false}>
        {formatted.day}
      </Text>
    </>
  );

  if (isInteractive) {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={resolvedAccessibilityLabel}
        accessibilityState={{ disabled }}
        testID={testID}
        style={metrics.container}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={resolvedAccessibilityLabel}
      testID={testID}
      style={metrics.container}
    >
      {content}
    </View>
  );
});
