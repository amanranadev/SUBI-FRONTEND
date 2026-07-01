import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

interface CheckProps extends SvgProps {
  width?: number
  height?: number
  color?: string
}
function Check(props: CheckProps) {
  return (
    <Svg
      width={props.width || 16}
      height={props.height || 16}
      viewBox="0 0 16 16"
      fill="none"
      {...props}
    >
      <Path
        d="M13.333 4L6 11.333 2.667 8"
        stroke={props.color || "#fff"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default Check
