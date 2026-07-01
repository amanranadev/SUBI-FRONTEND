import React, { memo } from "react";
import Svg, { Path } from "react-native-svg";

import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  type IconSvgProps,
} from "../types";

export const FilterIcon = memo(function FilterIcon({
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
}: IconSvgProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M18.3334 2.5H1.66669L8.33335 10.3833V15.8333L11.6667 17.5V10.3833L18.3334 2.5Z"
        stroke={color}
        strokeWidth={1.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
