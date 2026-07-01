import * as React from "react";
import Svg, { ClipPath, Defs, G, Path, SvgProps } from "react-native-svg";

function GmailIcon({ width, height, ...props }: SvgProps) {
  return (
    <Svg
      width={width || 23}
      height={height || 18}
      viewBox="0 0 23 18"
      fill="none"
      {...props}
    >
      <G clipPath="url(#clip0_539_4248)">
        <Path
          d="M17.233 2.057l-5.99 4.674-6.128-4.674.008.007V8.61l6.05 4.776 6.06-4.591V2.057z"
          fill="#EA4335"
        />
        <Path
          d="M18.806.92l-1.573 1.137v6.738l4.95-3.8v-2.29s-.6-3.27-3.377-1.785z"
          fill="#FBBC05"
        />
        <Path
          d="M17.233 8.795v8.739h3.794s1.08-.111 1.157-1.342V4.994l-4.951 3.8z"
          fill="#34A853"
        />
        <Path
          d="M5.123 17.542V8.611l-.008-.007.008 8.938zM5.115 2.059L3.551.928C.775-.557.173 2.712.173 2.712v2.29l4.942 3.603V2.059z"
          fill="#C5221F"
        />
        <Path
          d="M5.115 2.059v6.546l.008.006V2.065l-.008-.006z"
          fill="#C5221F"
        />
        <Path
          d="M.173 5.002V16.2a1.35 1.35 0 001.157 1.342h3.794l-.009-8.938L.173 5.002z"
          fill="#4285F4"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_539_4248">
          <Path
            fill="#fff"
            transform="translate(.173 .533)"
            d="M0 0H22.0117V17.0087H0z"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default GmailIcon;
