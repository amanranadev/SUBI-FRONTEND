import React, { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/assets/icon-system";
import { SubiLogo } from "@/assets/icon-system/SubiLogo";

import { resolveAppHeaderStyles } from "./resolveAppHeaderStyles";
import type { AppHeaderProps } from "./AppHeader.types";
import { appHeaderTokens } from "./tokens";

const DEFAULT_SIZE = "md" as const;
const DEFAULT_VARIANT = "default" as const;

export const AppHeader = memo(function AppHeader({
  title,
  showBackButton = false,
  onBackPress,
  backAccessibilityLabel = "Go back",
  rightContent,
  size = DEFAULT_SIZE,
  variant = DEFAULT_VARIANT,
  disabled = false,
  containerStyle,
  testID,
}: AppHeaderProps) {
  const metrics = useMemo(
    () =>
      resolveAppHeaderStyles({
        size,
        variant,
        disabled,
      }),
    [disabled, size, variant],
  );

  return (
    <View
      style={[metrics.container, containerStyle]}
      testID={testID}
      accessibilityRole="header"
    >
      <View style={metrics.leftGroup}>
        {showBackButton ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={backAccessibilityLabel}
            disabled={disabled || !onBackPress}
            onPress={onBackPress}
            style={({ pressed }) => [
              metrics.backButton,
              pressed && !disabled ? styles.backButtonPressed : null,
              disabled ? styles.disabled : null,
            ]}
          >
            <Icon
              name="arrow-left"
              size={metrics.backIconSize}
              color={metrics.backIconColor}
              accessible={false}
            />
          </Pressable>
        ) : null}

        <SubiLogo
          width={metrics.logoWidth}
          height={metrics.logoHeight}
          accessible={false}
        />

        {title ? (
          <Text numberOfLines={1} style={metrics.title}>
            {title}
          </Text>
        ) : null}
      </View>

      {rightContent ? (
        <View style={metrics.rightSlot}>{rightContent}</View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  backButtonPressed: {
    backgroundColor: appHeaderTokens.colors.backButtonPressed,
  },
  disabled: {
    opacity: 0.62,
  },
});
