import React, { memo } from "react";
import Svg, { Path } from "react-native-svg";

import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  type IconSvgProps,
} from "../types";

export const DocumentUploadIcon = memo(function DocumentUploadIcon({
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
}: IconSvgProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 42 42" fill="none">
      <Path
        d="M24.5 3.5V10.5C24.5 11.4283 24.8687 12.3185 25.5251 12.9749C26.1815 13.6313 27.0717 14 28 14H35"
        stroke={color}
        strokeWidth={3.15}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M26.25 3.5H10.5C9.57174 3.5 8.6815 3.86875 8.02513 4.52513C7.36875 5.1815 7 6.07174 7 7V35C7 35.9283 7.36875 36.8185 8.02513 37.4749C8.6815 38.1313 9.57174 38.5 10.5 38.5H31.5C32.4283 38.5 33.3185 38.1313 33.9749 37.4749C34.6313 36.8185 35 35.9283 35 35V12.25L26.25 3.5Z"
        stroke={color}
        strokeWidth={3.15}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 31.5V21"
        stroke={color}
        strokeWidth={3.15}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.75 26.25L21 21L26.25 26.25"
        stroke={color}
        strokeWidth={3.15}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
