import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import { FormSelect, FormSelectProps } from './form-select'

export interface FormSelectWithControllerProps<
  TFieldValues extends FieldValues = FieldValues,
> extends Omit<FormSelectProps, 'value' | 'onValueChange'> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  onChange?: (value: string) => void
}

const FormSelectWithController = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  onChange,
  ...props
}: FormSelectWithControllerProps<TFieldValues>) => {
  return (
    <Controller<TFieldValues>
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormSelect
          {...props}
          value={field.value ?? ''}
          onValueChange={(value) => {
            const normalizedValue = value === '' ? undefined : value
            field.onChange(normalizedValue)
            onChange?.(value)
          }}
          error={fieldState.error?.message}
        />
      )}
    />
  )
}

FormSelectWithController.displayName = 'FormSelectWithController'

export { FormSelectWithController }
