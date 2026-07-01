"use client";

import { Search, User } from "lucide-react";
import { FaGoogle, FaMicrosoft } from "react-icons/fa6";
import type { ContactResult } from "@/features/contacts/types";
import { getContactDisplayName } from "@/features/contacts/utils";
import { Input, Txt } from "@/shared/ui";

type ContactSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onDebouncedChange: (value: string) => void;
  debounceMs?: number;
  isLoading: boolean;
  noConnectedProviders: boolean;
  results: ContactResult[];
  providerFallback?: string | null;
  isAlreadyAdded?: (contact: ContactResult) => boolean;
  onSelect: (contact: ContactResult) => void;
};

export function ContactSearchBar({
  value,
  onChange,
  onDebouncedChange,
  debounceMs = 300,
  isLoading,
  noConnectedProviders,
  results,
  providerFallback = null,
  isAlreadyAdded,
  onSelect,
}: ContactSearchBarProps) {
  const hasQuery = value.trim().length > 0;

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onDebouncedChange={(nextValue) => onDebouncedChange(nextValue.trim())}
        debounceMs={debounceMs}
        placeholder="Search contacts..."
        leftIcon={<Search className="size-4" />}
        showClearButton
      />

      {hasQuery ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-black/10 bg-white shadow-default">
          {noConnectedProviders ? (
            <div className="px-4 py-3">
              <Txt as="p" size="sm" tone="muted">
                No connected accounts found. Please connect your Google or
                Microsoft account to import contacts.
              </Txt>
            </div>
          ) : isLoading ? (
            <div className="px-4 py-3">
              <Txt as="p" size="sm" tone="muted">
                Searching...
              </Txt>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3">
              <Txt as="p" size="sm" tone="muted">
                No contacts found.
              </Txt>
            </div>
          ) : (
            <div className="max-h-48 space-y-1 overflow-y-auto p-1">
              {results.map((contact, index) => {
                const alreadyAdded = isAlreadyAdded?.(contact) ?? false;

                return (
                  <button
                    key={buildContactKey(contact, index)}
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-transparent p-2 text-left transition-colors hover:border-black/10 hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-55"
                    disabled={alreadyAdded}
                    onClick={() => onSelect(contact)}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <ProviderIcon
                          provider={
                            contact.external_provider ?? providerFallback
                          }
                        />
                        <Txt
                          as="p"
                          size="sm"
                          weight="bold"
                          className="truncate"
                        >
                          {getContactDisplayName(contact)}
                        </Txt>
                        {alreadyAdded ? (
                          <span className="rounded-full bg-black/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground/60">
                            Already Added
                          </span>
                        ) : null}
                      </div>
                      <Txt as="p" size="xs" tone="muted" className="truncate">
                        {[
                          filterCompanyName(contact.company_name),
                          contact.email,
                          contact.phone_number,
                        ]
                          .filter(Boolean)
                          .join(" | ") || "No contact details"}
                      </Txt>
                    </div>
                    <Txt as="span" size="xs" tone="muted">
                      {alreadyAdded ? "Added" : "Select"}
                    </Txt>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ProviderIcon({ provider }: { provider?: string | null }) {
  const normalizedProvider = String(provider ?? "")
    .trim()
    .toLowerCase();

  if (
    normalizedProvider.includes("google") ||
    normalizedProvider.includes("gmail")
  ) {
    return <FaGoogle className="size-4 text-foreground/50" />;
  }
  if (
    normalizedProvider.includes("microsoft") ||
    normalizedProvider.includes("outlook")
  ) {
    return <FaMicrosoft className="size-4 text-foreground/50" />;
  }
  return <User className="size-4 text-foreground/50" />;
}

function buildContactKey(contact: ContactResult, index: number) {
  return [
    contact.id,
    contact.external_id,
    contact.email,
    contact.phone_number,
    String(index),
  ]
    .filter(Boolean)
    .join("-");
}

function filterCompanyName(companyName?: string | null) {
  const filteredCompany = ["gmail", "outlook"].filter(Boolean);
  if (filteredCompany.includes(companyName?.toLowerCase() ?? "")) {
    return "";
  }
  return companyName;
}
