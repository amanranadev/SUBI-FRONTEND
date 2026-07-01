import {
  Control,
  FieldPath,
  FieldValues,
  RegisterOptions,
} from 'react-hook-form'
import { TextInputProps } from 'react-native'

interface FormTextInputProps<T extends FieldValues = FieldValues>
  extends Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'> {
  name: FieldPath<T>
  control: Control<T>
  rules?: RegisterOptions<T>
  icon?: React.ReactNode
}

export default FormTextInputProps
