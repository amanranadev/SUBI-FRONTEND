import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

export function Microphone({ width, height, color, ...props }: SvgProps) {
  return (
    <Svg
      width={width || 25}
      height={height || 25}
      viewBox="0 0 25 25"
      fill="none"
      {...props}
    >
      <Path
        d="M12.945 19.873v3M19.944 10.875v2a6.998 6.998 0 11-13.997 0v-2"
        stroke={color || "#867873"}
        strokeWidth={1.99951}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.945 5.876a3 3 0 00-5.999 0v6.998a3 3 0 005.999 0V5.876z"
        stroke={color || "#867873"}
        strokeWidth={1.99951}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default Microphone;
