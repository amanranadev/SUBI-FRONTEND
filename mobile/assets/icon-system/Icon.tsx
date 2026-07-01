import React, { memo, useMemo } from "react";
import { View } from "react-native";

import { iconRegistry, type IconName } from "./registry";
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE } from "./types";

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
}

function warnMissingIcon(name: string): void {
  if (__DEV__) {
    console.warn(`[Icon] Unknown icon name: "${name}"`);
  }
}

export const Icon = memo(function Icon({
  name,
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
  accessible = true,
  accessibilityLabel,
}: IconProps) {
  const label = useMemo(
    () => accessibilityLabel ?? name.replace(/-/g, " "),
    [accessibilityLabel, name],
  );

  if (!(name in iconRegistry)) {
    warnMissingIcon(name);
    return null;
  }

  const IconComponent = iconRegistry[name];

  return (
    <View
      accessible={accessible}
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      <IconComponent size={size} color={color} />
    </View>
  );
});
