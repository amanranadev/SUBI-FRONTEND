export const TASK_ENDPOINTS = {
  list: "/transaction_tasks",
  create: "/transaction_tasks",
  get: (id: string | number) => `/transaction_tasks/${id}`,
  update: (id: string | number) => `/transaction_tasks/${id}`,
  delete: (id: string | number) => `/transaction_tasks/${id}`,
} as const
