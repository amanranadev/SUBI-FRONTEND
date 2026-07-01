import React, { memo } from "react";
import Svg, { Path } from "react-native-svg";

import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  type IconSvgProps,
} from "../types";

export const AddIcon = memo(function AddIcon({
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
}: IconSvgProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M3.33331 8H12.6666"
        stroke={color}
        strokeWidth={1.46667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 3.33325V12.6666"
        stroke={color}
        strokeWidth={1.46667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
