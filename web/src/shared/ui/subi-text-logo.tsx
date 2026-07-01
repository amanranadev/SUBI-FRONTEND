"use client";

import { type SVGProps } from "react";

const S_PATH =
  "M242.319 100.541C210.48 85.5958 171.886 78.9919 136.658 81.5176C130.715 81.9424 115.937 84.0588 114.622 91.2574C112.912 100.626 126.731 102.125 133.176 103.144C177.689 110.189 252.362 106.643 257.608 168.033C262.769 228.325 198.936 252.678 149.37 256.988C100.013 261.275 45.2095 252.014 2.95568 225.799V160.231C26.3458 175.602 55.5776 185.218 83.3239 189.041C95.3168 190.694 130.127 193.761 139.281 186.338C147.18 179.927 140.286 172.126 132.812 169.523C115.519 163.499 88.33 163.213 69.1335 158.887C38.1298 151.89 3.66752 135.739 0.363659 99.9699C-8.48017 4.19407 145.587 6.70433 206.441 22.8317C218.883 26.1298 231.061 30.5247 242.327 36.781V100.541H242.319Z";

const OTHER_PATHS = [
  "M662.096 15.525V84.2596C664.533 84.4372 665.368 80.722 667.071 78.822C714.245 26.2997 804.966 42.5507 824.828 112.297C833.579 143.03 831.807 183.295 816.688 211.796C785.785 270.08 700.024 273.386 662.088 220.817V249.759H557.827V15.525H662.088H662.096ZM693.625 116.167C669.044 119.094 657.569 141.748 663.651 164.549C672.688 198.441 725.929 197.082 734.765 164.433C742.433 136.118 723.074 112.66 693.625 116.159V116.167Z",
  "M376.501 57.1257V157.961C376.501 162.487 379.735 173.509 382.451 177.348C391.883 190.656 416.844 189.852 425.633 176.228C427.351 173.563 430.895 164.425 430.895 161.583V57.1257H536.061V249.759H430.895V207.254L420.751 225.629C377.654 281.658 270.081 262.966 272.193 182.422L272.232 57.1257H376.493H376.501Z",
  "M952.216 87.8743H847.955V249.759H952.216V87.8743Z",
  "M888.561 0.417061C910.481 -1.68383 952.332 3.48343 955.737 31.4515C962.151 84.1437 848.458 84.4372 843.514 39.3994C840.86 15.2005 868.281 2.36347 888.561 0.417061Z",
];

/** ViewBox bounds for the S only: minX minY width height (S spans ~-10 to 265 in x, ~0 to 265 in y) */
const S_VIEW_BOX = "-12 0 282 268";
const S_ASPECT = 282 / 268;

/** ViewBox for full logo */
const FULL_VIEW_BOX = "0 0 956 258";
const FULL_ASPECT = 956 / 258;

export type SubiTextLogoVariant = "full" | "s-only";

export type SubiTextLogoProps = SVGProps<SVGSVGElement> & {
  variant?: SubiTextLogoVariant;
  fill?: string;
  size?: number;
  width?: number;
  height?: number;
};

export const SubiTextLogo = ({
  variant = "full",
  fill = "hsl(var(--sb))",
  size,
  width,
  height,
  style,
  ...props
}: SubiTextLogoProps) => {
  const isSOnly = variant === "s-only";

  const viewBox = isSOnly ? S_VIEW_BOX : FULL_VIEW_BOX;
  const aspect = isSOnly ? S_ASPECT : FULL_ASPECT;

  const defaultHeight = 32;
  const defaultWidth = isSOnly ? defaultHeight * aspect : 118.57;
  const numWidth = typeof width === "number" ? width : undefined;
  const numHeight = typeof height === "number" ? height : undefined;
  const numSize = typeof size === "number" ? size : undefined;
  const computedWidth =
    numWidth ??
    (numHeight != null
      ? numHeight * aspect
      : numSize != null
        ? numSize * aspect
        : defaultWidth);
  const computedHeight =
    numHeight ??
    (numWidth != null
      ? numWidth / aspect
      : numSize != null
        ? numSize
        : defaultHeight);

  const pathsToRender = isSOnly
    ? [<path key="s" d={S_PATH} fill={fill} />]
    : [
        <path key="0" d={OTHER_PATHS[0]} fill={fill} />,
        <path key="s" d={S_PATH} fill={fill} />,
        <path key="1" d={OTHER_PATHS[1]} fill={fill} />,
        <path key="2" d={OTHER_PATHS[2]} fill={fill} />,
        <path key="3" d={OTHER_PATHS[3]} fill={fill} />,
      ];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={computedWidth}
      height={computedHeight}
      style={{ width: computedWidth, height: computedHeight, ...style }}
      fill="none"
      viewBox={viewBox}
      {...props}
    >
      <g>{pathsToRender}</g>
    </svg>
  );
};
