import React, { memo, useMemo } from "react";
import { View } from "react-native";

import type { DividerProps } from "./Divider.types";
import { resolveDividerStyles } from "./resolveDividerStyles";

const DEFAULT_VARIANT = "solid" as const;
const DEFAULT_ORIENTATION = "horizontal" as const;
const DEFAULT_THICKNESS = 1 as const;

export const Divider = memo(function Divider({
  variant = DEFAULT_VARIANT,
  orientation = DEFAULT_ORIENTATION,
  thickness = DEFAULT_THICKNESS,
  inset = false,
  testID,
}: DividerProps) {
  const metrics = useMemo(
    () =>
      resolveDividerStyles({
        variant,
        orientation,
        thickness,
        inset,
      }),
    [variant, orientation, thickness, inset],
  );

  return (
    <View
      style={metrics.container}
      testID={testID}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    />
  );
});
