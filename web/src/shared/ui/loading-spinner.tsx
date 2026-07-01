"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const loadingSpinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      xs: "size-3",
      sm: "size-3.5",
      md: "size-4",
      lg: "size-6",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type LoadingSpinnerProps = VariantProps<typeof loadingSpinnerVariants> & {
  className?: string;
};

export function LoadingSpinner({ size, className }: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn(loadingSpinnerVariants({ size }), className)}
      aria-hidden="true"
    />
  );
}
