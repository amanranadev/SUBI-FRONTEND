import * as React from "react";
import Svg, { ClipPath, Defs, G, Path, SvgProps } from "react-native-svg";

function CircleCheck({ width, height, color, ...props }: SvgProps) {
  return (
    <Svg
      width={width || 17}
      height={height || 17}
      viewBox="0 0 17 17"
      fill="none"
      {...props}
    >
      <G
        clipPath="url(#clip0_483_5418)"
        stroke={color || "#867873"}
        strokeWidth={1.33328}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M8.57 15.353a6.666 6.666 0 100-13.333 6.666 6.666 0 000 13.333z" />
        <Path d="M6.57 8.687l1.333 1.333 2.666-2.666" />
      </G>
      <Defs>
        <ClipPath id="clip0_483_5418">
          <Path
            fill="#fff"
            transform="translate(.57 .688)"
            d="M0 0H15.9994V15.9994H0z"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default CircleCheck;
