import React, { memo } from "react";
import Svg, { Path } from "react-native-svg";

import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  type IconSvgProps,
} from "../types";

export const EditIcon = memo(function EditIcon({
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
}: IconSvgProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <Path
        d="M7.5 2.50007C7.62734 2.34959 8.78485 1.2271 8.96251 1.14041C9.14016 1.05373 9.33405 1.00474 9.53182 0.996581C9.72959 0.988421 9.92691 1.02126 10.1112 1.09302C10.2955 1.16477 10.4627 1.27386 10.6022 1.41333C10.7416 1.55281 10.8503 1.7196 10.9213 1.90309C10.9922 2.08658 11.0239 2.28274 11.0143 2.47906C11.0047 2.67539 10.954 2.86757 10.8654 3.04336C10.7769 3.21915 9.65244 4.37469 9.5 4.50007M7.5 2.50007L1.75 8.25007L1 11.0001L3.75 10.2501L9.5 4.50007M7.5 2.50007L9.5 4.50007"
        stroke={color}
        strokeWidth={0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
