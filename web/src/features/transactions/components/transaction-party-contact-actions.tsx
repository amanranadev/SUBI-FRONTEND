"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { ContactSearchBar } from "@/features/contacts/components";
import type { ContactProvider, ContactResult } from "@/features/contacts/types";
import { searchContactsFromProvider } from "@/features/contacts/api/contact-service";
import { getContactDisplayName } from "@/features/contacts/utils";
import { listConnectedAccounts } from "@/features/settings/api/profile-connected-accounts-service";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/shared/ui";

type PartyDraft = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  representing: boolean;
};

type TransactionPartyContactActionsProps = {
  addLabel: string;
  importLabel?: string;
  disabled?: boolean;
  existingParties?: PartyDraft[];
  onAddManual: () => void;
  onImportParty: (party: PartyDraft) => void;
};

const CONNECTED_PROVIDER_TO_CONTACT_PROVIDER: Record<string, ContactProvider> = {
  google_oauth2: "google_oauth2",
  microsoft_graph: "microsoft_graph",
};

function splitContactName(fullName: string) {
  const trimmed = fullName.trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const [firstName, ...rest] = trimmed.split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

function mapContactToParty(contact: ContactResult): PartyDraft {
  const displayName = getContactDisplayName(contact);
  const { firstName, lastName } = splitContactName(displayName);
  return {
    firstName,
    lastName,
    email: contact.email ?? "",
    phone: contact.phone_number ?? "",
    representing: false,
  };
}

export function TransactionPartyContactActions({
  addLabel,
  importLabel = "Import from contacts",
  disabled = false,
  existingParties = [],
  onAddManual,
  onImportParty,
}: TransactionPartyContactActionsProps) {
  const { user } = useAuth();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");

  const connectedAccountsQuery = useQuery({
    queryKey: [
      "transactions",
      "party-contact-actions",
      "connected-accounts",
      user?.id,
    ],
    queryFn: () => listConnectedAccounts(user!.id),
    enabled: Boolean(user?.id),
    staleTime: 20_000,
  });

  const connectedProviders = useMemo(
    () =>
      (connectedAccountsQuery.data ?? [])
        .map((account) => CONNECTED_PROVIDER_TO_CONTACT_PROVIDER[account.provider])
        .filter(Boolean),
    [connectedAccountsQuery.data],
  );

  const selectedProvider = connectedProviders[0] ?? null;

  const providerSearchQuery = useQuery({
    queryKey: [
      "transactions",
      "party-contact-actions",
      "provider-search",
      selectedProvider,
      appliedSearchTerm,
    ],
    queryFn: () => searchContactsFromProvider(selectedProvider!, appliedSearchTerm),
    enabled:
      isImportOpen &&
      Boolean(selectedProvider) &&
      appliedSearchTerm.trim().length >= 2,
    staleTime: 15_000,
  });

  const results = providerSearchQuery.data?.contacts ?? [];
  const providerFallback =
    providerSearchQuery.data?.provider ?? selectedProvider ?? null;
  const existingPartyFingerprintSet = useMemo(
    () =>
      new Set(
        existingParties
          .map((party) => buildPartyFingerprint(party))
          .filter(Boolean),
      ),
    [existingParties],
  );

  return (
    <div className="relative overflow-visible">
      <div className="flex w-full flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 rounded-xl font-bold"
          disabled={disabled}
          onClick={() => {
            setIsImportOpen((prev) => !prev);
            if (isImportOpen) {
              setSearchInputValue("");
              setAppliedSearchTerm("");
            }
          }}
        >
          {importLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 rounded-xl font-bold"
          disabled={disabled}
          onClick={onAddManual}
        >
          <Plus className="size-4" />
          {addLabel}
        </Button>
      </div>

      {isImportOpen ? (
        <div className="mt-2 w-full rounded-2xl border border-black/10 bg-black/[0.02] p-3 shadow-default">
          <ContactSearchBar
            value={searchInputValue}
            onChange={setSearchInputValue}
            onDebouncedChange={setAppliedSearchTerm}
            debounceMs={300}
            isLoading={providerSearchQuery.isLoading}
            noConnectedProviders={connectedProviders.length === 0}
            results={results}
            providerFallback={providerFallback}
            isAlreadyAdded={(contact) =>
              existingPartyFingerprintSet.has(
                buildPartyFingerprint(mapContactToParty(contact)),
              )
            }
            onSelect={(contact) => {
              onImportParty(mapContactToParty(contact));
              setIsImportOpen(false);
              setSearchInputValue("");
              setAppliedSearchTerm("");
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

// Backward-compatible alias while we migrate imports.
export { TransactionPartyContactActions as TransactionPartyInlineActions };

function buildPartyFingerprint(party: PartyDraft) {
  const email = party.email.trim().toLowerCase();
  const phone = party.phone.replace(/\D/g, "");
  const name = `${party.firstName} ${party.lastName}`.trim().toLowerCase();

  if (email) return `email:${email}`;
  if (phone) return `phone:${phone}`;
  if (name) return `name:${name}`;
  return "";
}
