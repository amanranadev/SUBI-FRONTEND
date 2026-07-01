import { apiClient } from "@/lib/api/client"
import type {
  ContactFilters,
  ContactListResponse,
  ContactProvider,
  ContactResult,
  CreateContactData,
  UpdateContactData,
} from "../types"
import {
  extractContactResult,
  extractContactsListResponse,
  mapContactDataToApiPayload,
} from "../utils"
import { CONTACT_ENDPOINTS } from "./endpoints"

function buildListParams(filters?: ContactFilters) {
  if (!filters) {
    return undefined
  }

  const params = {
    vendorType: filters.vendorType,
    provider: filters.provider,
    favorites: filters.favorites,
    search: filters.search?.trim() || undefined,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
  }

  return Object.values(params).some((value) => value !== undefined)
    ? params
    : undefined
}

export async function fetchContacts(
  filters?: ContactFilters,
): Promise<ContactListResponse> {
  const params = buildListParams(filters)
  const { data } = await apiClient.get<unknown>(
    CONTACT_ENDPOINTS.list,
    params ? { params } : undefined,
  )

  return extractContactsListResponse(data)
}

export async function searchContactsFromProvider(
  provider: ContactProvider,
  query: string,
): Promise<ContactListResponse> {
  const { data } = await apiClient.get<unknown>(
    CONTACT_ENDPOINTS.searchProvider(provider, query.trim()),
  )

  return extractContactsListResponse(data)
}

export async function fetchContact(id: string): Promise<ContactResult | null> {
  const { data } = await apiClient.get<unknown>(CONTACT_ENDPOINTS.get(id))
  return extractContactResult(data)
}

export async function createContact(
  payload: CreateContactData,
): Promise<ContactResult | null> {
  const { data } = await apiClient.post<unknown>(
    CONTACT_ENDPOINTS.create,
    mapContactDataToApiPayload(payload),
  )

  return extractContactResult(data)
}

export async function updateContact(
  id: string,
  payload: UpdateContactData,
): Promise<ContactResult | null> {
  const { data } = await apiClient.put<unknown>(
    CONTACT_ENDPOINTS.update(id),
    mapContactDataToApiPayload(payload),
  )

  return extractContactResult(data)
}

export async function deleteContact(id: string): Promise<void> {
  await apiClient.delete(CONTACT_ENDPOINTS.delete(id))
}

export async function toggleFavoriteContact(
  id: string,
): Promise<ContactResult | null> {
  const { data } = await apiClient.patch<unknown>(
    CONTACT_ENDPOINTS.toggleFavorite(id),
  )

  return extractContactResult(data)
}

export async function importContactsFromProvider(
  provider: ContactProvider,
): Promise<number> {
  const { data } = await apiClient.post<{
    imported_count?: number
    importedCount?: number
    data?: { imported_count?: number; importedCount?: number }
  }>(CONTACT_ENDPOINTS.importFromProvider, { provider })

  return (
    data?.imported_count ??
    data?.importedCount ??
    data?.data?.imported_count ??
    data?.data?.importedCount ??
    0
  )
}
