import React, { memo, useCallback, useMemo, useState, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Icon } from "../../assets/icon-system";

import { resolveFormFieldInputStyles } from "./resolveFormFieldInputStyles";
import type { FormFieldInputProps } from "./FormFieldInput.types";
import { formFieldInputTokens } from "./tokens";

const DEFAULT_VARIANT = "default" as const;
const DEFAULT_SIZE = "md" as const;
const PASSWORD_ICON_SIZE = 20;

function renderIconSlot({
  icon,
  onPress,
  accessibilityLabel,
  disabled,
  style,
}: {
  icon: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  style: StyleProp<ViewStyle>;
}) {
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        onPress={onPress}
        style={style}
      >
        {icon}
      </Pressable>
    );
  }

  return <View style={style}>{icon}</View>;
}

export const FormFieldInput = memo(function FormFieldInput({
  label,
  helperText,
  errorText,
  optionalText = "Optional",
  required = false,
  showLabel = true,
  variant = DEFAULT_VARIANT,
  inputSize = DEFAULT_SIZE,
  leftIcon,
  rightIcon,
  onLeftIconPress,
  onRightIconPress,
  isPassword = false,
  showClearButton = false,
  onClear,
  containerStyle,
  inputContainerStyle,
  inputStyle,
  labelStyle,
  messageStyle,
  value,
  editable = true,
  placeholderTextColor,
  multiline = false,
  accessibilityLabel,
  secureTextEntry: secureTextEntryProp,
  testID,
  onFocus,
  onBlur,
  ...textInputProps
}: FormFieldInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const effectiveVariant = errorText ? "error" : variant;
  const disabled = editable === false;
  const hasValue = value != null && String(value).length > 0;
  const shouldShowClear = showClearButton && hasValue && !disabled && !isPassword;
  const hasRightContent = isPassword || Boolean(rightIcon) || shouldShowClear;

  const metrics = useMemo(
    () =>
      resolveFormFieldInputStyles({
        variant: effectiveVariant,
        inputSize,
        disabled,
        isFocused,
        hasLeftIcon: Boolean(leftIcon),
        hasRightContent,
        multiline,
      }),
    [
      effectiveVariant,
      inputSize,
      disabled,
      isFocused,
      leftIcon,
      hasRightContent,
      multiline,
    ],
  );

  const handleFocus = useCallback(
    (event: Parameters<NonNullable<FormFieldInputProps["onFocus"]>>[0]) => {
      setIsFocused(true);
      onFocus?.(event);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (event: Parameters<NonNullable<FormFieldInputProps["onBlur"]>>[0]) => {
      setIsFocused(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((current) => !current);
  }, []);

  const passwordToggleIcon = useMemo(
    () => (
      <Icon
        name={isPasswordVisible ? "eye-off" : "eye"}
        size={PASSWORD_ICON_SIZE}
        color={metrics.iconColor}
        accessible={false}
      />
    ),
    [isPasswordVisible, metrics.iconColor],
  );

  const message = errorText ?? helperText;
  const inputAccessibilityLabel = accessibilityLabel ?? label;
  const secureTextEntry = isPassword
    ? !isPasswordVisible
    : secureTextEntryProp;

  const rightSlotContent = useMemo(() => {
    if (isPassword) {
      return renderIconSlot({
        icon: passwordToggleIcon,
        onPress: togglePasswordVisibility,
        accessibilityLabel: isPasswordVisible ? "Hide password" : "Show password",
        disabled,
        style: styles.rightSlot,
      });
    }

    if (shouldShowClear) {
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear input"
          onPress={onClear}
          style={styles.rightSlot}
        >
          <Icon
            name="close"
            size={PASSWORD_ICON_SIZE}
            color={metrics.iconColor}
            accessible={false}
          />
        </Pressable>
      );
    }

    if (rightIcon) {
      return renderIconSlot({
        icon: rightIcon,
        onPress: onRightIconPress,
        accessibilityLabel: "Right input action",
        disabled,
        style: styles.rightSlot,
      });
    }

    return null;
  }, [
    disabled,
    isPassword,
    isPasswordVisible,
    metrics.iconColor,
    onClear,
    onRightIconPress,
    passwordToggleIcon,
    rightIcon,
    shouldShowClear,
    togglePasswordVisibility,
  ]);

  return (
    <View style={[metrics.container, containerStyle]}>
      {showLabel && label ? (
        <View style={styles.labelRow}>
          <Text style={[styles.label, metrics.label, labelStyle]}>
            {label}
            {required ? " *" : ""}
          </Text>
          {!required && optionalText ? (
            <Text style={[styles.optional, metrics.optional]}>
              {optionalText}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={metrics.fieldShell}>
        {metrics.focusRing ? (
          <View style={metrics.focusRing} pointerEvents="none" />
        ) : null}
        <View style={[metrics.inputContainer, inputContainerStyle]}>
          {leftIcon
            ? renderIconSlot({
                icon: leftIcon,
                onPress: onLeftIconPress,
                accessibilityLabel: "Left input action",
                disabled,
                style: styles.leftSlot,
              })
            : null}
          <TextInput
            {...textInputProps}
            testID={testID}
            value={value}
            editable={editable}
            multiline={multiline}
            secureTextEntry={secureTextEntry}
            accessibilityLabel={inputAccessibilityLabel}
            placeholderTextColor={
              placeholderTextColor ?? formFieldInputTokens.colors.textMuted
            }
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={[styles.input, metrics.input, inputStyle]}
          />
          {rightSlotContent}
        </View>
      </View>

      {message ? (
        <Text style={[styles.message, metrics.message, messageStyle]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  labelRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: formFieldInputTokens.spacing.labelRowGap,
  },
  label: {
    flex: 1,
  },
  optional: {
    flexShrink: 0,
  },
  input: {
    includeFontPadding: false,
  },
  leftSlot: {
    minWidth: formFieldInputTokens.sizes.md.iconSlot,
    alignItems: "center",
    justifyContent: "center",
  },
  rightSlot: {
    minWidth: formFieldInputTokens.sizes.md.iconSlot,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },
  message: {
    marginTop: -2,
  },
});
