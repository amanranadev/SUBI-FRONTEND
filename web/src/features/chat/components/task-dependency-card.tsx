"use client"

import * as React from "react"

import { Link2, CheckCheck, X, Loader2, Info } from "lucide-react"
import { Button } from "@/shared/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { cn } from "@/lib/utils"
import { useTransactionTasks } from "@/features/tasks/hooks/use-transaction-tasks"
import type { TaskDependencyClarification, TaskDependencyOption } from "../types"
import { TaskDependencyRemovePrompt } from "./task-dependency-remove-prompt"

/** Shown when a clarification option is a resolvable circular conflict (remove first, then creation-ready card). */
const CIRCULAR_DEPENDENCY_REMOVE_MESSAGE =
  "There is a circular dependency between these tasks. Do you want to remove the previous dependency?"

interface TaskDependencyCardProps {
  dependency: TaskDependencyClarification
  transactionId?: string
  onConfirm: (
    depId: string,
    childTaskId: string,
    parentTaskId: string,
    daysAfterParent: number,
  ) => Promise<void>
  onDismiss: (id: string) => void
  onResolveCircular: (
    depId: string,
    childTaskId: string,
    parentTaskId: string,
    daysAfterParent: number,
    conflictingChildTaskId: string,
  ) => void
  compact?: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DEFAULT_DAY_OPTIONS = [0, 1, 2, 3, 5, 7, 10, 14, 21, 30]

function isCircularConflictOption(o: TaskDependencyOption): boolean {
  return (
    o.would_be_circular === true &&
    o.self_referential !== true &&
    Boolean(o.conflicting_dependency)
  )
}

function filterCircularConflictOptions(options: TaskDependencyOption[]): TaskDependencyOption[] {
  return options.filter(isCircularConflictOption)
}

function findMatchingClarificationOption(
  options: TaskDependencyOption[],
  childId: string,
  parentId: string,
  daysStr: string,
): TaskDependencyOption | undefined {
  if (!childId || !parentId) return undefined
  const daysNum = parseInt(daysStr, 10)
  const hasValidDays = daysStr !== "" && !isNaN(daysNum) && daysNum >= 0

  return options.find((o) => {
    if (o.child_task_id !== childId || o.parent_task_id !== parentId) return false
    if (typeof o.days_after_parent === "number") {
      if (!hasValidDays) return false
      return o.days_after_parent === daysNum
    }
    return true
  })
}

// ─── Creation UI (dropdowns) — always used for task_dependency_clarification ──

interface DropdownCardProps {
  clarificationMessage: string
  options: TaskDependencyOption[]
  transactionId?: string
  daysAfterParent?: number
  compact?: boolean
  preferredOptionIndex?: number | null
  onConfirm: (childTaskId: string, parentTaskId: string, daysAfterParent: number) => Promise<void>
  onDismiss: () => void
}

function DropdownCard({
  clarificationMessage,
  options,
  transactionId,
  daysAfterParent,
  compact,
  preferredOptionIndex,
  onConfirm,
  onDismiss,
}: DropdownCardProps) {
  const { data: transactionTasks = [] } = useTransactionTasks({ transactionId })

  const taskOptions = React.useMemo(() => {
    const byId = new Map<string, string>()
    options.forEach((o) => {
      if (o.child_task_id && o.child_task_name) byId.set(o.child_task_id, o.child_task_name)
      if (o.parent_task_id && o.parent_task_name) byId.set(o.parent_task_id, o.parent_task_name)
    })
    transactionTasks.forEach((t) => {
      if (t.id && t.name) byId.set(t.id, t.name)
    })
    return Array.from(byId.entries()).map(([taskId, taskName]) => ({ id: taskId, name: taskName }))
  }, [options, transactionTasks])

  const defaultChildId = React.useMemo(() => {
    if (
      typeof preferredOptionIndex === "number" &&
      preferredOptionIndex >= 0 &&
      preferredOptionIndex < options.length
    ) {
      const preferred = options[preferredOptionIndex]
      if (preferred?.child_task_id) return preferred.child_task_id
    }
    return options.find((o) => o.child_task_id)?.child_task_id ?? taskOptions[0]?.id ?? ""
  }, [options, preferredOptionIndex, taskOptions])

  const [selectedChildId, setSelectedChildId] = React.useState(defaultChildId)
  const [selectedParentId, setSelectedParentId] = React.useState("")
  const [days, setDays] = React.useState(
    typeof daysAfterParent === "number" ? String(daysAfterParent) : "",
  )
  const [isConfirming, setIsConfirming] = React.useState(false)

  const dayOptions = React.useMemo(() => {
    if (typeof daysAfterParent === "number" && !DEFAULT_DAY_OPTIONS.includes(daysAfterParent)) {
      return [...DEFAULT_DAY_OPTIONS, daysAfterParent].sort((a, b) => a - b)
    }
    return DEFAULT_DAY_OPTIONS
  }, [daysAfterParent])

  const parentChoices = React.useMemo(
    () => taskOptions.filter((t) => t.id !== selectedChildId),
    [taskOptions, selectedChildId],
  )

  const defaultParentId = React.useMemo(() => {
    const matched = options.find((o) => o.child_task_id === selectedChildId)
    return matched?.parent_task_id ?? parentChoices[0]?.id ?? ""
  }, [options, parentChoices, selectedChildId])

  React.useEffect(() => {
    setSelectedChildId((prev) => {
      if (
        typeof preferredOptionIndex === "number" &&
        preferredOptionIndex >= 0 &&
        preferredOptionIndex < options.length
      ) {
        const preferred = options[preferredOptionIndex]
        if (preferred?.child_task_id && prev !== preferred.child_task_id) {
          return preferred.child_task_id
        }
      }
      return prev || defaultChildId
    })
  }, [defaultChildId, preferredOptionIndex, options])

  React.useEffect(() => {
    if (typeof daysAfterParent === "number") setDays(String(daysAfterParent))
  }, [daysAfterParent])

  React.useEffect(() => {
    setSelectedParentId((prev) => {
      if (prev && prev !== selectedChildId) return prev
      return defaultParentId
    })
  }, [defaultParentId, selectedChildId])

  const handleConfirm = async () => {
    if (!selectedChildId || !selectedParentId) return
    const parsedDays = parseInt(days, 10)
    if (isNaN(parsedDays) || parsedDays < 0) return
    setIsConfirming(true)
    try {
      await onConfirm(selectedChildId, selectedParentId, parsedDays)
    } finally {
      setIsConfirming(false)
    }
  }

  const matchedOption = React.useMemo(
    () =>
      findMatchingClarificationOption(options, selectedChildId, selectedParentId, days),
    [options, selectedChildId, selectedParentId, days],
  )

  const isSelfReferential = matchedOption?.self_referential === true
  const isCircularConflict =
    matchedOption?.would_be_circular === true &&
    !isSelfReferential &&
    Boolean(matchedOption?.conflicting_dependency)
  const alreadyHasThisDep = matchedOption?.already_has_this_dependency === true
  const existingDays = matchedOption?.existing_days_after_parent ?? null
  const offsetChanged =
    alreadyHasThisDep &&
    existingDays !== null &&
    days !== "" &&
    parseInt(days, 10) !== existingDays

  const confirmBlocked = isSelfReferential || isCircularConflict
  const busy = isConfirming

  return (
    <>
      <p
        className={cn(
          "whitespace-pre-line text-violet-800/80",
          compact ? "text-xs" : "text-sm",
        )}
      >
        {clarificationMessage}
      </p>

      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-violet-700/60">
          Task
        </label>
        <Select value={selectedChildId} onValueChange={setSelectedChildId}>
          <SelectTrigger
            className={cn(
              "w-full border-violet-200 bg-white focus:ring-violet-400",
              compact ? "h-8 text-xs" : "h-10 text-sm",
            )}
          >
            <SelectValue placeholder="Select task..." />
          </SelectTrigger>
          <SelectContent>
            {taskOptions.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-violet-700/60">
          Depends On
        </label>
        <Select value={selectedParentId} onValueChange={setSelectedParentId}>
          <SelectTrigger
            className={cn(
              "w-full border-violet-200 bg-white focus:ring-violet-400",
              compact ? "h-8 text-xs" : "h-10 text-sm",
            )}
          >
            <SelectValue placeholder="Select parent task..." />
          </SelectTrigger>
          <SelectContent>
            {parentChoices.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-violet-700/60">
          Days Gap
        </label>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger
            className={cn(
              "w-full border-violet-200 bg-white focus:ring-violet-400",
              compact ? "h-8 text-xs" : "h-10 text-sm",
            )}
          >
            <SelectValue placeholder="Select days..." />
          </SelectTrigger>
          <SelectContent>
            {dayOptions.map((d) => (
              <SelectItem key={d} value={String(d)}>
                {d} day{d !== 1 ? "s" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isSelfReferential && (
        <div className={cn(
          "rounded-md border border-amber-200 bg-amber-50/60 px-3 py-2 flex items-start gap-2",
          compact ? "text-xs" : "text-sm",
        )}>
          <Info className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
          <span className="text-amber-800/80">A task cannot depend on itself. Choose a different task or parent.</span>
        </div>
      )}

      {isCircularConflict && matchedOption?.conflicting_dependency && (
        <div className={cn(
          "rounded-md border border-rose-200 bg-rose-50/60 px-3 py-2 space-y-1",
          compact ? "text-xs" : "text-sm",
        )}>
          <p className="text-rose-800/80 font-medium">This would create a circular dependency.</p>
          <p className="text-rose-700/80">
            &ldquo;{matchedOption.conflicting_dependency.child_task_name}&rdquo; currently depends on{" "}
            &ldquo;{matchedOption.conflicting_dependency.parent_task_name}&rdquo;.
            Select the other direction, or go back and ask to remove that dependency first.
          </p>
        </div>
      )}

      {alreadyHasThisDep && !isCircularConflict && (
        <div className={cn(
          "flex items-start gap-2 rounded-md border border-violet-200 bg-violet-50/60 px-3 py-2",
          compact ? "text-xs" : "text-sm",
        )}>
          <Info className="mt-0.5 size-3.5 shrink-0 text-violet-600" />
          {offsetChanged ? (
            <p className="text-violet-800/80">
              This dependency already exists with a{" "}
              <span className="font-semibold">{existingDays}-day</span> offset. Confirm
              to update it to{" "}
              <span className="font-semibold">{days} day{parseInt(days, 10) !== 1 ? "s" : ""}</span>.
            </p>
          ) : (
            <p className="text-violet-800/80">
              This dependency is already configured
              {existingDays !== null ? ` with a ${existingDays}-day offset` : ""}.
              No change needed unless you want to update the offset.
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button
          onClick={handleConfirm}
          disabled={
            busy ||
            !selectedChildId ||
            !selectedParentId ||
            days === "" ||
            confirmBlocked
          }
          size="sm"
          className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white"
        >
          {isConfirming ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <CheckCheck className="size-3.5" />
          )}
          {alreadyHasThisDep && offsetChanged ? "Update Offset" : "Confirm"}
        </Button>

        <Button
          onClick={onDismiss}
          disabled={busy}
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-destructive"
        >
          <X className="size-3.5" />
          Dismiss
        </Button>
      </div>
    </>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

export function TaskDependencyCard({
  dependency,
  transactionId,
  onConfirm,
  onDismiss,
  onResolveCircular,
  compact,
}: TaskDependencyCardProps) {
  const {
    id,
    clarificationMessage,
    daysAfterParent,
    options = [],
    transactionId: dependencyTransactionId,
    circularResolutionLoading = false,
    circularResolutionError,
  } = dependency

  const activeTransactionId = transactionId ?? dependencyTransactionId

  const circularConflictOptions = React.useMemo(
    () => filterCircularConflictOptions(options),
    [options],
  )

  const hasAnySafeOption = options.some(
    (o) => o.would_be_circular !== true || o.already_has_this_dependency === true
  )
  const showCircularRemovalOnly =
    circularConflictOptions.length > 0 && !hasAnySafeOption

  const handleResolve = (option: TaskDependencyOption) => {
    if (!option.child_task_id || !option.parent_task_id || !option.conflicting_dependency) return
    onResolveCircular(
      id,
      option.child_task_id,
      option.parent_task_id,
      option.days_after_parent ?? 0,
      option.conflicting_dependency.child_task_id,
    )
  }

  if (showCircularRemovalOnly) {
    return (
      <div className="space-y-3">
        {clarificationMessage ? (
          <p
            className={cn(
              "whitespace-pre-line text-muted-foreground px-0.5",
              compact ? "text-xs" : "text-sm",
            )}
          >
            {clarificationMessage}
          </p>
        ) : null}
        {circularConflictOptions.map((option) => {
          const c = option.conflicting_dependency!
          return (
            <TaskDependencyRemovePrompt
              key={`${option.child_task_id}-${option.parent_task_id}`}
              message={CIRCULAR_DEPENDENCY_REMOVE_MESSAGE}
              childTaskName={c.child_task_name}
              parentTaskName={c.parent_task_name}
              childTaskId={c.child_task_id}
              compact={compact}
              loading={circularResolutionLoading}
              inlineError={
                circularResolutionError
                  ? `Could not resolve conflict: ${circularResolutionError}`
                  : null
              }
              confirmLabel="Remove & Proceed"
              onConfirm={() => handleResolve(option)}
              onDismiss={() => onDismiss(id)}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-violet-200 bg-violet-50/50 overflow-hidden",
        compact ? "text-sm" : "text-base",
      )}
    >
      <div className="flex items-center gap-2 px-4 py-2.5 bg-violet-100/60 border-b border-violet-200">
        <Link2 className="size-4 text-violet-700" />
        <span className="font-semibold text-violet-800">Task Dependency</span>
      </div>

      <div className={cn("space-y-3", compact ? "p-3" : "p-4")}>
        <DropdownCard
          clarificationMessage={clarificationMessage}
          options={options}
          transactionId={activeTransactionId}
          daysAfterParent={daysAfterParent}
          compact={compact}
          preferredOptionIndex={dependency.preferredOptionIndex}
          onConfirm={(childTaskId, parentTaskId, days) =>
            onConfirm(id, childTaskId, parentTaskId, days)
          }
          onDismiss={() => onDismiss(id)}
        />
      </div>
    </div>
  )
}
