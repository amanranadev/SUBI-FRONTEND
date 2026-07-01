import type { ComponentType } from "react";
import { CheckCircle2, Files, ListPlus, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectionCardsProps = {
  isSubmitting: boolean;
  onLoadStandard: () => void;
  onStartCreate: () => void;
  onLoadUpload: () => void;
  showSavedTemplatesOption?: boolean;
  onLoadSavedTemplates?: () => void;
};

export function SelectionCards({
  isSubmitting,
  onLoadStandard,
  onStartCreate,
  onLoadUpload,
  showSavedTemplatesOption = false,
  onLoadSavedTemplates,
}: SelectionCardsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 pl-2 pr-1 md:px-2",
        showSavedTemplatesOption ? "md:grid-cols-4" : "md:grid-cols-3",
      )}
    >
      <SelectionCard
        icon={CheckCircle2}
        title="Standard Checklist"
        desc="SUBI Professional template"
        onClick={onLoadStandard}
        disabled={isSubmitting}
      />
      <SelectionCard
        icon={ListPlus}
        title="Create Checklist"
        desc="Build your own manually"
        onClick={onStartCreate}
        disabled={isSubmitting}
      />
      <SelectionCard
        icon={UploadCloud}
        title="Upload Checklist"
        desc="Import from CSV file"
        onClick={onLoadUpload}
        disabled={isSubmitting}
      />
      {showSavedTemplatesOption ? (
        <SelectionCard
          icon={Files}
          title="Saved Templates"
          desc="Use a reusable checklist template"
          onClick={() => onLoadSavedTemplates?.()}
          disabled={isSubmitting || !onLoadSavedTemplates}
        />
      ) : null}
    </div>
  );
}

function SelectionCard({
  icon: Icon,
  title,
  desc,
  onClick,
  disabled = false,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  desc: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group glass-card rounded-[2rem] p-8 flex flex-col items-center text-center gap-4 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all [box-shadow:0_16px_28px_-22px_rgba(0,0,0,0.3),0_6px_12px_-10px_rgba(0,0,0,0.2)] border-white/60",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <div className="size-16 rounded-[1.75rem] bg-primary/5 flex items-center justify-center transition-all group-hover:bg-primary/10 group-hover:scale-110">
        <Icon className="size-7 text-primary" strokeWidth={2.5} />
      </div>
      <div className="space-y-1">
        <h4 className="text-xl font-bold tracking-tighter">{title}</h4>
        <p className="text-xs font-medium opacity-40">{desc}</p>
      </div>
    </button>
  );
}
