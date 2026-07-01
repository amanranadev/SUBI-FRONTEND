import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function AddressIcon({ height, width, ...props }: SvgProps) {
  return (
    <Svg
      width={width || 24}
      height={height || 24}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0z"
        stroke="#867873"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 13a3 3 0 100-6 3 3 0 000 6z"
        stroke="#867873"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default AddressIcon;
