"use client";

import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textVariants = cva("tracking-normal", {
  variants: {
    family: {
      clean: "font-sans",
      brand: "font-body",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
    },
    weight: {
      regular: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    transform: {
      none: "normal-case",
      cap: "capitalize",
      lower: "lowercase",
      upper: "uppercase",
    },
    tone: {
      default: "text-inherit",
      muted: "text-muted-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
    },
  },
  defaultVariants: {
    family: "brand",
    size: "base",
    weight: "regular",
    transform: "none",
    tone: "default",
  },
});

export interface TxtProps
  extends HTMLAttributes<HTMLElement>, VariantProps<typeof textVariants> {
  as?: ElementType;
}

export const Txt = forwardRef<HTMLElement, TxtProps>(
  (
    {
      as: Component = "span",
      className,
      size,
      weight,
      transform,
      tone,
      family,
      ...props
    },
    ref,
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(
          textVariants({ family, size, weight, transform, tone }),
          className,
        )}
        {...props}
      />
    );
  },
);

Txt.displayName = "Txt";
