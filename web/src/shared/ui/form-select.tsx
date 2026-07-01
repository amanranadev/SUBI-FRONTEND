import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  // selectVariants,
} from '@/shared/ui/select'


import { ChevronDown } from 'lucide-react'
import { FormError } from './form-error'
import { LabelOptional,LabelRequired } from './label-required'

export interface FormSelectProps {
  label?: string
  error?: string
  placeholder?: string
  options: Array<{
    value: string
    label: string | React.ReactNode
    className?: string
  }>
  className?: string
  containerClassName?: string
  labelClassName?: string
  itemClassName?: string
  errorClassName?: string
  selectValueClassName?: string
  required?: boolean
  optional?: boolean
  // variant?: VariantProps<typeof selectVariants>['variant']
  // size?: VariantProps<typeof selectVariants>['size']
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  id?: string
  icon?: React.ReactNode
}

const FormSelect = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  FormSelectProps
>(
  (
    {
      className,
      label,
      error,
      placeholder = 'Select an option',
      options,
      containerClassName,
      labelClassName,
      itemClassName,
      errorClassName,
      selectValueClassName,
      required = false,
      optional = false,
      id,
      // variant,
      // size,
      icon = <ChevronDown className='size-4 text-rf-gray-700' />,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId()
    const selectId = id || generatedId
    // const finalVariant = error ? 'error' : variant || 'default'

    return (
      <div className={cn('flex flex-col gap-2', containerClassName)}>
        {label && (
          <div className='flex items-center justify-between'>
            <Label
              htmlFor={selectId}
              className={cn('text-gray-700', labelClassName)}
            >
              {label}
              {required && <LabelRequired />}
            </Label>
            {optional && <LabelOptional />}
          </div>
        )}
        <Select {...props}>
          <SelectTrigger
            ref={ref}
            id={selectId}
            // variant={finalVariant}
            // size={size}
            className={className}
            // icon={icon}
          >
            <SelectValue
              placeholder={placeholder}
              className={selectValueClassName}
            />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem
                className={cn(itemClassName, option.className)}
                key={option.value}
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormError error={error} className={errorClassName} />
      </div>
    )
  },
)
FormSelect.displayName = 'FormSelect'

export { FormSelect }
