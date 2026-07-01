"use client"

import * as React from "react"
import {
  ChevronDown,
  Grid3X3,
  List,
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react"
import {
  ALL_VENDOR_TYPE,
  CONTACT_VIEW_MODES,
} from "@/features/contacts/constants"
import {
  ContactCard,
  ContactFormModal,
  DeleteContactDialog,
} from "@/features/contacts/components"
import { useContacts, useContactsManager } from "@/features/contacts/hooks"
import { importContactsFromProvider } from "@/features/contacts/api"
import type { ContactResult, CreateContactData } from "@/features/contacts/types"
import { mapBackendTypeToFrontendType } from "@/features/contacts/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CONTACT_QUERY_KEYS } from "@/features/contacts/constants"
import { useToast } from "@/shared/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Button } from "@/shared/ui/button"
import { FormSelect } from "@/shared/ui/form-select"
import { Input } from "@/shared/ui/input"
import { LoadingSpinner } from "@/shared/ui/loading-spinner"

type ViewMode = (typeof CONTACT_VIEW_MODES)[keyof typeof CONTACT_VIEW_MODES]

export function ContactsView() {
  const [isFilterMounted, setIsFilterMounted] = React.useState(false)
  const [searchInputValue, setSearchInputValue] = React.useState("")
  const [appliedSearchTerm, setAppliedSearchTerm] = React.useState("")
  const [selectedVendorType, setSelectedVendorType] =
    React.useState<string>(ALL_VENDOR_TYPE)
  const [viewMode, setViewMode] = React.useState<ViewMode>(
    CONTACT_VIEW_MODES.GRID,
  )
  const [editingContact, setEditingContact] = React.useState<ContactResult | null>(
    null,
  )
  const [deletingContact, setDeletingContact] =
    React.useState<ContactResult | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const { data, isLoading, error } = useContacts({
    search: appliedSearchTerm || undefined,
    vendorType:
      selectedVendorType === ALL_VENDOR_TYPE ? undefined : selectedVendorType,
  })
  const {
    createContact,
    updateContact,
    deleteContact,
    toggleFavorite,
    loading: isMutating,
  } = useContactsManager()

  const { toast } = useToast()
  const queryClient = useQueryClient()
  const syncGoogleMutation = useMutation({
    mutationFn: () => importContactsFromProvider("google_oauth2"),
    onSuccess: (count) => {
      void queryClient.invalidateQueries({ queryKey: CONTACT_QUERY_KEYS.all, exact: false })
      toast({
        title: "Google contacts synced",
        description: count > 0 ? `Imported ${count} contact${count !== 1 ? "s" : ""}.` : "No new contacts to import.",
      })
    },
    onError: () => {
      toast({
        title: "Sync failed",
        description: "Make sure your Google account is connected in Settings.",
        variant: "destructive",
      })
    },
  })

  const contacts = data?.contacts || []

  React.useEffect(() => {
    setIsFilterMounted(true)
  }, [])

  const filteredContacts = React.useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch = appliedSearchTerm
        ? [
            contact.individual_name,
            contact.company_name,
            contact.email,
            contact.phone_number,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(appliedSearchTerm.toLowerCase()),
            )
        : true

      const displayVendorType = mapBackendTypeToFrontendType(contact.vendor_type)
      const matchesVendorType =
        selectedVendorType === ALL_VENDOR_TYPE ||
        displayVendorType === selectedVendorType ||
        contact.vendor_type === selectedVendorType

      return matchesSearch && matchesVendorType
    })
  }, [appliedSearchTerm, contacts, selectedVendorType])

  const vendorTypeOptions = React.useMemo(() => {
    const types = Array.from(
      new Set(
        contacts
          .map((contact) => mapBackendTypeToFrontendType(contact.vendor_type))
          .filter(Boolean),
      ),
    ).sort()

    return [
      { value: ALL_VENDOR_TYPE, label: "All vendor types" },
      ...types.map((type) => ({
        value: type,
        label: `${type} (${contacts.filter(
          (contact) => mapBackendTypeToFrontendType(contact.vendor_type) === type,
        ).length})`,
      })),
    ]
  }, [contacts])

  const selectedVendorTypeLabel = React.useMemo(() => {
    return (
      vendorTypeOptions.find((option) => option.value === selectedVendorType)
        ?.label ?? "All vendor types"
    )
  }, [selectedVendorType, vendorTypeOptions])

  const handleAddContact = () => {
    setEditingContact(null)
    setIsModalOpen(true)
  }

  const handleEditContact = (contact: ContactResult) => {
    setEditingContact(contact)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingContact(null)
    setIsModalOpen(false)
  }

  const handleSaveContact = async (payload: CreateContactData) => {
    if (editingContact) {
      await updateContact(editingContact.id, payload)
    } else {
      await createContact(payload)
    }

    handleCloseModal()
    return true
  }

  const handleConfirmDelete = async () => {
    if (!deletingContact) {
      return
    }

    await deleteContact(deletingContact.id)
    setDeletingContact(null)
  }

  const handleToggleFavorite = async (contactId: string) => {
    await toggleFavorite(contactId)
  }

  return (
    <div className="mx-auto w-full max-w-7xl animate-in fade-in slide-in-from-bottom-8 space-y-10 pb-32 duration-700">
      <div className="flex flex-col gap-4 border-b border-black/[0.03] pb-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tighter leading-none">
            Contacts
          </h1>
          <p className="text-sm font-medium tracking-tight opacity-40">
            Manage vendor and service provider relationships in one place.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={searchInputValue}
            onChange={(event) => setSearchInputValue(event.target.value)}
            onDebouncedChange={(value) => setAppliedSearchTerm(value.trim())}
            debounceMs={400}
            leftIcon={<Search className="size-4" />}
            placeholder="Search contacts"
            className="h-12 rounded-2xl"
            containerClassName="w-full sm:w-80"
            showClearButton
          />

          {isFilterMounted ? (
            <FormSelect
              value={selectedVendorType}
              onValueChange={setSelectedVendorType}
              options={vendorTypeOptions}
              className="h-12 min-w-56 rounded-2xl"
              placeholder="All vendor types"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-12 min-w-56 items-center justify-between rounded-2xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm"
            >
              <span className="truncate">{selectedVendorTypeLabel}</span>
              <ChevronDown className="size-4 shrink-0 opacity-50" />
            </div>
          )}

          <div className="flex items-center gap-1 rounded-2xl border border-black/[0.03] bg-black/[0.03] p-1 shadow-default">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-xl",
                viewMode === CONTACT_VIEW_MODES.GRID
                  ? "bg-white shadow-default"
                  : "opacity-40 hover:opacity-100",
              )}
              onClick={() => setViewMode(CONTACT_VIEW_MODES.GRID)}
            >
              <Grid3X3 className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-xl",
                viewMode === CONTACT_VIEW_MODES.LIST
                  ? "bg-white shadow-default"
                  : "opacity-40 hover:opacity-100",
              )}
              onClick={() => setViewMode(CONTACT_VIEW_MODES.LIST)}
            >
              <List className="size-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => syncGoogleMutation.mutate()}
            disabled={syncGoogleMutation.isPending}
            className="!rounded-2xl px-5 font-bold gap-2"
          >
            {syncGoogleMutation.isPending ? (
              <LoadingSpinner size="md" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            {syncGoogleMutation.isPending ? "Syncing..." : "Sync Google"}
          </Button>
          <Button onClick={handleAddContact} className="!rounded-2xl px-5 font-bold gap-2">
            <Plus className="size-4" />
            Add Contact
          </Button>
        </div>
      </div>

      <ContactFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveContact}
        contact={editingContact}
        isSubmitting={isMutating}
      />

      <DeleteContactDialog
        open={Boolean(deletingContact)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingContact(null)
          }
        }}
        contact={deletingContact}
        onConfirm={handleConfirmDelete}
        isDeleting={isMutating}
      />

      {isLoading ? (
        <div className="glass-card rounded-[2rem] border-white/60 p-10 text-center shadow-default">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-foreground/15 border-t-foreground/60" />
          <p className="text-sm font-medium text-foreground/55">
            Loading contacts...
          </p>
        </div>
      ) : error ? (
        <div className="glass-card rounded-[2rem] border-white/60 p-10 text-center shadow-default">
          <p className="text-sm font-medium text-destructive">
            Unable to load contacts right now.
          </p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="glass-card rounded-[2rem] border-white/60 p-12 text-center shadow-default">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-black/[0.04] text-foreground/35">
            <Users className="size-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">No contacts found</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground/50">
            {appliedSearchTerm || selectedVendorType !== ALL_VENDOR_TYPE
              ? "Try adjusting the search or vendor filter."
              : "Add your first contact to start building your vendor network."}
          </p>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === CONTACT_VIEW_MODES.GRID
              ? "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
              : "space-y-4",
          )}
        >
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              viewMode={viewMode}
              isBusy={isMutating}
              onEdit={handleEditContact}
              onDelete={setDeletingContact}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  )
}
