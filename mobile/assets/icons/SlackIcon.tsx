import * as React from "react";
import Svg, { ClipPath, Defs, G, Path, SvgProps } from "react-native-svg";

function SlackIcon({ width, height, ...props }: SvgProps) {
  return (
    <Svg
      width={width || 27}
      height={height || 27}
      viewBox="0 0 27 27"
      fill="none"
      {...props}
    >
      <G clipPath="url(#clip0_539_4273)">
        <Path
          d="M23.532 12.539a2.5 2.5 0 10-2.501-2.501v2.5h2.501zm-7.003 0a2.501 2.501 0 002.501-2.501V3.035a2.501 2.501 0 00-5.002 0v7.003a2.501 2.501 0 002.501 2.5z"
          fill="#2EB67D"
        />
        <Path
          d="M2.523 14.54a2.5 2.5 0 102.501 2.5v-2.5h-2.5zm7.003 0a2.501 2.501 0 00-2.5 2.501v7.003a2.501 2.501 0 105.001 0V17.04a2.501 2.501 0 00-2.5-2.501z"
          fill="#E01E5A"
        />
        <Path
          d="M14.028 24.044a2.5 2.5 0 102.501-2.501h-2.5v2.501zm0-7.003a2.501 2.501 0 002.501 2.501h7.003a2.501 2.501 0 000-5.002h-7.003a2.501 2.501 0 00-2.5 2.501z"
          fill="#ECB22E"
        />
        <Path
          d="M12.027 3.035a2.5 2.5 0 10-2.5 2.501h2.5V3.035zm0 7.003a2.501 2.501 0 00-2.501-2.501H2.523a2.501 2.501 0 000 5.002h7.003a2.501 2.501 0 002.501-2.5z"
          fill="#36C5F0"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_539_4273">
          <Path
            fill="#fff"
            transform="translate(.022 .534)"
            d="M0 0H26.0106V26.0106H0z"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SlackIcon;
