import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";

type TransactionDialogSectionCheckmarkProps = {
  isVerified: boolean;
  onToggle: () => void;
};

export function TransactionDialogSectionCheckmark({
  isVerified,
  onToggle,
}: TransactionDialogSectionCheckmarkProps) {
  return (
    <div className="flex justify-start pt-4">
      <Button
        type="button"
        onClick={onToggle}
        aria-label={isVerified ? "Verified" : "Mark section as looks good"}
        className={cn(
          "group relative h-12 overflow-hidden rounded-[1.5rem] font-bold tracking-tight transition-all duration-300",
          isVerified
            ? "gap-3 px-6 bg-green-600 text-white shadow-lg shadow-green-500/20 hover:bg-green-700"
            : "gap-3 px-6 bg-primary/10 text-primary shadow-none hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/20",
        )}
      >
        {isVerified ? (
          <>
            <span className="inline-flex size-6 items-center justify-center rounded-full border border-white/20 bg-white/15 transition-colors duration-300">
              <CheckCircle2 className="size-4 text-white" />
            </span>
            Verified
          </>
        ) : (
          <>
            <span className="inline-flex size-6 items-center justify-center rounded-full border border-primary/20 bg-white/70 transition-colors duration-300 group-hover:border-white/20 group-hover:bg-white/15">
              <CheckCircle2 className="size-4 text-primary transition-colors duration-300 group-hover:text-white" />
            </span>
            <span className="text-base font-bold tracking-tight">
              Looks good
            </span>
          </>
        )}
      </Button>
    </div>
  );
}
