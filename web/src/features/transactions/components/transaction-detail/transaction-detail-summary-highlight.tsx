"use client";

import {
  CalendarCheck2,
  CalendarClock,
  CircleDollarSign,
  HandCoins,
  Users,
} from "lucide-react";
import type { Transaction } from "@/features/workspace/types";
import { parseDateValue } from "@/shared/utils/dateUtils";
import { Txt } from "@/shared/ui";

type TransactionDetailSummaryHighlightProps = {
  transaction: Transaction;
  onContactsClick?: () => void;
};

type SummaryMetric = {
  key: string;
  label: string;
  value: string;
  icon: typeof Users;
  iconClassName: string;
};

const emptyMetricValue = "—";

export function TransactionDetailSummaryHighlight({
  transaction,
  onContactsClick,
}: TransactionDetailSummaryHighlightProps) {
  const metrics: SummaryMetric[] = [
    {
      key: "contacts",
      label: "Contacts",
      value: resolveContactsSummary(transaction),
      icon: Users,
      iconClassName:
        "bg-sky-500/15 text-sky-700 dark:bg-sky-400/20 dark:text-sky-300",
    },
    {
      key: "emd",
      label: "EMD",
      value: normalizeValue(transaction.earnestMoney),
      icon: HandCoins,
      iconClassName:
        "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300",
    },
    {
      key: "closeDate",
      label: "Close Date",
      value: formatDate(transaction.date),
      icon: CalendarCheck2,
      iconClassName:
        "bg-violet-500/15 text-violet-700 dark:bg-violet-400/20 dark:text-violet-300",
    },
    {
      key: "salePrice",
      label: "Sale Price",
      value: normalizeValue(transaction.price),
      icon: CircleDollarSign,
      iconClassName:
        "bg-amber-500/15 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300",
    },
    {
      key: "pendingDate",
      label: "Pending Date",
      value: formatDate(transaction.mutualAcceptanceDate),
      icon: CalendarClock,
      iconClassName:
        "bg-rose-500/15 text-rose-700 dark:bg-rose-400/20 dark:text-rose-300",
    },
  ];

  return (
    <section className="rounded-[3rem] bg-white/70 px-6 py-7 shadow-default backdrop-blur-3xl dark:bg-white/[0.04] md:px-8 md:py-8">
      <div className="mb-6 space-y-2">
        <Txt
          as="p"
          size="xs"
          className="m-0 font-bold uppercase tracking-widest text-foreground/40"
        >
          Transaction Summary
        </Txt>
        <Txt as="h2" size="2xl" weight="bold" className="m-0 tracking-tight">
          {normalizeValue(transaction.address)}
        </Txt>
        <Txt size="sm" tone="muted" className="m-0">
          Quick snapshot for contacts, money and critical dates.
        </Txt>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          if (metric.key === "contacts" && onContactsClick) {
            return (
              <button
                key={metric.key}
                type="button"
                onClick={onContactsClick}
                className="rounded-[1.5rem] bg-white/70 p-5 text-left backdrop-blur transition-colors hover:bg-white/90 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
              >
                <div
                  className={`mb-4 flex size-10 items-center justify-center rounded-xl ${metric.iconClassName}`}
                >
                  <Icon className="size-5" strokeWidth={2} />
                </div>
                <Txt
                  as="p"
                  size="xs"
                  className="m-0 font-bold uppercase tracking-widest text-foreground/40"
                >
                  {metric.label}
                </Txt>
                <Txt
                  as="p"
                  size="base"
                  weight="semibold"
                  className="mt-2 mb-0 break-words text-foreground/90"
                >
                  {metric.value}
                </Txt>
              </button>
            );
          }

          return (
            <div
              key={metric.key}
              className="rounded-[1.5rem] bg-white/70 p-5 backdrop-blur transition-colors hover:bg-white/90 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
            >
              <div
                className={`mb-4 flex size-10 items-center justify-center rounded-xl ${metric.iconClassName}`}
              >
                <Icon className="size-5" strokeWidth={2} />
              </div>
              <Txt
                as="p"
                size="xs"
                className="m-0 font-bold uppercase tracking-widest text-foreground/40"
              >
                {metric.label}
              </Txt>
              <Txt
                as="p"
                size="base"
                weight="semibold"
                className="mt-2 mb-0 break-words text-foreground/90"
              >
                {metric.value}
              </Txt>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function formatDate(value: string | undefined): string {
  if (!value) return emptyMetricValue;
  const parsedDate = parseDateValue(value);
  if (!parsedDate) return value.trim() || emptyMetricValue;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function resolveContactsSummary(transaction: Transaction): string {
  const fullNames = [...(transaction.buyerParties ?? []), ...(transaction.sellerParties ?? [])]
    .map((party) => `${party.firstName} ${party.lastName}`.trim())
    .filter(Boolean);

  if (fullNames.length > 0) {
    return summarizeList(fullNames);
  }

  const fallbackContacts = [transaction.buyers, transaction.sellers]
    .filter(Boolean)
    .join(", ")
    .trim();

  return fallbackContacts || emptyMetricValue;
}

function summarizeList(values: string[]): string {
  if (values.length === 0) return emptyMetricValue;
  if (values.length === 1) return values[0];
  return `${values[0]} +${values.length - 1}`;
}

function normalizeValue(value: string | undefined): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : emptyMetricValue;
}
