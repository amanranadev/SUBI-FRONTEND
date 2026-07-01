import { apiClient } from "@/lib/api/client"
import {
  CHECKLIST_ENDPOINTS,
  CHECKLIST_TEMPLATE_ENDPOINTS,
  TRANSACTION_ENDPOINTS,
} from "./endpoints"

export type ChecklistTemplateTask = {
  id?: string
  name: string
  daysOffset?: number
  days_offset?: number
}

export type ChecklistTemplate = {
  id: string
  name: string
  description?: string
  taskCount?: number
  tasks?: ChecklistTemplateTask[]
  isGlobal?: boolean
  userId?: string | null
  teamId?: string | null
}

type ChecklistListResponse =
  | ChecklistTemplate[]
  | {
      data?: ChecklistTemplate[]
    }

export async function fetchChecklistTemplates(): Promise<ChecklistTemplate[]> {
  const { data } = await apiClient.get<ChecklistListResponse>(CHECKLIST_ENDPOINTS.list)

  if (Array.isArray(data)) {
    return data
  }

  return Array.isArray(data?.data) ? data.data : []
}

type ChecklistTaskCreateInput = {
  name: string
  days_offset?: number
  priority?: string
  position?: number
}

type ChecklistCreatePayload = {
  name: string
  description?: string
  checklist_tasks_attributes: ChecklistTaskCreateInput[]
}

type ChecklistCreateResponse = {
  id: string
}

export async function createChecklistTemplate(
  payload: ChecklistCreatePayload,
): Promise<ChecklistCreateResponse> {
  const { data } = await apiClient.post<ChecklistCreateResponse>(
    CHECKLIST_ENDPOINTS.create,
    {
      checklist: payload,
    },
  )

  return data
}

export type ChecklistTemplateItemPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

type ChecklistTemplateTaskCreateInput = {
  name: string
  label?: string
  days_offset?: number
  priority: ChecklistTemplateItemPriority
  position: number
}

type ChecklistTemplateRecordCreatePayload = {
  checklist_template: {
    name: string
    checklistName: string
    description?: string
    checklist_tasks_attributes: ChecklistTemplateTaskCreateInput[]
  }
}

export type ChecklistTemplateRecordTask = {
  id: string
  name: string
  daysOffset?: number
  priority: ChecklistTemplateItemPriority
  position: number
  label?: string
  checklistId?: string | null
  checklistTemplateId?: string | null
  fromChecklist?: boolean
}

export type ChecklistTemplateRecord = {
  id: string
  name: string
  templateName?: string
  checklistName?: string
  description?: string
  taskCount?: number
  isGlobal?: boolean
  userId?: string | null
  teamId?: string | null
  createdAt?: string
  updatedAt?: string
  tasks: ChecklistTemplateRecordTask[]
}

type ChecklistTemplateRecordCreateResponse = ChecklistTemplateRecord & {
  success?: boolean
}

export async function createChecklistTemplateRecord(
  payload: ChecklistTemplateRecordCreatePayload,
): Promise<ChecklistTemplateRecord> {
  const { data } = await apiClient.post<ChecklistTemplateRecordCreateResponse>(
    CHECKLIST_TEMPLATE_ENDPOINTS.create,
    payload,
  )

  return data
}

type ChecklistTemplateRecordListResponse = {
  data: ChecklistTemplateRecord[]
  success?: boolean
}

export async function fetchChecklistTemplateRecords(params?: {
  search?: string
  page?: number
  perPage?: number
}): Promise<ChecklistTemplateRecordListResponse> {
  const { data } = await apiClient.get<ChecklistTemplateRecordListResponse>(
    CHECKLIST_TEMPLATE_ENDPOINTS.create,
    {
      params: {
        ...(params?.search ? { search: params.search } : {}),
      },
    },
  )

  return data
}

type ApplyChecklistResponse = {
  success: boolean
  createdCount?: number
  checklistId?: string
}

export async function applyChecklistToTransaction(params: {
  transactionId: string
  checklistId: string
  baseDate?: string
}): Promise<ApplyChecklistResponse> {
  const { data } = await apiClient.post<ApplyChecklistResponse>(
    TRANSACTION_ENDPOINTS.applyChecklist(params.transactionId),
    {
      checklist_id: params.checklistId,
      ...(params.baseDate ? { base_date: params.baseDate } : {}),
    },
  )

  return data
}

type ApplyChecklistTemplateResponse = {
  success: boolean
  createdCount: number
  skippedCount: number
  checklistTemplateId: string
  transactionId: string
}

export async function applyChecklistTemplateToTransaction(params: {
  transactionId: string
  checklistTemplateId: string
  baseDate?: string
}): Promise<ApplyChecklistTemplateResponse> {
  const { data } = await apiClient.post<ApplyChecklistTemplateResponse>(
    TRANSACTION_ENDPOINTS.applyChecklistTemplate(params.transactionId),
    {
      checklist_template_id: params.checklistTemplateId,
      ...(params.baseDate ? { base_date: params.baseDate } : {}),
    },
  )

  return data
}
