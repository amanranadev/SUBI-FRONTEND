"use client"

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Label } from '@/shared/ui/label'

const textareaVariants = cva(
  'flex w-full rounded-md border bg-transparent text-sm shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
  {
    variants: {
      variant: {
        default:
          'border-input focus-visible:border-ring focus-visible:ring-ring bg-background',
        error:
          'border-red-500 focus-visible:border-red-600 focus-visible:ring-red-200 shadow-red-400/20',
        success:
          'border-green-500 focus-visible:border-green-600 focus-visible:ring-green-200 shadow-green-400/20',
      },
      textareaSize: {
        default: 'min-h-[120px] px-3 py-2',
        sm: 'min-h-[80px] px-2 py-1 text-sm',
        lg: 'min-h-[160px] px-4 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      textareaSize: 'default',
    },
  },
)

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string
  error?: string
  containerClassName?: string
  labelClassName?: string
  errorClassName?: string
  required?: boolean
  optional?: boolean
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      className,
      label,
      error,
      variant,
      textareaSize,
      containerClassName,
      labelClassName,
      errorClassName,
      required = false,
      optional = false,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId()
    const textareaId = id || generatedId
    const finalVariant = error ? 'error' : variant || 'default'

    return (
      <div className={cn('flex flex-col gap-2', containerClassName)}>
        {label && (
          <div className='flex items-center justify-between'>
            <Label
              htmlFor={textareaId}
              className={cn('font-medium', labelClassName)}
            >
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </Label>
            {optional && <span className="text-sm text-muted-foreground">Optional</span>}
          </div>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            textareaVariants({
              variant: finalVariant,
              textareaSize,
              className,
            }),
          )}
          {...props}
        />
        {error && (
          <p className={cn('text-xs font-normal text-destructive', errorClassName)}>
            {error}
          </p>
        )}
      </div>
    )
  },
)
FormTextarea.displayName = 'FormTextarea'

export { FormTextarea, textareaVariants }
