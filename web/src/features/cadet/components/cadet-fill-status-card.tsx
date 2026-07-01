"use client"

import { Loader2, Plug, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { formatCadetCommandDisplay } from "../lib/pinpoint-command"
import type { CadetFillRequest } from "../types"

interface CadetFillStatusCardProps {
  request: CadetFillRequest
  onRetry?: () => void
  compact?: boolean
}

export function CadetFillStatusCard({
  request,
  onRetry,
  compact = false,
}: CadetFillStatusCardProps) {
  const title = request.address || request.cadetCommand || "Transaction"
  const commandLabel = formatCadetCommandDisplay(request.cadetCommand, request.address)
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
              CADET Dotloop Fill
            </p>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {commandLabel ? (
              <p className="text-xs text-muted-foreground">
                Command: &quot;{commandLabel}&quot;
              </p>
            ) : null}
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
              <p>
                Install the CADET Chrome extension, open a Dotloop form tab, then say your
                command again in chat.
              </p>
            </div>
          ) : null}

          {request.status === "no_dotloop_tab" ? (
            <div className="space-y-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-foreground/80">
              <p className="font-medium">Open a Dotloop form tab</p>
              <p>
                CADET needs an existing Dotloop transaction form tab. Open one in your browser,
                then retry your Dotloop command.
              </p>
            </div>
          ) : null}

          {request.report ? (
            <div className="text-xs text-muted-foreground">
              Filled {request.report.filledCount ?? 0}
              {typeof request.report.skippedCount === "number"
                ? ` · Skipped ${request.report.skippedCount}`
                : ""}
              {request.report.missingFields && request.report.missingFields.length > 0
                ? ` · Missing ${request.report.missingFields.length} field(s)`
                : ""}
              {typeof request.report.saveClickCount === "number" && request.report.saveClickCount > 0
                ? ` · Saved ${request.report.saveClickCount} section(s)`
                : ""}
            </div>
          ) : null}

          {(request.status === "error" || request.status === "no_dotloop_tab") && onRetry ? (
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              Retry fill
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
