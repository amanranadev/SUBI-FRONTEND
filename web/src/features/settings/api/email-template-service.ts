import { apiClient } from "@/lib/api/client"

export type EmailTemplateSource = "manual" | "ai_chat" | "ai_document"

export interface EmailTemplateRecord {
  id: string
  name: string
  content: string
  description: string | null
  source: EmailTemplateSource
  created_at: string
  updated_at: string
}

interface EmailTemplatesIndexResponse {
  email_templates: EmailTemplateRecord[]
  meta: {
    current_page: number
    total_pages: number
    total_count: number
    per_page: number
  }
}

export async function listEmailTemplates(search?: string): Promise<EmailTemplateRecord[]> {
  const { data } = await apiClient.get<EmailTemplatesIndexResponse>("/email_templates", {
    params: search ? { search } : undefined,
  })
  return data.email_templates
}

export async function createEmailTemplate(input: {
  name: string
  content: string
  description?: string
}): Promise<EmailTemplateRecord> {
  const { data } = await apiClient.post<EmailTemplateRecord>("/email_templates", input)
  return data
}

export async function updateEmailTemplate(
  id: string,
  input: { name: string; content: string; description?: string },
): Promise<EmailTemplateRecord> {
  const { data } = await apiClient.patch<EmailTemplateRecord>(`/email_templates/${id}`, input)
  return data
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  await apiClient.delete(`/email_templates/${id}`)
}

export async function createEmailTemplateWithAi(input: {
  name?: string
  description?: string
  instruction_text?: string
  upload_id?: string
}): Promise<EmailTemplateRecord> {
  const { data } = await apiClient.post<{ email_template: EmailTemplateRecord }>(
    "/email_templates/ai_create",
    input,
  )
  return data.email_template
}

export async function saveGeneratedEmailTemplate(input: {
  name: string
  content: string
  description?: string
  source?: EmailTemplateSource
}): Promise<{ duplicated: boolean; email_template: EmailTemplateRecord; message: string }> {
  const { data } = await apiClient.post<{
    duplicated: boolean
    email_template: EmailTemplateRecord
    message: string
  }>("/email_templates/save_generated", input)
  return data
}
