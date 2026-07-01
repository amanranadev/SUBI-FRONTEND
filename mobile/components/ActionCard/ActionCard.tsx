import React, { memo, useCallback, useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { actionCardStyles } from "./ActionCard.styles";
import type { ActionCardProps } from "./ActionCard.types";

function ActionCardComponent({
  title,
  description,
  icon,
  onPress,
  selected = false,
  disabled = false,
  testID,
}: ActionCardProps) {
  const isPressDisabled = disabled || onPress == null;

  const accessibilityLabel = useMemo(() => {
    const parts = [title];
    if (description) {
      parts.push(description);
    }
    if (selected) {
      parts.push("Selected");
    }
    return parts.join(". ");
  }, [description, selected, title]);

  const handlePress = useCallback(() => {
    if (isPressDisabled) {
      return;
    }
    onPress?.();
  }, [isPressDisabled, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={isPressDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{
        selected,
        disabled: isPressDisabled,
      }}
      testID={testID}
      style={actionCardStyles.pressable}
    >
      <View
        style={[
          actionCardStyles.card,
          selected ? actionCardStyles.cardSelected : null,
          disabled ? actionCardStyles.cardDisabled : null,
        ]}
      >
        <View style={actionCardStyles.iconCircle}>{icon}</View>

        <View style={actionCardStyles.textBlock}>
          <Text style={actionCardStyles.title}>{title}</Text>
          {description ? (
            <Text style={actionCardStyles.description}>{description}</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export const ActionCard = memo(ActionCardComponent);
ActionCard.displayName = "ActionCard";
