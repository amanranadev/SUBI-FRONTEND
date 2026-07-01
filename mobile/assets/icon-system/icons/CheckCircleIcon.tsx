import React, { memo } from "react";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  type IconSvgProps,
} from "../types";

export const CheckCircleIcon = memo(function CheckCircleIcon({
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
}: IconSvgProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <G clipPath="url(#checkCircleClip)">
        <Path
          d="M14.6667 7.38662V7.99995C14.6659 9.43757 14.2004 10.8364 13.3396 11.9878C12.4788 13.1393 11.2689 13.9816 9.89028 14.3892C8.51166 14.7968 7.03821 14.7479 5.68969 14.2497C4.34116 13.7515 3.18981 12.8307 2.40735 11.6247C1.62488 10.4186 1.25323 8.99199 1.34783 7.55749C1.44242 6.12299 1.99818 4.7575 2.93223 3.66467C3.86628 2.57183 5.12856 1.81021 6.53083 1.49338C7.9331 1.17656 9.40022 1.32151 10.7134 1.90662"
          stroke={color}
          strokeWidth={1.33333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M14.6667 2.66663L8 9.33996L6 7.33996"
          stroke={color}
          strokeWidth={1.33333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="checkCircleClip">
          <Rect width={16} height={16} fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
});
