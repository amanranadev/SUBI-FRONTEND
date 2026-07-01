"use client";

import { Txt } from "@/shared/ui/txt";
import { USER_ROLE } from "@/features/team/constants";
import { UserRole } from "@/features/team/types";

type TransactionsPageHeaderProps = {
  userRole: UserRole;
};

export function TransactionsPageHeader({
  userRole,
}: TransactionsPageHeaderProps) {
  const title =
    userRole === USER_ROLE.BROKER ? "Brokerage Files" : "My Transactions";

  return (
    <div className="flex items-end justify-between border-b border-black/[0.03] pb-6">
      <div className="space-y-1">
        <Txt size="4xl" weight="bold" transform="none" family="brand">
          {title}
        </Txt>
      </div>
    </div>
  );
}
