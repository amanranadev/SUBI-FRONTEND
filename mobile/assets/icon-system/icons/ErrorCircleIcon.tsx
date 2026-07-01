import React, { memo } from "react";
import Svg, { Path } from "react-native-svg";

import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  type IconSvgProps,
} from "../types";

export const ErrorCircleIcon = memo(function ErrorCircleIcon({
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
}: IconSvgProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path
        d="M20 36.6667C29.2048 36.6667 36.6667 29.2048 36.6667 20C36.6667 10.7953 29.2048 3.33337 20 3.33337C10.7953 3.33337 3.33337 10.7953 3.33337 20C3.33337 29.2048 10.7953 36.6667 20 36.6667Z"
        stroke={color}
        strokeWidth={3.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M25 15L15 25"
        stroke={color}
        strokeWidth={3.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 15L25 25"
        stroke={color}
        strokeWidth={3.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
