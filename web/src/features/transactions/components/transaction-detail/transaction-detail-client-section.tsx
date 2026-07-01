"use client";

import type {
  Control,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import type { TransactionDetailEditValues } from "@/features/transactions/schemas/transaction-detail-edit-schema";
import { TransactionDetailAgentContactCard } from "@/features/transactions/components/transaction-detail/transaction-detail-agent-contact-card";
import type { RepresentingParty } from "@/features/transactions/types";
import { FormSelectField } from "@/shared/ui";
import { useTransactionParties } from "../../hooks/use-transaction-parties";
import { ClientPartyColumn } from "./client-party-column";

type TransactionDetailClientSectionProps = {
  control: Control<TransactionDetailEditValues>;
  isSaving: boolean;
  setValue: UseFormSetValue<TransactionDetailEditValues>;
  getValues: UseFormGetValues<TransactionDetailEditValues>;
};

export function TransactionDetailClientSection({
  control,
  isSaving,
  setValue,
  getValues,
}: TransactionDetailClientSectionProps) {
  const {
    buyersArray,
    sellersArray,
    syncRepresentingToParties,
    handleImportParty,
  } = useTransactionParties({ control, setValue, getValues });

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-black/[0.06] bg-white/90 p-4 space-y-3 overflow-visible">
        <FormSelectField
          control={control}
          name="representingParty"
          label="I am representing"
          options={[
            { value: "buyer", label: "Buyer(s)" },
            { value: "seller", label: "Seller(s)" },
          ]}
          placeholder="Select who you are representing"
          onValueChange={(v) =>
            syncRepresentingToParties(v as RepresentingParty | null)
          }
          showMessage
          triggerClassName="h-12 rounded-2xl border-black/[0.08]"
        />
      </div>

      <ClientPartyColumn
        title="Buyers"
        partyType="buyers"
        fieldArray={buyersArray}
        control={control}
        getValues={getValues}
        isSaving={isSaving}
        minRows={1}
        onImportParty={(party) => handleImportParty("buyers", party)}
      />
      <ClientPartyColumn
        title="Sellers"
        partyType="sellers"
        fieldArray={sellersArray}
        control={control}
        getValues={getValues}
        isSaving={isSaving}
        minRows={1}
        onImportParty={(party) => handleImportParty("sellers", party)}
      />
      <TransactionDetailAgentContactCard
        title="Buyer Agent"
        namePrefix="buyerAgent"
        control={control}
        isSaving={isSaving}
      />
      <TransactionDetailAgentContactCard
        title="Seller Agent"
        namePrefix="sellerAgent"
        control={control}
        isSaving={isSaving}
      />
    </div>
  );
}