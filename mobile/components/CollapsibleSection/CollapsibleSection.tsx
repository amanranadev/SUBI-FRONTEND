import { Icon } from "@/assets/icon-system";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  collapsibleSectionStyles,
  collapsibleSectionTokens,
} from "./CollapsibleSection.styles";
import type { CollapsibleSectionProps } from "./CollapsibleSection.types";

function CollapsibleSectionComponent({
  title,
  children,
  badge,
  headerAccessory,
  footer,
  footerStyle,
  expanded,
  defaultExpanded = false,
  disabled = false,
  onExpandedChange,
  testID,
}: CollapsibleSectionProps) {
  const isControlled = expanded !== undefined;
  const [uncontrolledExpanded, setUncontrolledExpanded] =
    useState(defaultExpanded);

  const isExpanded = isControlled ? expanded : uncontrolledExpanded;

  const chevronRotation = useSharedValue(isExpanded ? 180 : 0);

  useEffect(() => {
    chevronRotation.value = withTiming(isExpanded ? 180 : 0, {
      duration: collapsibleSectionTokens.chevron.durationMs,
    });
  }, [chevronRotation, isExpanded]);

  const handleToggle = useCallback(() => {
    if (disabled) {
      return;
    }

    const nextExpanded = !isExpanded;

    if (!isControlled) {
      setUncontrolledExpanded(nextExpanded);
    }

    onExpandedChange?.(nextExpanded);
  }, [disabled, isControlled, isExpanded, onExpandedChange]);

  const accessibilityLabel = useMemo(
    () => `${title}, ${isExpanded ? "expanded" : "collapsed"}`,
    [isExpanded, title],
  );

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  return (
    <View
      style={collapsibleSectionStyles.container}
      testID={testID}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{
          expanded: isExpanded,
          disabled,
        }}
        disabled={disabled}
        onPress={handleToggle}
        style={[
          collapsibleSectionStyles.header,
          disabled ? collapsibleSectionStyles.headerDisabled : null,
        ]}
      >
        <View style={collapsibleSectionStyles.leftSection}>
          <Text
            style={[
              collapsibleSectionStyles.title,
              collapsibleSectionStyles.titleText,
              disabled ? collapsibleSectionStyles.titleDisabled : null,
            ]}
          >
            {title}
          </Text>
          {badge}
        </View>

        <View style={collapsibleSectionStyles.rightSection}>
          {headerAccessory}
          <Animated.View
            style={chevronAnimatedStyle}
            accessible={false}
            importantForAccessibility="no-hide-descendants"
          >
            <Icon
              name="chevron-down"
              size={collapsibleSectionTokens.chevron.size}
              color={
                disabled
                  ? collapsibleSectionTokens.colors.disabled
                  : collapsibleSectionTokens.colors.chevron
              }
              accessible={false}
            />
          </Animated.View>
        </View>
      </Pressable>

      {isExpanded ? (
        <View style={collapsibleSectionStyles.content}>{children}</View>
      ) : null}

      {isExpanded && footer ? (
        <View style={[collapsibleSectionStyles.footer, footerStyle]}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}

export const CollapsibleSection = memo(CollapsibleSectionComponent);
CollapsibleSection.displayName = "CollapsibleSection";
