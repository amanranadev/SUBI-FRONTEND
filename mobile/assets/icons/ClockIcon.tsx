import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function ClockIcon({ height, width, ...props }: SvgProps) {
  return (
    <Svg
      width={width || 24}
      height={height || 24}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M12 21a8 8 0 100-16 8 8 0 000 16z"
        stroke="#867873"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 9v4l2 2M5 3L2 6M22 6l-3-3M6.38 18.7L4 21M17.64 18.67L20 21"
        stroke="#867873"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default ClockIcon;
