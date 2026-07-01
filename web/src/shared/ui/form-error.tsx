import * as React from 'react'
import { cn } from '@/lib/utils'
import { Txt } from './txt'

export interface FormErrorProps {
  error?: string
  className?: string
  children?: React.ReactNode
}

const FormError = React.forwardRef<HTMLParagraphElement, FormErrorProps>(
  ({ error, className, children, ...props }, ref) => {
    if (!error && !children) {
      return null
    }

    return (
      <Txt
        as='p'
        ref={ref}
        className={cn('text-xs text-red-500', className)}
        role='alert'
        {...props}
      >
        {error || children}
      </Txt>
    )
  },
)
FormError.displayName = 'FormError'

export { FormError }
