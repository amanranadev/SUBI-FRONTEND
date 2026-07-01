import type { ViewStyle } from "react-native";

import type { FormFieldInputSize } from "./FormFieldInput.types";
import { formFieldInputTokens } from "./tokens";

const { focus, sizes } = formFieldInputTokens;

/**
 * Renders Figma `box-shadow: 0 0 0 3px rgba(44, 44, 44, 0.15)` as an absolute
 * rounded border halo behind the control. Does not affect layout or remount the input.
 */
export function resolveFocusRingStyle({
  inputSize,
  isFocused,
}: {
  inputSize: FormFieldInputSize;
  isFocused: boolean;
}): ViewStyle {
  const { borderRadius } = sizes[inputSize];
  const { ringSpread, ringColor } = focus;

  return {
    position: "absolute",
    top: -ringSpread,
    right: -ringSpread,
    bottom: -ringSpread,
    left: -ringSpread,
    borderRadius: borderRadius + ringSpread,
    borderWidth: ringSpread,
    borderColor: isFocused ? ringColor : "transparent",
    backgroundColor: "transparent",
    pointerEvents: "none",
  };
}

export function resolveFieldShellStyle(): ViewStyle {
  return {
    width: "100%",
    position: "relative",
    overflow: "visible",
  };
}
