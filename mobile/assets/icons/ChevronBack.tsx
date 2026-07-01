import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
interface ChevronBackProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
}
function ChevronBack({ height, width, color, ...props }: ChevronBackProps) {
  return (
    <Svg
      width={width || 11}
      height={height || 18}
      viewBox="0 0 11 18"
      fill="none"
      {...props}
    >
      <Path
        d="M.5 9c0 .342.127.635.4.889l7.598 7.441c.215.215.488.332.81.332.645 0 1.163-.508 1.163-1.162 0-.322-.137-.605-.352-.83L3.273 9l6.846-6.67a1.21 1.21 0 00.352-.83c0-.654-.518-1.162-1.162-1.162-.323 0-.596.117-.811.332L.9 8.102C.627 8.365.5 8.658.5 9z"
        fill={color || "#FD4D03"}
      />
    </Svg>
  );
}

export default ChevronBack;
