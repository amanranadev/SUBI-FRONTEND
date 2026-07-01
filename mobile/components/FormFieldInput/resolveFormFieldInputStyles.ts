import type { TextStyle, ViewStyle } from "react-native";

import type {
  FormFieldInputSize,
  FormFieldInputVariant,
  ResolvedFormFieldInputMetrics,
} from "./FormFieldInput.types";
import {
  resolveFieldShellStyle,
  resolveFocusRingStyle,
} from "./resolveFocusRingStyle";
import { formFieldInputTokens } from "./tokens";

const { colors, sizes, typography, spacing, border, focus } = formFieldInputTokens;

interface ResolveOptions {
  variant: FormFieldInputVariant;
  inputSize: FormFieldInputSize;
  disabled: boolean;
  isFocused: boolean;
  hasLeftIcon: boolean;
  hasRightContent: boolean;
  multiline: boolean;
}

function resolvePalette(
  variant: FormFieldInputVariant,
  disabled: boolean,
) {
  if (disabled) {
    return {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.borderDefault,
      inputColor: colors.disabledText,
      messageColor: colors.textMuted,
      iconColor: colors.disabledText,
    };
  }

  switch (variant) {
    case "error":
      return {
        backgroundColor: colors.surfaceCard,
        borderColor: colors.danger,
        inputColor: colors.textPrimary,
        messageColor: colors.danger,
        iconColor: colors.danger,
      };
    case "success":
      return {
        backgroundColor: colors.surfaceCard,
        borderColor: colors.success,
        inputColor: colors.textPrimary,
        messageColor: colors.success,
        iconColor: colors.success,
      };
    case "muted":
      return {
        backgroundColor: colors.surfaceMuted,
        borderColor: colors.borderDefault,
        inputColor: colors.textSubtle,
        messageColor: colors.textMuted,
        iconColor: colors.textMuted,
      };
    case "default":
    default:
      return {
        backgroundColor: colors.surfaceField,
        borderColor: colors.borderStrong,
        inputColor: colors.textPrimary,
        messageColor: colors.textSubtle,
        iconColor: colors.textMuted,
      };
  }
}

function resolveDefaultInputContainerStyle(
  isFocused: boolean,
): Pick<ViewStyle, "backgroundColor" | "borderWidth" | "borderColor"> {
  if (isFocused) {
    return {
      backgroundColor: colors.surfaceCard,
      borderWidth: focus.borderWidth,
      borderColor: colors.textPrimary,
    };
  }

  return {
    backgroundColor: colors.surfaceField,
    borderWidth: border.defaultWidth,
    borderColor: colors.borderStrong,
  };
}

export function resolveFormFieldInputStyles({
  variant,
  inputSize,
  disabled,
  isFocused,
  hasLeftIcon,
  hasRightContent,
  multiline,
}: ResolveOptions): ResolvedFormFieldInputMetrics {
  const size = sizes[inputSize];
  const palette = resolvePalette(variant, disabled);
  const isDefaultInteractive = variant === "default" && !disabled;

  const container: ViewStyle = {
    width: "100%",
    gap: spacing.fieldGap,
  };

  const fieldShell: ViewStyle = resolveFieldShellStyle();

  const focusRing = isDefaultInteractive
    ? resolveFocusRingStyle({ inputSize, isFocused })
    : null;

  const defaultFocusStyle = isDefaultInteractive
    ? resolveDefaultInputContainerStyle(isFocused)
    : {
        backgroundColor: palette.backgroundColor,
        borderWidth: border.defaultWidth,
        borderColor: palette.borderColor,
      };

  const inputContainer: ViewStyle = {
    width: "100%",
    minHeight: multiline ? Math.max(size.minHeight, 96) : size.minHeight,
    borderRadius: size.borderRadius,
    ...defaultFocusStyle,
    flexDirection: "row",
    alignItems: multiline ? "flex-start" : "center",
    overflow: "hidden",
  };

  const input: TextStyle = {
    flex: 1,
    minHeight: multiline ? Math.max(size.minHeight, 96) : size.minHeight - 2,
    paddingVertical: multiline ? size.paddingVertical : 0,
    paddingLeft: hasLeftIcon ? 0 : size.paddingHorizontal,
    paddingRight: hasRightContent ? 0 : size.paddingHorizontal,
    ...typography.body,
    color: palette.inputColor,
    textAlignVertical: multiline ? "top" : "center",
  };

  const label: TextStyle = {
    ...typography.label,
    color: colors.textMuted,
    textTransform: "uppercase",
  };

  const message: TextStyle = {
    ...typography.message,
    color: palette.messageColor,
  };

  const optional: TextStyle = {
    ...typography.message,
    color: colors.textMuted,
  };

  return {
    container,
    fieldShell,
    focusRing,
    inputContainer,
    input,
    label,
    message,
    optional,
    iconColor: palette.iconColor,
  };
}
