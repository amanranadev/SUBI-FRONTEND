"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  createEmailTemplate,
  deleteEmailTemplate,
  listEmailTemplates,
  updateEmailTemplate,
  type EmailTemplateRecord,
} from "@/features/settings/api/email-template-service"
import { useToast } from "@/shared/hooks/use-toast"
import {
  Button,
  Card,
  Form,
  FormInputField,
  FormTextareaField,
  Input,
  Txt,
} from "@/shared/ui"

const manualTemplateSchema = z.object({
  name: z.string().min(2, "Name is required."),
  description: z.string().optional().default(""),
  content: z.string().min(10, "Template content is required."),
})

type ManualTemplateValues = z.infer<typeof manualTemplateSchema>

const EMAIL_TEMPLATE_QUERY_KEY = ["settings", "email-templates"] as const

export function EmailTemplatesSettings() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplateRecord | null>(null)

  const manualForm = useForm<ManualTemplateValues>({
    resolver: zodResolver(manualTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      content: "",
    },
  })

  const templatesQuery = useQuery({
    queryKey: [...EMAIL_TEMPLATE_QUERY_KEY, search],
    queryFn: () => listEmailTemplates(search || undefined),
  })

  const saveMutation = useMutation({
    mutationFn: async (values: ManualTemplateValues) => {
      if (editingTemplate) {
        return updateEmailTemplate(editingTemplate.id, values)
      }
      return createEmailTemplate(values)
    },
    onSuccess: () => {
      toast({
        title: editingTemplate ? "Template updated" : "Template created",
      })
      setEditingTemplate(null)
      manualForm.reset({ name: "", description: "", content: "" })
      queryClient.invalidateQueries({ queryKey: EMAIL_TEMPLATE_QUERY_KEY })
    },
    onError: () => {
      toast({
        title: "Could not save template",
        variant: "destructive",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEmailTemplate,
    onSuccess: () => {
      toast({ title: "Template deleted" })
      queryClient.invalidateQueries({ queryKey: EMAIL_TEMPLATE_QUERY_KEY })
    },
    onError: () => {
      toast({
        title: "Could not delete template",
        variant: "destructive",
      })
    },
  })

  const templates = useMemo(
    () => templatesQuery.data ?? [],
    [templatesQuery.data],
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="rounded-[2rem] border-0 heavy-shadow glass-card p-8 space-y-6">
        <div className="space-y-1">
          <Txt as="h2" size="2xl" weight="bold">
            Personal email templates
          </Txt>
          <Txt as="p" size="sm" tone="muted">
            Manage your reusable email templates. Create and use new ones directly from chat.
          </Txt>
        </div>

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search templates..."
        />

        <div className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id} className="rounded-2xl border border-black/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <Txt as="h3" weight="semibold">
                    {template.name}
                  </Txt>
                  {template.description ? (
                    <Txt as="p" size="sm" tone="muted">
                      {template.description}
                    </Txt>
                  ) : null}
                  <Txt as="p" size="xs" tone="muted">
                    Source: {template.source}
                  </Txt>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingTemplate(template)
                      manualForm.reset({
                        name: template.name,
                        description: template.description ?? "",
                        content: template.content,
                      })
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(template.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {!templates.length ? (
            <Txt as="p" size="sm" tone="muted">
              No templates yet.
            </Txt>
          ) : null}
        </div>
      </Card>

      <Card className="rounded-[2rem] border-0 heavy-shadow glass-card p-8 space-y-6">
        <Txt as="h3" size="xl" weight="bold">
          {editingTemplate ? "Edit template" : "Create template manually"}
        </Txt>
        <Form {...manualForm}>
          <form
            onSubmit={manualForm.handleSubmit(async (values) => saveMutation.mutateAsync(values))}
            className="space-y-5"
          >
            <FormInputField control={manualForm.control} name="name" label="Name" required />
            <FormInputField
              control={manualForm.control}
              name="description"
              label="Description"
              optional
            />
            <FormTextareaField
              control={manualForm.control}
              name="content"
              label="Template content"
              required
              rows={10}
            />
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending
                  ? "Saving..."
                  : editingTemplate
                    ? "Save changes"
                    : "Create template"}
              </Button>
              {editingTemplate ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingTemplate(null)
                    manualForm.reset({ name: "", description: "", content: "" })
                  }}
                >
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>
        </Form>
      </Card>
    </div>
  )
}
