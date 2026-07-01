import * as React from 'react'
import { format } from 'date-fns'
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { cn } from '@/lib/utils'
import { Label } from './label'
import { LabelOptional, LabelRequired } from './label-required'
import { FormError } from './form-error'
import CalendarDatePicker from '@/shared/ui/calendar-date-picker'

type View = 'day' | 'month'



export interface FormDateInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  label?: string
  error?: string
  className?: string
  labelClassName?: string
  errorClassName?: string
  required?: boolean
  optional?: boolean
  id?: string
  name: TName
  view?: View
  size?: 'sm' | 'default' | 'lg'
  currentDate?: string | Date | null
  withController?: boolean
  control?: Control<TFieldValues>
  onDateChange?: (date: string) => void
  onBlur?: () => void
}

const FormDateInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  error,
  className,
  labelClassName,
  errorClassName,
  required = false,
  optional = false,
  id,
  name,
  control,
  view = 'day',
  size = 'default',
  currentDate,
  withController = true,
  onDateChange,
  onBlur,
}: FormDateInputProps<TFieldValues, TName>) => {
  const generatedId = React.useId()
  const inputId = id || generatedId

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <div className='flex items-center justify-between'>
          <Label
            htmlFor={inputId}
            className={cn('text-gray-700', labelClassName)}
          >
            {label}
            {required && <LabelRequired />}
          </Label>
          {optional && <LabelOptional />}
        </div>
      )}
      {withController ?
        <Controller<TFieldValues, TName>
          name={name}
          control={control}
          render={({ field }) => (
              <CalendarDatePicker
                id={inputId}
                name={name}
                view={view}
                size={size}
                value={field.value}
                handleOnchangeDate={(date) => {
                  if (!date) {
                    onBlur?.()
                    return
                  }
                  const formattedDate = format(date, 'yyyy-MM-dd')
                  field.onChange(formattedDate)
                  onDateChange?.(formattedDate)
                  onBlur?.()
                }}
              />
          )}
        />
      : <CalendarDatePicker
          id={inputId}
          name={name}
          view={view}
          size={size}
          value={currentDate}
          handleOnchangeDate={(date) => {
            if (!date) {
              onBlur?.()
              return
            }
            const formattedDate = format(date, 'yyyy-MM-dd')
            onDateChange?.(formattedDate)
            onBlur?.()
          }}
        />
      }
      <FormError error={error} className={errorClassName} />
    </div>
  )
}

export { FormDateInput }
