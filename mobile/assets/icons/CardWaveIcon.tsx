import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

interface CardWaveIconProps extends SvgProps {
    width?: number;
    height?: number;
    color?: string;
}

function CardWaveIcon({ height, width, color, ...props }: CardWaveIconProps) {
    return (
        <Svg
            width={width || 374}
            height={height || 377}
            viewBox="0 0 374 377"
            fill="none"
            {...props}
        >
            <Path
                d="M374 377H0V261.806L193.906 0L374 105.377V377Z"
                fill={color || "white"}
            />
        </Svg>
    );
}

export default CardWaveIcon;
