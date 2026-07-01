import * as React from "react";
import Svg, { ClipPath, Defs, G, Path, SvgProps } from "react-native-svg";

function MailIcon({ width, height, ...props }: SvgProps) {
  return (
    <Svg
      width={width || 12}
      height={height || 12}
      viewBox="0 0 12 12"
      fill="none"
      {...props}
    >
      <G
        clipPath="url(#clip0_542_5871)"
        stroke="#0A0A0A"
        strokeWidth={0.999719}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M10.997 3.499L6.503 6.362a1 1 0 01-1.005 0L1 3.499" />
        <Path d="M9.997 1.999H2a1 1 0 00-1 1v5.998a1 1 0 001 1h7.998a1 1 0 001-1V2.999a1 1 0 00-1-1z" />
      </G>
      <Defs>
        <ClipPath id="clip0_542_5871">
          <Path fill="#fff" d="M0 0H11.9966V11.9966H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default MailIcon;
export type MailIconProps = SvgProps;
