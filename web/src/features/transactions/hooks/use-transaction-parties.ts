import { useFieldArray } from "react-hook-form";
import type { Control, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import type { TransactionDetailEditValues } from "@/features/transactions/schemas/transaction-detail-edit-schema";
import { applyRepresentingParty } from "@/features/transactions/utils/transaction-party-helpers";
import type { RepresentingParty } from "@/features/transactions/types";

type UseTransactionPartiesProps = {
  control: Control<TransactionDetailEditValues>;
  setValue: UseFormSetValue<TransactionDetailEditValues>;
  getValues: UseFormGetValues<TransactionDetailEditValues>;
};

export function useTransactionParties({
  control,
  setValue,
  getValues,
}: UseTransactionPartiesProps) {
  const buyersArray = useFieldArray({ control, name: "buyers" });
  const sellersArray = useFieldArray({ control, name: "sellers" });

  const syncRepresentingToParties = (party: RepresentingParty | null) => {
    const values = getValues();
    const next = applyRepresentingParty(party, values.buyers, values.sellers);
    setValue("buyers", next.buyers, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("sellers", next.sellers, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const mapImportedPartyWithRepresenting = (
    partyType: "buyers" | "sellers",
    party: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      representing: boolean;
    },
  ) => {
    const representingParty = getValues("representingParty");
    const shouldRepresent =
      representingParty === (partyType === "buyers" ? "buyer" : "seller");
    return { ...party, representing: shouldRepresent };
  };

  const handleImportParty = (
    partyType: "buyers" | "sellers",
    party: TransactionDetailEditValues["buyers"][number]
  ) => {
    const mappedParty = mapImportedPartyWithRepresenting(partyType, party);
    if (partyType === "buyers") {
      buyersArray.append(mappedParty);
    } else {
      sellersArray.append(mappedParty);
    }
  };

  return {
    buyersArray,
    sellersArray,
    syncRepresentingToParties,
    handleImportParty,
  };
}
