"use client";

import { cn } from "@/lib/utils";

type ToggleGroupItem = {
  value: string;
  label: string;
  href?: string;
};

type ToggleGroupVariant = "pill" | "rounded";

type ToggleGroupProps = {
  items: ToggleGroupItem[];
  value: string;
  onChange?: (value: string) => void;
  className?: string;
  variant?: ToggleGroupVariant;
  renderItem?: (item: ToggleGroupItem, isActive: boolean, itemClassName: string) => React.ReactNode;
};

const toggleGroupStyles = {
  wrapper:
    "flex items-center gap-2 bg-black/[0.03] p-1.5 border border-black/[0.03] shadow-inner",
  item: "px-6 py-2 text-[11px] font-bold uppercase tracking-widest transition-all",
  active: "bg-white text-foreground shadow-lg shadow-black/10 hover:bg-[hsl(var(--primary))] hover:text-white",
  inactive: "text-foreground/40 hover:text-foreground hover:bg-[hsl(var(--primary))] hover:text-white",
};

const variantStyles: Record<ToggleGroupVariant, { wrapper: string; item: string }> = {
  pill: {
    wrapper: "rounded-full",
    item: "rounded-full",
  },
  rounded: {
    wrapper: "rounded-xl",
    item: "rounded-xl",
  },
};

export function ToggleGroup({
  items,
  value,
  onChange,
  className,
  variant = "pill",
  renderItem,
}: ToggleGroupProps) {
  const vStyles = variantStyles[variant];

  return (
    <div className={cn(toggleGroupStyles.wrapper, vStyles.wrapper, className)}>
      {items.map((item) => {
        const isActive = item.value === value;
        const itemClassName = cn(
          toggleGroupStyles.item,
          vStyles.item,
          isActive ? toggleGroupStyles.active : toggleGroupStyles.inactive,
        );

        if (renderItem) {
          return renderItem(item, isActive, itemClassName);
        }

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange?.(item.value)}
            className={itemClassName}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export { toggleGroupStyles };
