import { Badge } from "@/shared/ui/badge";

type TransactionDialogSectionStatusBadgeProps = {
  isVerified: boolean;
  hasErrors?: boolean;
};

export function TransactionDialogSectionStatusBadge({
  isVerified,
  hasErrors = false,
}: TransactionDialogSectionStatusBadgeProps) {
  if (hasErrors) {
    return (
      <Badge
        variant="secondary"
        className="bg-red-500/10 text-red-600 border-0 font-bold px-3 py-1 rounded-full text-[10px]"
      >
        HAS ERRORS
      </Badge>
    );
  }

  if (isVerified) {
    return (
      <Badge
        variant="secondary"
        className="bg-green-500/10 text-green-600 border-0 font-bold px-3 py-1 rounded-full text-[10px]"
      >
        VERIFIED
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="bg-primary/10 text-primary border-0 font-bold px-3 py-1 rounded-full text-[10px]"
    >
      NEEDS REVIEW
    </Badge>
  );
}
