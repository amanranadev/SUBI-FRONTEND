import { colors } from "@/constants/colors";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { FormField } from "../../types";

interface FormInputProps extends TextInputProps {
  field: FormField;
}

const FormInput: React.FC<FormInputProps> = ({ field, ...textInputProps }) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{field.label}</Text>
      <View style={[styles.inputWrapper, textInputProps.style as ViewStyle]}>
        <TextInput
          returnKeyType="done"
          style={styles.input}
          value={field.value}
          onChangeText={textInputProps.onChangeText}
          placeholder={field.placeholder}
          placeholderTextColor={colors.gray[500]}
          keyboardType={field.keyboardType}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 18,
    // marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.gray[800],
    marginBottom: 8,
    fontFamily: "Inter",
  },
  inputWrapper: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[500],
    borderRadius: 8,
    height: 46,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  input: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.gray[800],
    fontFamily: "Inter",
  },
});

export default FormInput;
