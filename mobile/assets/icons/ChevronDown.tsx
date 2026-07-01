import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

interface ChevronDownProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
}

function ChevronDown({ height, width, color, ...props }: ChevronDownProps) {
  return (
    <Svg
      width={width || 18}
      height={height || 11}
      viewBox="0 0 18 11"
      fill="none"
      {...props}
    >
      <Path
        d="M9 10.5c-.342 0-.635-.127-.889-.4L.67 2.502c-.215-.215-.332-.488-.332-.81C.338 1.047.846.529 1.5.529c.322 0 .605.137.83.352L9 7.727l6.67-6.846a1.21 1.21 0 01.83-.352c.654 0 1.162.518 1.162 1.162 0 .323-.117.596-.332.811L9.898 10.1c-.263.273-.556.4-.898.4z"
        fill={color || "#FD4D03"}
      />
    </Svg>
  );
}

export default ChevronDown;
