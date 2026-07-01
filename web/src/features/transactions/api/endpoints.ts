export const FILE_ENDPOINTS = {
  upload: "/file/upload",
  status: (id: string | number) => `/file/${id}/status`,
  analyze: (id: string | number) => `/file/${id}/analyze`,
  serve: (filename: string) => `/files/${filename}`,
} as const

export const TRANSACTION_ENDPOINTS = {
  list: "/transactions",
  listByUser: (userId: string) => `/transactions/user/${userId}`,
  create: "/transactions",
  get: (id: string | number) => `/transactions/${id}`,
  update: (id: string | number) => `/transactions/${id}`,
  delete: (id: string | number) => `/transactions/${id}`,
  addDocument: (transactionId: string | number) =>
    `/transactions/${transactionId}/user_uploads`,
  reprocess: (transactionId: string | number, uploadId: string | number) =>
    `/transactions/${transactionId}/user_uploads/${uploadId}/reprocess`,
  applyChecklist: (transactionId: string | number) =>
    `/transactions/${transactionId}/apply_checklist`,
  applyChecklistTemplate: (transactionId: string | number) =>
    `/transactions/${transactionId}/apply_checklist_template`,
} as const

export const CHECKLIST_ENDPOINTS = {
  list: "/checklists",
  create: "/checklists",
} as const

export const CHECKLIST_TEMPLATE_ENDPOINTS = {
  create: "/checklist_templates",
} as const

export const USER_UPLOAD_ENDPOINTS = {
  list: "/user_uploads",
  pending: "/user_uploads/pending",
  get: (id: string) => `/user_uploads/${id}`,
  byFilename: (filename: string) => `/user_uploads/by_filename/${filename}`,
  cancel: (id: string) => `/user_uploads/${id}/cancel`,
  analysis: (id: string) => `/user_uploads/${id}/transaction_analysis`,
} as const
