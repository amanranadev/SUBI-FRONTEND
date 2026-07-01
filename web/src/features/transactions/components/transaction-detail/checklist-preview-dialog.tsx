"use client"

import * as React from "react"
import { Loader2, Plus, Trash2, X } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Txt } from "@/shared/ui"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { Modal } from "@/shared/ui/modal"

export type PreviewTask = {
  category?: string
  name: string
}

type ChecklistPreviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  tasks: PreviewTask[]
  onConfirm: (tasks: PreviewTask[]) => void
  onSecondaryConfirm?: (tasks: PreviewTask[]) => void
  isConfirming?: boolean
  confirmLabel?: string
  secondaryConfirmLabel?: string
}

type BuilderCategory = {
  id: string
  label: string
  tasks: { id: string; label: string }[]
}

function tasksToBuilder(tasks: PreviewTask[]): BuilderCategory[] {
  const grouped: Record<string, string[]> = {}
  const order: string[] = []

  for (const task of tasks) {
    const key = task.category || "Uncategorized"
    if (!grouped[key]) {
      grouped[key] = []
      order.push(key)
    }
    grouped[key].push(task.name)
  }

  return order.map((category, i) => ({
    id: `prev-cat-${i}`,
    label: category,
    tasks: grouped[category].map((name, j) => ({
      id: `prev-task-${i}-${j}`,
      label: name,
    })),
  }))
}

function builderToTasks(builder: BuilderCategory[]): PreviewTask[] {
  return builder.flatMap((cat) =>
    cat.tasks
      .filter((t) => t.label.trim())
      .map((t) => ({
        category: cat.label.trim() || undefined,
        name: t.label.trim(),
      })),
  )
}

export function ChecklistPreviewDialog({
  open,
  onOpenChange,
  title,
  description,
  tasks,
  onConfirm,
  onSecondaryConfirm,
  isConfirming = false,
  confirmLabel = "Apply Checklist",
  secondaryConfirmLabel = "Save as Template",
}: ChecklistPreviewDialogProps) {
  const [builder, setBuilder] = React.useState<BuilderCategory[]>([])

  React.useEffect(() => {
    if (open) {
      setBuilder(tasksToBuilder(tasks))
    }
  }, [open, tasks])

  const totalTasks = builder.reduce(
    (sum, cat) => sum + cat.tasks.filter((t) => t.label.trim()).length,
    0,
  )

  const handleConfirm = () => {
    onConfirm(builderToTasks(builder))
  }

  const handleSecondaryConfirm = () => {
    if (!onSecondaryConfirm) return
    onSecondaryConfirm(builderToTasks(builder))
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      hideHeader
      contentClassName="max-w-2xl border-0 [box-shadow:0_72px_148px_-74px_rgba(0,0,0,0.5),0_22px_48px_-30px_rgba(0,0,0,0.22)] p-0 overflow-hidden"
      footerClassName="relative z-10 p-8 pt-4 flex gap-3"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
            className="flex-1 h-12 !rounded-xl font-bold"
          >
            Cancel
          </Button>
          {onSecondaryConfirm ? (
            <Button
              onClick={handleSecondaryConfirm}
              disabled={isConfirming || totalTasks === 0}
              variant="outline"
              className="flex-1 h-12 !rounded-xl font-bold"
            >
              {secondaryConfirmLabel}
            </Button>
          ) : null}
          <Button
            onClick={handleConfirm}
            disabled={isConfirming || totalTasks === 0}
            className="flex-1 h-12 !rounded-xl font-bold gap-2"
          >
            {isConfirming ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {isConfirming
              ? "Creating..."
              : `${confirmLabel} (${totalTasks})`}
          </Button>
        </>
      }
    >
      <div className="p-8 pb-4">
        <h2 className="text-2xl font-bold tracking-tighter">{title}</h2>
        {description ? (
          <p className="text-sm font-medium opacity-50">{description}</p>
        ) : null}
        <Txt as="p" size="sm" weight="bold" className="pt-2">
          {totalTasks} checklist task{totalTasks !== 1 ? "s" : ""} will be
          created
        </Txt>
      </div>

        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-4 pb-4 px-8">
            {builder.map((cat, catIdx) => (
              <div
                key={cat.id}
                className="p-5 rounded-[2rem] border border-black/5 bg-white/80 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Input
                    value={cat.label}
                    onChange={(e) => {
                      const next = [...builder]
                      next[catIdx] = { ...next[catIdx], label: e.target.value }
                      setBuilder(next)
                    }}
                    placeholder="Category Name"
                    containerClassName="flex-1 min-w-0" className="h-9 rounded-xl bg-black/[0.02] border-black/5 font-bold text-sm"
                  />
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setBuilder(builder.filter((_, i) => i !== catIdx))
                    }
                    className="size-9 shrink-0 !rounded-lg text-destructive/40 hover:text-destructive hover:bg-destructive/5"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="space-y-1.5 pl-3">
                  {cat.tasks.map((task, taskIdx) => (
                    <div key={task.id} className="flex items-center gap-2">
                      <Input
                        value={task.label}
                        onChange={(e) => {
                          const next = [...builder]
                          const nextTasks = [...next[catIdx].tasks]
                          nextTasks[taskIdx] = {
                            ...nextTasks[taskIdx],
                            label: e.target.value,
                          }
                          next[catIdx] = { ...next[catIdx], tasks: nextTasks }
                          setBuilder(next)
                        }}
                        placeholder="Task Name"
                        containerClassName="flex-1 min-w-0" className="h-8 rounded-lg bg-white border-black/5 text-xs font-bold"
                      />
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const next = [...builder]
                          next[catIdx] = {
                            ...next[catIdx],
                            tasks: next[catIdx].tasks.filter(
                              (_, i) => i !== taskIdx,
                            ),
                          }
                          setBuilder(next)
                        }}
                        className="size-8 shrink-0 !rounded-lg text-destructive/30 hover:text-destructive hover:bg-destructive/5"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const next = [...builder]
                      next[catIdx] = {
                        ...next[catIdx],
                        tasks: [
                          ...next[catIdx].tasks,
                          {
                            id: `new-${Date.now()}-${Math.random()}`,
                            label: "",
                          },
                        ],
                      }
                      setBuilder(next)
                    }}
                    className="h-7 text-[9px] font-bold uppercase tracking-widest gap-1.5 opacity-40 hover:opacity-100"
                  >
                    <Plus className="size-3" /> Add Task
                  </Button>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                setBuilder([
                  ...builder,
                  {
                    id: `new-cat-${Date.now()}`,
                    label: "",
                    tasks: [
                      { id: `new-task-${Date.now()}`, label: "" },
                    ],
                  },
                ])
              }
              className="w-full h-10 !rounded-xl font-bold text-xs gap-2"
            >
              <Plus className="size-4" /> New Category
            </Button>
          </div>
        </ScrollArea>
    </Modal>
  )
}
