import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/shared/hooks/use-toast"
import {
  createContact,
  deleteContact,
  fetchContacts,
  toggleFavoriteContact,
  updateContact,
} from "../api"
import { ALL_VENDOR_TYPE, CONTACT_QUERY_KEYS } from "../constants"
import type {
  ContactFilters,
  CreateContactData,
  UpdateContactData,
} from "../types"

export function useContacts(filters?: ContactFilters) {
  const normalizedSearch = filters?.search?.trim() || ""
  const normalizedVendorType = filters?.vendorType || ALL_VENDOR_TYPE

  return useQuery({
    queryKey: CONTACT_QUERY_KEYS.list(normalizedSearch, normalizedVendorType),
    queryFn: () =>
      fetchContacts({
        ...filters,
        search: normalizedSearch || undefined,
        vendorType:
          normalizedVendorType === ALL_VENDOR_TYPE
            ? undefined
            : normalizedVendorType,
      }),
    staleTime: 2 * 60 * 1000,
  })
}

export function useContactsManager() {
  const queryClient = useQueryClient()

  const invalidateContacts = async () => {
    await queryClient.invalidateQueries({
      queryKey: CONTACT_QUERY_KEYS.all,
      exact: false,
    })
  }

  const createContactMutation = useMutation({
    mutationFn: (payload: CreateContactData) => createContact(payload),
    onSuccess: async () => {
      await invalidateContacts()
      toast({
        title: "Contact created",
        description: "The contact was added successfully.",
      })
    },
    onError: () => {
      toast({
        title: "Create failed",
        description: "Unable to create the contact right now.",
        variant: "destructive",
      })
    },
  })

  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContactData }) =>
      updateContact(id, data),
    onSuccess: async () => {
      await invalidateContacts()
      toast({
        title: "Contact updated",
        description: "The contact was updated successfully.",
      })
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Unable to update the contact right now.",
        variant: "destructive",
      })
    },
  })

  const deleteContactMutation = useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: async () => {
      await invalidateContacts()
      toast({
        title: "Contact deleted",
        description: "The contact was deleted successfully.",
      })
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Unable to delete the contact right now.",
        variant: "destructive",
      })
    },
  })

  const toggleFavoriteMutation = useMutation({
    mutationFn: (id: string) => toggleFavoriteContact(id),
    onSuccess: async () => {
      await invalidateContacts()
    },
    onError: () => {
      toast({
        title: "Favorite update failed",
        description: "Unable to update favorite status right now.",
        variant: "destructive",
      })
    },
  })

  return {
    createContact: createContactMutation.mutateAsync,
    updateContact: (id: string, data: UpdateContactData) =>
      updateContactMutation.mutateAsync({ id, data }),
    deleteContact: deleteContactMutation.mutateAsync,
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    loading:
      createContactMutation.isPending ||
      updateContactMutation.isPending ||
      deleteContactMutation.isPending ||
      toggleFavoriteMutation.isPending,
  }
}
