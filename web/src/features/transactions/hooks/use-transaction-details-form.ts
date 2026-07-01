import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Transaction } from "@/features/workspace/types";
import {
  transactionDetailEditSchema,
  type TransactionDetailEditValues,
} from "@/features/transactions/schemas/transaction-detail-edit-schema";
import {
  applyRepresentingParty,
  deriveRepresentingPartyFromRows,
  emptyParty,
  formatPartyRowsToSummary,
  parseSummaryLineToParties,
} from "@/features/transactions/utils/transaction-party-helpers";
import { PSA_TYPE } from "@/features/transactions/constants";
import { TASK_QUERY_KEYS } from "@/features/tasks/constants";
import { useToast } from "@/shared/hooks/use-toast";

function transactionToFormValues(t: Transaction): TransactionDetailEditValues {
  const fromApiBuyers =
    t.buyerParties && t.buyerParties.length > 0 ? t.buyerParties : null;
  const fromApiSellers =
    t.sellerParties && t.sellerParties.length > 0 ? t.sellerParties : null;

  let buyers = fromApiBuyers
    ? [...fromApiBuyers]
    : parseSummaryLineToParties(t.buyers, t.representingParty === "buyer");
  let sellers = fromApiSellers
    ? [...fromApiSellers]
    : parseSummaryLineToParties(t.sellers, t.representingParty === "seller");

  if (buyers.length === 0) buyers = [emptyParty()];
  if (sellers.length === 0) sellers = [emptyParty()];

  const representingParty =
    t.representingParty ?? deriveRepresentingPartyFromRows(buyers, sellers);

  const synced = applyRepresentingParty(representingParty, buyers, sellers);

  return {
    address: t.address ?? "",
    price: t.price ?? "",
    closeDate: t.date ?? "",
    mutualAcceptanceDate: t.mutualAcceptanceDate ?? "",
    earnestMoney: t.earnestMoney ?? "",
    psaType: t.psaType ?? PSA_TYPE.RESIDENTIAL,
    representingParty,
    buyers: synced.buyers,
    sellers: synced.sellers,
    buyerAgent: {
      firstName: t.buyerAgent?.firstName ?? "",
      lastName: t.buyerAgent?.lastName ?? "",
      email: t.buyerAgent?.email ?? "",
      phone: t.buyerAgent?.phone ?? "",
    },
    sellerAgent: {
      firstName: t.sellerAgent?.firstName ?? "",
      lastName: t.sellerAgent?.lastName ?? "",
      email: t.sellerAgent?.email ?? "",
      phone: t.sellerAgent?.phone ?? "",
    },
    parcelNumber: t.parcelNumber ?? "",
    city: t.city ?? "",
    state: t.state ?? "",
    county: t.county ?? "",
    titleCompany: t.titleCompany ?? "",
    closingAgent: t.closingAgent ?? "",
    escrowEmail: t.escrowEmail ?? "",
    lender: t.lender ?? "",
    nwmlsNumber: t.nwmlsNumber ?? "",
    description: t.description ?? "",
    itemsThatStay: t.itemsThatStay ?? [],
    itemsThatStayDraft: "",
  };
}

type UseTransactionDetailsFormProps = {
  transaction: Transaction;
  onSave: (next: Transaction) => Promise<void>;
};

export function useTransactionDetailsForm({
  transaction,
  onSave,
}: UseTransactionDetailsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TransactionDetailEditValues>({
    resolver: zodResolver(transactionDetailEditSchema),
    defaultValues: transactionToFormValues(transaction),
  });

  useEffect(() => {
    form.reset(transactionToFormValues(transaction));
  }, [transaction, form]);

  const onSubmit = form.handleSubmit(
    async (values) => {
      const rep = values.representingParty;
      const { buyers: buyerRows, sellers: sellerRows } = applyRepresentingParty(
        rep,
        values.buyers,
        values.sellers,
      );
      const buyersSummary = formatPartyRowsToSummary(buyerRows);
      const sellersSummary = formatPartyRowsToSummary(sellerRows);

      const next: Transaction = {
        ...transaction,
        address: values.address,
        price: values.price,
        date: values.closeDate,
        mutualAcceptanceDate: values.mutualAcceptanceDate.trim(),
        earnestMoney: values.earnestMoney,
        psaType: values.psaType,
        buyers: buyersSummary || undefined,
        sellers: sellersSummary || undefined,
        buyerParties: buyerRows,
        sellerParties: sellerRows,
        buyerAgent: {
          firstName: values.buyerAgent.firstName,
          lastName: values.buyerAgent.lastName,
          email: values.buyerAgent.email,
          phone: values.buyerAgent.phone,
        },
        sellerAgent: {
          firstName: values.sellerAgent.firstName,
          lastName: values.sellerAgent.lastName,
          email: values.sellerAgent.email,
          phone: values.sellerAgent.phone,
        },
        representingParty: rep,
        parcelNumber: values.parcelNumber.trim() || undefined,
        city: values.city,
        state: values.state,
        county: values.county,
        titleCompany: values.titleCompany,
        closingAgent: values.closingAgent,
        escrowEmail: values.escrowEmail.trim() || undefined,
        lender: values.lender,
        nwmlsNumber: values.nwmlsNumber,
        description: values.description,
        itemsThatStay: values.itemsThatStay,
        progress: transaction.progress,
        hasTasks: transaction.hasTasks,
      };

      try {
        await onSave(next);

        const datesChanged =
          next.date !== transaction.date ||
          next.mutualAcceptanceDate !== transaction.mutualAcceptanceDate;

        if (datesChanged) {
          await queryClient.invalidateQueries({
            queryKey: TASK_QUERY_KEYS.all,
          });
        }

        toast({
          title: "Transaction updated",
          description: "Your changes were saved.",
        });
      } catch {
        toast({
          title: "Transaction save failed",
          description: "Try again in a moment.",
          variant: "destructive",
        });
      }
    },
    () => {
      toast({
        title: "Transaction save failed",
        variant: "destructive",
      });
    },
  );

  const handleContactsClick = useCallback(() => {
    const clientSection = document.getElementById("client-information");
    if (!clientSection) return;
    clientSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return {
    form,
    onSubmit,
    handleContactsClick,
    isSaving: form.formState.isSubmitting,
  };
}
