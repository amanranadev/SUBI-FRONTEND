"use client"

import { Loader2, Plug, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/shared/ui/button"
import type { CadetActionRequest } from "../types"

interface CadetActionStatusCardProps {
  request: CadetActionRequest
  onRetry?: () => void
  compact?: boolean
}

export function CadetActionStatusCard({
  request,
  onRetry,
  compact = false,
}: CadetActionStatusCardProps) {
  const isRunning = request.status === "pending" || request.status === "running"

  return (
    <div
      className={
        compact
          ? "rounded-[2rem] border border-primary/15 bg-primary/5 px-5 py-4"
          : "rounded-[2.5rem] border border-primary/15 bg-primary/5 px-6 py-5"
      }
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-primary">
          {isRunning ? (
            <Loader2 className="size-4 animate-spin" />
          ) : request.status === "success" ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <AlertCircle className="size-4" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
              CADET Action
            </p>
            <p className="text-sm font-semibold text-foreground">{request.actionName}</p>
            <p className="text-xs text-muted-foreground">
              Phrase: &quot;{request.triggerPhrase}&quot;
            </p>
          </div>

          {request.message ? (
            <p className="text-sm leading-relaxed text-foreground/80">{request.message}</p>
          ) : null}

          {request.status === "extension_missing" ? (
            <div className="space-y-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-foreground/80">
              <div className="flex items-center gap-2 font-medium">
                <Plug className="size-4" />
                CADET extension required
              </div>
              <p>Install the CADET Chrome extension, open the target site tab, then try again.</p>
            </div>
          ) : null}

          {request.status === "no_platform_tab" ? (
            <div className="space-y-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-foreground/80">
              <p className="font-medium">Open the target site tab</p>
              <p>
                CADET needs an open {request.platform === "skyslope" ? "SkySlope" : "Dotloop"}{" "}
                tab before it can run this action.
              </p>
            </div>
          ) : null}

          {request.report ? (
            <div className="text-xs text-muted-foreground">
              Completed {request.report.completedSteps ?? request.report.filledCount ?? 0}
              {typeof request.report.skippedSteps === "number"
                ? ` · Skipped ${request.report.skippedSteps}`
                : ""}
              {typeof request.report.failedSteps === "number" && request.report.failedSteps > 0
                ? ` · Failed ${request.report.failedSteps}`
                : ""}
            </div>
          ) : null}

          {(request.status === "error" || request.status === "no_platform_tab") && onRetry ? (
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              Retry action
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
