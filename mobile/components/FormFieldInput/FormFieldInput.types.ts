import type { ReactNode } from "react";
import type {
  StyleProp,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from "react-native";

export const FORM_FIELD_INPUT_VARIANTS = [
  "default",
  "error",
  "success",
  "muted",
] as const;

export type FormFieldInputVariant =
  (typeof FORM_FIELD_INPUT_VARIANTS)[number];

export const FORM_FIELD_INPUT_SIZES = ["sm", "md", "lg"] as const;

export type FormFieldInputSize = (typeof FORM_FIELD_INPUT_SIZES)[number];

export interface FormFieldInputProps
  extends Omit<TextInputProps, "style"> {
  label?: string;
  helperText?: string;
  errorText?: string;
  optionalText?: string;
  required?: boolean;
  showLabel?: boolean;
  variant?: FormFieldInputVariant;
  inputSize?: FormFieldInputSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onLeftIconPress?: () => void;
  onRightIconPress?: () => void;
  isPassword?: boolean;
  showClearButton?: boolean;
  onClear?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  messageStyle?: StyleProp<TextStyle>;
}

export interface ResolvedFormFieldInputMetrics {
  container: ViewStyle;
  /** Relative shell for the control; always present. */
  fieldShell: ViewStyle;
  /** Absolute focus halo for default variant; null when not applicable. */
  focusRing: ViewStyle | null;
  inputContainer: ViewStyle;
  input: TextStyle;
  label: TextStyle;
  message: TextStyle;
  optional: TextStyle;
  iconColor: string;
}
