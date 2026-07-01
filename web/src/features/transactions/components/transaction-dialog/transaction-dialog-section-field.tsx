import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DatePickerInput } from "@/shared/ui/date-picker-input";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { MaskedInput } from "@/shared/ui/masked-input";

type TransactionDialogSectionFieldProps = {
  label: string;
  value: string;
  onChange?: (val: string) => void;
  onBlur?: () => void;
  error?: string;
  kind?: "default" | "date" | "phone" | "currency";
  required?: boolean;
  highlight?: boolean;
  subtleHighlight?: boolean;
};

export function TransactionDialogSectionField({
  label,
  value,
  onChange,
  onBlur,
  error,
  kind = "default",
  required,
  highlight = false,
  subtleHighlight = false,
}: TransactionDialogSectionFieldProps) {
  const inputClassName = cn(
    "h-14 rounded-[1.75rem] bg-white border-black/[0.05] font-bold text-base",
    kind === "date" ? "px-6 pr-12" : "px-6",
    highlight && "border-orange-300 bg-orange-50/40",
    subtleHighlight && "border-violet-200 bg-violet-50/50 text-violet-700",
    error && "border-red-400 bg-red-50/50",
  );

  return (
    <div
      className={cn(
        "space-y-2 p-0.5",
        highlight &&
          "rounded-[2rem] border border-orange-200 bg-orange-50/60 p-3",
      )}
    >
      <Label
        className={cn(
          "text-xs font-bold uppercase tracking-widest opacity-40 ml-4 flex items-center gap-1",
          highlight && "text-orange-700 opacity-90",
        )}
      >
        {label}
        {required && <span className="text-red-400">*</span>}
        {subtleHighlight && (
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold tracking-wider text-violet-700">
            Priority
          </span>
        )}
        {highlight && (
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[9px] font-bold tracking-wider text-orange-700">
            Important
          </span>
        )}
      </Label>
      <div className="relative">
        {kind === "date" && onChange ? (
          <DatePickerInput
            value={value}
            onValueChange={onChange}
            onBlur={onBlur}
            className={inputClassName}
            iconClassName="size-4 opacity-40"
          />
        ) : kind === "phone" && onChange ? (
          <MaskedInput
            value={value}
            mask="phone"
            onValueChange={onChange}
            onBlur={onBlur}
            placeholder="(555)-123-4567"
            className={inputClassName}
          />
        ) : kind === "currency" && onChange ? (
          <MaskedInput
            value={value}
            mask="currency"
            onValueChange={onChange}
            onBlur={onBlur}
            placeholder="$0"
            className={inputClassName}
          />
        ) : (
          <Input
            value={value}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            onBlur={onBlur}
            readOnly={!onChange}
            className={inputClassName}
          />
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 font-medium ml-4 flex items-center gap-1">
          <AlertCircle className="size-3" />
          {error}
        </p>
      )}
    </div>
  );
}
