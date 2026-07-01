import React, { memo } from "react";
import Svg, { Path } from "react-native-svg";

import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  type IconSvgProps,
} from "../types";

export const StarIcon = memo(function StarIcon({
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
}: IconSvgProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 15 15" fill="none">
      <Path
        d="M7.5 1.875L6.305 5.50812C6.24384 5.69407 6.13987 5.86305 6.00146 6.00146C5.86305 6.13987 5.69407 6.24384 5.50812 6.305L1.875 7.5L5.50812 8.695C5.69407 8.75616 5.86305 8.86013 6.00146 8.99854C6.13987 9.13695 6.24384 9.30593 6.305 9.49188L7.5 13.125L8.695 9.49188C8.75616 9.30593 8.86013 9.13695 8.99854 8.99854C9.13695 8.86013 9.30593 8.75616 9.49188 8.695L13.125 7.5L9.49188 6.305C9.30593 6.24384 9.13695 6.13987 8.99854 6.00146C8.86013 5.86305 8.75616 5.69407 8.695 5.50812L7.5 1.875Z"
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
