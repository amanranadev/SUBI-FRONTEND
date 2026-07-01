import * as React from "react";
import Svg, { G, LinearGradient, Path, Stop, SvgProps } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: style */

function MessageIcon({ width, height, ...props }: SvgProps) {
  return (
    <Svg
      id="Layer_1"
      width={width || 28}
      height={height || 28}
      viewBox="0 0 100 100"
      {...props}
    >
      <G id="Symbols_6_">
        <G id="Graphics-_x2F_-App-Icons-_x2F_-Messages">
          <G id="Messages-Icon">
            <LinearGradient
              gradientTransform="matrix(60 0 0 -60 25311 44901)"
              gradientUnits="userSpaceOnUse"
              id="Background_13_"
              x1={-421.0169}
              x2={-421.0169}
              y1={748.2662}
              y2={746.7667}
            >
              <Stop offset={0} stopColor="#67ff81" />
              <Stop offset={1} stopColor="#01b41f" />
            </LinearGradient>
            <Path
              d="M63.6 5c9 0 13.5 0 18.4 1.5 5.3 1.9 9.5 6.1 11.4 11.4C95 22.8 95 27.4 95 36.4v27.2c0 9 0 13.5-1.5 18.4-1.9 5.3-6.1 9.5-11.4 11.4-5 1.6-9.5 1.6-18.5 1.6H36.4c-9 0-13.5 0-18.4-1.5-5.4-2-9.5-6.1-11.5-11.5C5 77.2 5 72.7 5 63.6V36.4c0-9 0-13.5 1.5-18.4 2-5.3 6.1-9.5 11.5-11.4C22.8 5 27.3 5 36.4 5h27.2z"
              id="Background_5_"
              fill="url(#Background_13_)"
            />
            <Path
              d="M43.5 75.7c2.1.3 4.2.5 6.4.5 18.2 0 33-12.3 33-27.4S68.2 21.5 50 21.5 17 33.8 17 48.9c0 9.9 6.3 18.5 15.7 23.3v1c0 2.9-4.8 6.7-4.5 6.7 4.8 0 8.2-3 10.5-3.7 1.9-.5 3-.6 4.8-.5z"
              fill="#fff"
            />
          </G>
        </G>
      </G>
    </Svg>
  );
}

export default MessageIcon;
