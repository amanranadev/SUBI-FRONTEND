import React, { memo } from "react";
import Svg, { Path } from "react-native-svg";

interface SubiMarkProps {
  size: number;
  color: string;
}

const VIEW_BOX = "-12 0 282 268";
const S_PATH =
  "M242.319 100.541C210.48 85.5958 171.886 78.9919 136.658 81.5176C130.715 81.9424 115.937 84.0588 114.622 91.2574C112.912 100.626 126.731 102.125 133.176 103.144C177.689 110.189 252.362 106.643 257.608 168.033C262.769 228.325 198.936 252.678 149.37 256.988C100.013 261.275 45.2095 252.014 2.95568 225.799V160.231C26.3458 175.602 55.5776 185.218 83.3239 189.041C95.3168 190.694 130.127 193.761 139.281 186.338C147.18 179.927 140.286 172.126 132.812 169.523C115.519 163.499 88.33 163.213 69.1335 158.887C38.1298 151.89 3.66752 135.739 0.363659 99.9699C-8.48017 4.19407 145.587 6.70433 206.441 22.8317C218.883 26.1298 231.061 30.5247 242.327 36.781V100.541H242.319Z";

export const SubiMark = memo(function SubiMark({ size, color }: SubiMarkProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={VIEW_BOX}
      fill="none"
      accessibilityRole="image"
    >
      <Path d={S_PATH} fill={color} />
    </Svg>
  );
});
