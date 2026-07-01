"use client";

import { Check, Filter, LayoutGrid, List, ListOrdered } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Txt } from "@/shared/ui";
import { cn } from "@/lib/utils";
import {
  FETCH_USER_TRANSACTIONS_FILTER,
  type FetchUserTransactionsFilter,
} from "@/features/transactions/constants";

export const TRANSACTIONS_TOOLBAR_SORT_BY = {
  RECENT: "recent",
  STATUS: "status",
} as const;

export const TRANSACTIONS_TOOLBAR_VIEW_MODE = {
  GRID: "grid",
  LIST: "list",
} as const;

export type TransactionsToolbarSortBy =
  (typeof TRANSACTIONS_TOOLBAR_SORT_BY)[keyof typeof TRANSACTIONS_TOOLBAR_SORT_BY];
export type TransactionsToolbarViewMode =
  (typeof TRANSACTIONS_TOOLBAR_VIEW_MODE)[keyof typeof TRANSACTIONS_TOOLBAR_VIEW_MODE];

type TransactionsToolbarProps = {
  sortBy: TransactionsToolbarSortBy;
  viewMode: TransactionsToolbarViewMode;
  transactionsFilter: FetchUserTransactionsFilter;
  onSortChange: (sort: TransactionsToolbarSortBy) => void;
  onTransactionsFilterChange: (filter: FetchUserTransactionsFilter) => void;
  onViewModeChange: (mode: TransactionsToolbarViewMode) => void;
};

const toolbarStyles = {
  button:
    "h-9 px-4 rounded-xl text-[10px] font-bold tracking-widest uppercase gap-2 transition-all",
  active: "bg-black/5 border-black/10",
  inactive: "opacity-40 hover:opacity-100",
  buttonWrapper:
    "flex items-center gap-1 bg-black/[0.03] p-1 rounded-2xl border border-black/[0.03]",
  buttonWrapperActive: "bg-white shadow-default text-foreground",
  buttonWrapperInactive: "text-foreground/40 hover:text-foreground",
  buttonWrapperButton:
    "p-2.5 rounded-xl transition-all flex items-center gap-2",
};

export function TransactionsToolbar({
  sortBy,
  viewMode,
  transactionsFilter,
  onSortChange,
  onTransactionsFilterChange,
  onViewModeChange,
}: TransactionsToolbarProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-end gap-3">
        <div className="space-y-1">
          <Txt
            as="p"
            className="px-1 text-[0.575rem] uppercase font-medium tracking-wider text-foreground/40 flex items-center gap-1"
          >
            <ListOrdered className="size-3" />
            Order by
          </Txt>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => onSortChange(TRANSACTIONS_TOOLBAR_SORT_BY.RECENT)}
              className={cn(
                toolbarStyles.button,
                sortBy === TRANSACTIONS_TOOLBAR_SORT_BY.RECENT
                  ? toolbarStyles.active
                  : toolbarStyles.inactive,
              )}
            >
              MOST RECENT{" "}
              {sortBy === TRANSACTIONS_TOOLBAR_SORT_BY.RECENT && (
                <Check className="size-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => onSortChange(TRANSACTIONS_TOOLBAR_SORT_BY.STATUS)}
              className={cn(
                toolbarStyles.button,
                sortBy === TRANSACTIONS_TOOLBAR_SORT_BY.STATUS
                  ? toolbarStyles.active
                  : toolbarStyles.inactive,
              )}
            >
              STATUS{" "}
              {sortBy === TRANSACTIONS_TOOLBAR_SORT_BY.STATUS && (
                <Check className="size-3" />
              )}
            </Button>
          </div>
        </div>
        <div className="h-10 w-px bg-border/60" />
        <div className="space-y-1">
          <Txt
            as="p"
            className="px-1 text-[0.575rem] uppercase font-medium tracking-wider text-foreground/40 flex items-center gap-1"
          >
            <Filter className="size-3" />
            Status
          </Txt>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() =>
                onTransactionsFilterChange(
                  FETCH_USER_TRANSACTIONS_FILTER.ACTIVE,
                )
              }
              className={cn(
                toolbarStyles.button,
                transactionsFilter === FETCH_USER_TRANSACTIONS_FILTER.ACTIVE
                  ? toolbarStyles.active
                  : toolbarStyles.inactive,
              )}
            >
              ACTIVE{" "}
              {transactionsFilter === FETCH_USER_TRANSACTIONS_FILTER.ACTIVE && (
                <Check className="size-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                onTransactionsFilterChange(
                  FETCH_USER_TRANSACTIONS_FILTER.ARCHIVED,
                )
              }
              className={cn(
                toolbarStyles.button,
                transactionsFilter === FETCH_USER_TRANSACTIONS_FILTER.ARCHIVED
                  ? toolbarStyles.active
                  : toolbarStyles.inactive,
              )}
            >
              ARCHIVED{" "}
              {transactionsFilter ===
                FETCH_USER_TRANSACTIONS_FILTER.ARCHIVED && (
                <Check className="size-3" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className={toolbarStyles.buttonWrapper}>
        <button
          type="button"
          onClick={() => onViewModeChange(TRANSACTIONS_TOOLBAR_VIEW_MODE.GRID)}
          className={cn(
            toolbarStyles.buttonWrapperButton,
            viewMode === TRANSACTIONS_TOOLBAR_VIEW_MODE.GRID
              ? toolbarStyles.buttonWrapperActive
              : toolbarStyles.buttonWrapperInactive,
          )}
        >
          <LayoutGrid className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange(TRANSACTIONS_TOOLBAR_VIEW_MODE.LIST)}
          className={cn(
            toolbarStyles.buttonWrapperButton,
            viewMode === TRANSACTIONS_TOOLBAR_VIEW_MODE.LIST
              ? toolbarStyles.buttonWrapperActive
              : toolbarStyles.buttonWrapperInactive,
          )}
        >
          <List className="size-4" />
        </button>
      </div>
      </div>
    </div>
  );
}
