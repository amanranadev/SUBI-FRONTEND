import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { IoCloseOutline } from "react-icons/io5";

export const inputStyles = {
  root: "flex w-full rounded-default border border-input bg-background px-3 py-2 text-base ring-offset-background transition-[border-color,box-shadow,background-color] duration-200 ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-medium",
  default: "border border-input bg-background",
};

const inputVariants = cva(inputStyles.root, {
  variants: {
    variant: {
      default: inputStyles.default,
      error:
        "border-red-500 focus-visible:border-red-600 focus-visible:ring-red-200 shadow-red-400/20",
      success:
        "border-green-500 focus-visible:border-green-600 focus-visible:ring-green-200 shadow-green-400/20",
    },
    inputSize: {
      default: "h-14  px-3 py-2",
      sm: "h-10 px-2 py-1",
      lg: "h-16 px-4 py-2",
    },
  },
  defaultVariants: {
    variant: "default",
    inputSize: "default",
  },
});

export interface InputProps
  extends
    React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  start?: React.ReactNode;
  end?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
  showClearButton?: boolean;
  debounceMs?: number;
  onDebouncedChange?: (value: string) => void;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant,
      inputSize,
      start,
      end,
      leftIcon,
      rightIcon,
      onClear,
      showClearButton = false,
      debounceMs,
      onDebouncedChange,
      value,
      onChange,
      containerClassName,
      ...props
    },
    ref,
  ) => {
    // Simple debounce logic - only triggers on user input, not on external value changes
    const debounceTimeoutRef = React.useRef<ReturnType<
      typeof setTimeout
    > | null>(null);
    const onDebouncedChangeRef = React.useRef(onDebouncedChange);

    // Keep the ref up to date
    React.useEffect(() => {
      onDebouncedChangeRef.current = onDebouncedChange;
    }, [onDebouncedChange]);

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        // Call onChange immediately for controlled components
        onChange?.(e);

        // Debounce onDebouncedChange only when user types
        if (debounceMs && onDebouncedChangeRef.current) {
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
          }

          debounceTimeoutRef.current = setTimeout(() => {
            onDebouncedChangeRef.current?.(e.target.value);
          }, debounceMs);
        }
      },
      [onChange, debounceMs],
    );

    // Cleanup on unmount
    React.useEffect(() => {
      return () => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
      };
    }, []);

    const handleClear = () => {
      // Clear any pending debounce
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }

      if (onChange) {
        const event = {
          target: {
            value: "",
            name: props.name || "",
            type: type || "text",
            id: props.id || "",
          },
          currentTarget: {
            value: "",
            name: props.name || "",
            type: type || "text",
            id: props.id || "",
          },
        } as React.ChangeEvent<HTMLInputElement>;

        onChange(event);
      }

      // Immediately trigger onDebouncedChange when clearing (no debounce)
      if (onDebouncedChangeRef.current) {
        onDebouncedChangeRef.current("");
      }

      onClear?.();
    };

    const shouldShowClear =
      showClearButton && value && value.toString().length > 0;
    const startAdornment = start ?? leftIcon;
    const endAdornment = end ?? rightIcon;

    return (
      <div className={cn("relative", containerClassName)}>
        {startAdornment && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {startAdornment}
          </div>
        )}
        <input
          type={type}
          className={cn(
            inputVariants({ variant, inputSize, className }),
            startAdornment && "pl-10",
            (endAdornment || shouldShowClear) && "pr-10",
          )}
          ref={ref}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {shouldShowClear && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <IoCloseOutline className="h-5 w-5" />
          </button>
        )}
        {endAdornment && !shouldShowClear && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {endAdornment}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input, inputVariants };

export default Input;
