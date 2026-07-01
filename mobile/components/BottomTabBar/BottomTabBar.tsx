import { Ionicons } from "@expo/vector-icons";
import React, { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { resolveBottomTabBarStyles } from "./resolveBottomTabBarStyles";
import type { BottomTabBarProps } from "./BottomTabBar.types";

const DEFAULT_SIZE = "md" as const;

export const BottomTabBar = memo(function BottomTabBar<
  Value extends string = string,
>({
  items,
  value,
  onValueChange,
  size = DEFAULT_SIZE,
  showLabels = true,
  showHomeIndicator = true,
  elevated = true,
  disabled = false,
  containerStyle,
  tabsStyle,
  itemStyle,
  labelStyle,
  activeLabelStyle,
  accessibilityLabel = "Bottom navigation",
}: BottomTabBarProps<Value>) {
  const metrics = useMemo(
    () =>
      resolveBottomTabBarStyles({
        size,
        elevated,
        showLabels,
      }),
    [elevated, showLabels, size],
  );

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[metrics.container, containerStyle]}
    >
      <View style={metrics.divider} />
      <View style={[metrics.tabs, tabsStyle]}>
        {items.map((item) => {
          const active = item.value === value;
          const itemDisabled = disabled || item.disabled;
          const iconName = active && item.activeIconName
            ? item.activeIconName
            : item.iconName;
          const iconColor = itemDisabled
            ? metrics.disabledIconColor
            : active
              ? metrics.activeIconColor
              : metrics.inactiveIconColor;

          return (
            <Pressable
              key={item.value}
              accessibilityRole="tab"
              accessibilityState={{
                selected: active,
                disabled: itemDisabled,
              }}
              accessibilityLabel={item.accessibilityLabel ?? item.label}
              disabled={itemDisabled}
              onPress={() => onValueChange?.(item.value)}
              style={({ pressed }) => [
                metrics.item,
                pressed && !itemDisabled ? styles.pressed : null,
                itemDisabled ? styles.disabled : null,
                itemStyle,
              ]}
            >
              <View
                style={[
                  metrics.iconBackground,
                  active ? metrics.activeIconBackground : null,
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={metrics.iconSize}
                  color={iconColor}
                />
                {item.badge != null ? (
                  <View style={metrics.badge}>
                    <Text style={metrics.badgeText}>{item.badge}</Text>
                  </View>
                ) : null}
              </View>
              {showLabels ? (
                <Text
                  numberOfLines={1}
                  style={[
                    metrics.label,
                    active ? metrics.activeLabel : null,
                    itemDisabled ? metrics.disabledLabel : null,
                    labelStyle,
                    active ? activeLabelStyle : null,
                  ]}
                >
                  {item.label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      {showHomeIndicator ? <View style={metrics.homeIndicator} /> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.62,
  },
});
