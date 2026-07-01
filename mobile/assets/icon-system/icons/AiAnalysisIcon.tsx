import React, { memo } from "react";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  type IconSvgProps,
} from "../types";

export const AiAnalysisIcon = memo(function AiAnalysisIcon({
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
}: IconSvgProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <G clipPath="url(#aiAnalysisClip)">
        <Path
          d="M12 2.66663H3.99996C3.26358 2.66663 2.66663 3.26358 2.66663 3.99996V12C2.66663 12.7363 3.26358 13.3333 3.99996 13.3333H12C12.7363 13.3333 13.3333 12.7363 13.3333 12V3.99996C13.3333 3.26358 12.7363 2.66663 12 2.66663Z"
          stroke={color}
          strokeWidth={1.33333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M10 6H6V10H10V6Z"
          stroke={color}
          strokeWidth={1.33333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M6 0.666626V2.66663"
          stroke={color}
          strokeWidth={1.33333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M10 0.666626V2.66663"
          stroke={color}
          strokeWidth={1.33333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M6 13.3334V15.3334"
          stroke={color}
          strokeWidth={1.33333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M10 13.3334V15.3334"
          stroke={color}
          strokeWidth={1.33333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M13.3334 6H15.3334"
          stroke={color}
          strokeWidth={1.33333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M13.3334 9.33337H15.3334"
          stroke={color}
          strokeWidth={1.33333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M0.666626 6H2.66663"
          stroke={color}
          strokeWidth={1.33333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M0.666626 9.33337H2.66663"
          stroke={color}
          strokeWidth={1.33333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="aiAnalysisClip">
          <Rect width={16} height={16} fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
});
