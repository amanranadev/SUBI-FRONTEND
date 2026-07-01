import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

interface ChevronFrontProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
}

function ChevronFront({ height, width, color, ...props }: ChevronFrontProps) {
  return (
    <Svg
      width={width || 11}
      height={height || 18}
      viewBox="0 0 11 18"
      fill="none"
      {...props}
    >
      <Path
        d="M10.5 9c0-.342-.127-.635-.4-.889L2.502.67c-.215-.215-.488-.332-.81-.332C1.047.338.529.846.529 1.5c0 .322.137.605.352.83L7.727 9l-6.846 6.67a1.21 1.21 0 00-.352.83c0 .654.518 1.162 1.162 1.162.323 0 .596-.117.811-.332L10.1 9.898c.273-.263.4-.556.4-.898z"
        fill={color || "#FD4D03"}
      />
    </Svg>
  );
}

export default ChevronFront;
