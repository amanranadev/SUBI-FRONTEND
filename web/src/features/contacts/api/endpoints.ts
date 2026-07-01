export const CONTACT_ENDPOINTS = {
  list: "/contacts",
  create: "/contacts",
  get: (id: string | number) => `/contacts/${id}`,
  update: (id: string | number) => `/contacts/${id}`,
  delete: (id: string | number) => `/contacts/${id}`,
  search: (query: string) => `/contacts/search?q=${encodeURIComponent(query)}`,
  searchProvider: (provider: string, query: string) =>
    `/contacts/search_provider?provider=${encodeURIComponent(provider)}&q=${encodeURIComponent(query)}`,
  importFromProvider: "/contacts/import_from_provider",
  toggleFavorite: (id: string | number) => `/contacts/${id}/toggle_favorite`,
} as const
