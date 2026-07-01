import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function DescriptionIcon({ height, width, ...props }: SvgProps) {
  return (
    <Svg
      width={width || 24}
      height={height || 24}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M17 6.1H3M21 12.1H3M15.1 18H3"
        stroke="#867873"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default DescriptionIcon;
