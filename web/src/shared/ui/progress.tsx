"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const progressVariants = cva(
  "relative h-full w-full flex-1 overflow-hidden motion-safe:transition-transform motion-safe:duration-700 motion-safe:[transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
  {
    variants: {
      variant: {
        success: "bg-[hsl(var(--progress))]",
        sb: "bg-[hsl(var(--sb))]",
      },
    },
    defaultVariants: {
      variant: "success",
    },
  }
)

type ProgressProps = React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> &
  VariantProps<typeof progressVariants> & {
    /** When false, hides the striped animation and shows only the solid color. Default: true */
    striped?: boolean
  }

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant, striped = true, ...props }, ref) => {
  const safeValue = typeof value === "number" ? Math.min(Math.max(value, 0), 100) : 0

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={progressVariants({ variant })}
        style={{ transform: `translateX(-${100 - safeValue}%)` }}
      >
        {striped && (
          <div
            className="pointer-events-none absolute inset-0 bg-[length:2rem_100%] opacity-65 motion-safe:animate-progress-stripes"
            style={{
              backgroundImage:
                "repeating-linear-gradient(120deg, transparent 0, transparent 0.55rem, rgb(255 255 255 / 0.42) 0.55rem, rgb(255 255 255 / 0.42) 0.9rem)",
            }}
          />
        )}
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
