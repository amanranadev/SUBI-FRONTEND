import { KeyboardTypeOptions } from "react-native";

export interface FormField {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
}

export interface CheckboxItem {
  id: string;
  label: string;
  checked: boolean;
}
