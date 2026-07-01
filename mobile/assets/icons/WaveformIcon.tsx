import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

interface WaveformIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
}

function WaveformIcon({ height, width, color, ...props }: WaveformIconProps) {
  return (
    <Svg
      width={width || 48}
      height={height || 48}
      viewBox="0 0 48 48"
      fill="none"
      {...props}
    >
      <Path
        d="M4 20V26"
        stroke={color || "white"}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 12V34"
        stroke={color || "white"}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20 6V42"
        stroke={color || "white"}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M28 16V30"
        stroke={color || "white"}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M36 10V36"
        stroke={color || "white"}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M44 20V26"
        stroke={color || "white"}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default WaveformIcon;
