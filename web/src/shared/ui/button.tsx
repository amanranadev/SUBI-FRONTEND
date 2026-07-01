import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-default text-sm font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-300 hover:shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        dark: "bg-black text-background hover:bg-black/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        "outline-primary":
          "border bg-background hover:bg-primary hover:text-primary-foreground border-primary/20 text-primary",
        "outline-dark":
          "border border-input bg-background hover:bg-black hover:text-background",
        "outline-danger":
          "border border-input bg-background hover:bg-red-500 hover:text-background",
        "outline-green":
          "border border-input bg-background hover:bg-green-500 hover:text-background",
        "outline-blue":
          "border border-input bg-background hover:bg-blue-500 hover:text-background",
        "outline-yellow":
          "border border-input bg-background hover:bg-yellow-500 hover:text-background",
        "violet-light":
          "border border-violet-300 bg-violet-50/60 font-bold text-violet-700 hover:bg-violet-100 hover:text-violet-700 focus:ring-violet-300 focus:ring-offset-violet-50",
        "yellow-light":
          "border border-yellow-300 bg-yellow-50/60 font-bold text-yellow-700 hover:bg-yellow-100 hover:text-yellow-700 focus:ring-yellow-300 focus:ring-offset-yellow-50",
        "blue-light":
          "border border-blue-300 bg-blue-50/60 font-bold text-blue-700 hover:bg-blue-100 hover:text-blue-700 focus:ring-blue-300 focus:ring-offset-blue-50",
        "green-light":
          "border border-green-300 bg-green-50/60 font-bold text-green-700 hover:bg-green-100 hover:text-green-700 focus:ring-green-300 focus:ring-offset-green-50",
        ghost: "hover:bg-accent hover:text-foreground",
        "ghost-dark": "hover:bg-black hover:text-background",
        "ghost-destructive": "hover:bg-destructive/10 hover:text-destructive",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        md: "h-12 px-6 py-3",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
