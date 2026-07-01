const STORAGE_KEY = "subi_processing_file_id"

export const draftStorage = {
  getFileId(): string | null {
    if (typeof window === "undefined") return null
    return sessionStorage.getItem(STORAGE_KEY)
  },

  setFileId(fileId: string) {
    if (typeof window === "undefined") return
    sessionStorage.setItem(STORAGE_KEY, fileId)
  },

  clear() {
    if (typeof window === "undefined") return
    sessionStorage.removeItem(STORAGE_KEY)
  },
} as const
