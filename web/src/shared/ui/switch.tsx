"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const switchRootVariants = cva(
  "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        soft: "h-8 w-14 border border-warm-200 bg-warm-50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] data-[state=checked]:bg-warm-100 data-[state=unchecked]:bg-warm-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const switchThumbVariants = cva(
  "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
  {
    variants: {
      variant: {
        default:
          "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 shadow-md",
        soft: "size-6 border border-black/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-[2px] data-[state=checked]:border-transparent data-[state=checked]:bg-warm-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type SwitchProps = React.ComponentPropsWithoutRef<
  typeof SwitchPrimitives.Root
> &
  VariantProps<typeof switchRootVariants>;

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, variant, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(switchRootVariants({ variant }), className)}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb className={cn(switchThumbVariants({ variant }))} />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
