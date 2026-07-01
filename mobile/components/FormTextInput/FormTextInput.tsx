import { colors } from "@/constants/colors";
import React from "react";
import { FieldValues, useController } from "react-hook-form";
import { StyleSheet, TextInput, View } from "react-native";
import FormTextInputProps from "./types";
export default function FormTextInput<T extends FieldValues = FieldValues>(
  props: FormTextInputProps<T>
) {
  const {
    field,
    fieldState: { invalid, isTouched, isDirty },
    formState: { touchedFields, dirtyFields },
  } = useController({
    name: props.name,
    control: props.control,
    rules: props.rules,
  });

  const { icon, ...textInputProps } = props;

  if (icon) {
    return (
      <View style={styles.inputContainer}>
        <TextInput
          {...textInputProps}
          ref={field.ref}
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          style={[styles.inputText, props.style]}
        />
        <View style={styles.iconContainer}>{icon}</View>
      </View>
    );
  }

  return (
    <TextInput
      {...textInputProps}
      ref={field.ref}
      value={field.value}
      onChangeText={field.onChange}
      onBlur={field.onBlur}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray[400],
    borderWidth: 1,
    borderColor: colors.gray[500],
    borderRadius: 6,
    width: "100%",
    overflow: "hidden",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[500],
    borderRadius: 6,
    padding: 16,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.gray[800],
    width: "100%",
  },
  inputText: {
    flex: 1,
    padding: 16,
    paddingRight: 48,
    fontSize: 16,
    backgroundColor: "transparent",
    color: colors.gray[800],
    borderWidth: 0,
    margin: 0,
  },
  iconContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.gray[400],
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
});
