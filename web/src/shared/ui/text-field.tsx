import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const textVariants = cva('font-sans text-rf-gray-800', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
      '7xl': 'text-7xl',
      '8xl': 'text-8xl',
      '9xl': 'text-9xl',
    },
    weight: {
      regular: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    transform: {
      none: 'none',
      cap: 'capitalize',
      lower: 'lowercase',
      upper: 'uppercase',
    },
    cursor: {
      pointer: 'cursor-pointer',
      default: 'cursor-default',
    },
  },
  defaultVariants: {
    size: 'base',
    weight: 'regular',
    transform: 'none',
    cursor: 'default',
  },
})

export interface TextProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof textVariants> {
  as?: React.ElementType
}

const Txt = React.forwardRef<HTMLSpanElement, TextProps>(
  (
    {
      className,
      size,
      weight,
      transform,
      cursor,
      as: Component = 'span',
      ...props
    },
    ref,
  ) => {
    return (
      <Component
        className={cn(
          textVariants({ size, weight, transform, cursor, className }),
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Txt.displayName = 'Txt'

export { Txt, textVariants }

export default Txt
