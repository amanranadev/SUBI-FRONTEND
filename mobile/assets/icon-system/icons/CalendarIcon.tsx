import React, { memo } from "react";
import Svg, { Path } from "react-native-svg";

import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  type IconSvgProps,
} from "../types";

export const CalendarIcon = memo(function CalendarIcon({
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
}: IconSvgProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M11.0833 2.33325H2.91667C2.27233 2.33325 1.75 2.85559 1.75 3.49992V11.6666C1.75 12.3109 2.27233 12.8333 2.91667 12.8333H11.0833C11.7277 12.8333 12.25 12.3109 12.25 11.6666V3.49992C12.25 2.85559 11.7277 2.33325 11.0833 2.33325Z"
        stroke={color}
        strokeWidth={1.05}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.33331 1.16675V3.50008"
        stroke={color}
        strokeWidth={1.05}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.66669 1.16675V3.50008"
        stroke={color}
        strokeWidth={1.05}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1.75 5.83325H12.25"
        stroke={color}
        strokeWidth={1.05}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
