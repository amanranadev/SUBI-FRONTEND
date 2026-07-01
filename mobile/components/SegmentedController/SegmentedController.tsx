import React, { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { resolveSegmentedControllerStyles } from "./resolveSegmentedControllerStyles";
import type { SegmentedControllerProps } from "./SegmentedController.types";

const DEFAULT_SIZE = "md" as const;
const DEFAULT_VARIANT = "pill" as const;

export const SegmentedController = memo(function SegmentedController<
  Value extends string = string,
>({
  options,
  value,
  onValueChange,
  size = DEFAULT_SIZE,
  variant = DEFAULT_VARIANT,
  fullWidth = false,
  uppercase = true,
  disabled = false,
  containerStyle,
  itemStyle,
  activeItemStyle,
  labelStyle,
  activeLabelStyle,
  accessibilityLabel,
}: SegmentedControllerProps<Value>) {
  const metrics = useMemo(
    () =>
      resolveSegmentedControllerStyles({
        size,
        variant,
        fullWidth,
      }),
    [fullWidth, size, variant],
  );

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[metrics.track, containerStyle]}
    >
      {options.map((option) => {
        const active = option.value === value;
        const optionDisabled = disabled || option.disabled;
        const displayLabel = uppercase
          ? option.label.toUpperCase()
          : option.label;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{
              selected: active,
              disabled: optionDisabled,
            }}
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            disabled={optionDisabled}
            onPress={() => onValueChange?.(option.value)}
            style={({ pressed }) => [
              metrics.item,
              active ? metrics.activeItem : null,
              optionDisabled ? metrics.disabledItem : null,
              pressed && !optionDisabled ? styles.pressed : null,
              itemStyle,
              active ? activeItemStyle : null,
            ]}
          >
            {option.icon ? (
              <View style={metrics.iconSlot}>{option.icon}</View>
            ) : null}
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                metrics.label,
                active ? metrics.activeLabel : null,
                optionDisabled ? metrics.disabledLabel : null,
                labelStyle,
                active ? activeLabelStyle : null,
              ]}
            >
              {displayLabel}
            </Text>
          </Pressable>
        );
      })}
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
});
