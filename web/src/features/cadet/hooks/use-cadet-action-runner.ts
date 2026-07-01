"use client"

import * as React from "react"
import {
  focusActionTab,
  hideCadetFillPopup,
  isCadetExtensionConfigured,
  pingCadet,
  runCadetAction,
  showCadetFillPopup,
  updateCadetFillPopup,
} from "../lib/cadet-extension-bridge"
import type { CadetActionReport, CadetActionRequest, CadetActionRequestedPayload } from "../types"

const PRE_ACTION_DELAY_MS = 5_000
const COMPLETED_ACTION_DISMISS_MS = 8_000
const POPUP_FINISHED_DISMISS_MS = 2_000
const DUPLICATE_ENQUEUE_WINDOW_MS = 2_000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function hideCadetFillPopupSafely(): Promise<void> {
  try {
    await hideCadetFillPopup()
  } catch {}
}

function buildRequest(payload: CadetActionRequestedPayload, phrase: string): CadetActionRequest {
  const now = Date.now()
  return {
    id: `${payload.action_id}-${now}-${Math.random().toString(36).slice(2, 8)}`,
    chatId: payload.chat_id,
    actionId: payload.action_id,
    actionName: payload.action_name || "CADET action",
    triggerPhrase: payload.trigger_phrase || phrase,
    platform: payload.platform ?? "dotloop",
    status: "pending",
    timestamp: new Date(payload.timestamp ?? now),
  }
}

function isActiveCadetActionStatus(status: CadetActionRequest["status"]): boolean {
  return status === "pending" || status === "running"
}

export function useCadetActionRunner() {
  const [pendingCadetActions, setPendingCadetActions] = React.useState<CadetActionRequest[]>([])
  const actionQueueRef = React.useRef<CadetActionRequest[]>([])
  const processingQueueRef = React.useRef(false)
  const recentEnqueueRef = React.useRef<{ actionId: string; at: number } | null>(null)
  const dismissTimeoutsRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const clearDismissTimeout = React.useCallback((requestId: string) => {
    const timeout = dismissTimeoutsRef.current.get(requestId)
    if (timeout) {
      clearTimeout(timeout)
      dismissTimeoutsRef.current.delete(requestId)
    }
  }, [])

  const dismissCadetAction = React.useCallback(
    (requestId: string) => {
      clearDismissTimeout(requestId)
      setPendingCadetActions((prev) => prev.filter((item) => item.id !== requestId))
    },
    [clearDismissTimeout],
  )

  const scheduleDismissCadetAction = React.useCallback(
    (requestId: string, delayMs = COMPLETED_ACTION_DISMISS_MS) => {
      clearDismissTimeout(requestId)
      const timeout = setTimeout(() => {
        dismissTimeoutsRef.current.delete(requestId)
        setPendingCadetActions((prev) => prev.filter((item) => item.id !== requestId))
      }, delayMs)
      dismissTimeoutsRef.current.set(requestId, timeout)
    },
    [clearDismissTimeout],
  )

  const clearCompletedCadetActions = React.useCallback(() => {
    setPendingCadetActions((prev) => {
      prev.forEach((item) => {
        if (!isActiveCadetActionStatus(item.status)) {
          clearDismissTimeout(item.id)
        }
      })
      return prev.filter((item) => isActiveCadetActionStatus(item.status))
    })
  }, [clearDismissTimeout])

  const clearCadetActions = React.useCallback(() => {
    dismissTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    dismissTimeoutsRef.current.clear()
    setPendingCadetActions([])
    actionQueueRef.current = []
  }, [])

  React.useEffect(() => {
    const timeouts = dismissTimeoutsRef.current
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout))
      timeouts.clear()
    }
  }, [])

  const runAction = React.useCallback(
    async (request: CadetActionRequest) => {
      setPendingCadetActions((prev) =>
        prev.map((item) =>
          item.id === request.id
            ? { ...item, status: "running", message: "Opening target page…" }
            : item,
        ),
      )

      if (!isCadetExtensionConfigured()) {
        setPendingCadetActions((prev) =>
          prev.map((item) =>
            item.id === request.id
              ? {
                  ...item,
                  status: "extension_missing",
                  message: "CADET extension is not configured for this environment.",
                }
              : item,
          ),
        )
        return
      }

      const installed = await pingCadet()
      if (!installed) {
        setPendingCadetActions((prev) =>
          prev.map((item) =>
            item.id === request.id
              ? {
                  ...item,
                  status: "extension_missing",
                  message: "CADET extension not detected.",
                }
              : item,
          ),
        )
        return
      }

      const targetTab = await focusActionTab(request.actionId, {
        phrase: request.triggerPhrase,
        platform: request.platform,
      }).catch(() => null)

      if (!targetTab) {
        setPendingCadetActions((prev) =>
          prev.map((item) =>
            item.id === request.id
              ? {
                  ...item,
                  status: "no_platform_tab",
                  message: "Could not open the page where this action was recorded.",
                }
              : item,
          ),
        )
        return
      }

      const popupTabId = targetTab.tabId
      const totalSeconds = Math.ceil(PRE_ACTION_DELAY_MS / 1000)
      await showCadetFillPopup(
        {
          title: "CADET is getting ready",
          subtitle: `Action starts in ${totalSeconds} seconds.`,
          badgeLabel: "Starting in",
          countdownSeconds: totalSeconds,
          tone: "countdown",
        },
        popupTabId,
      ).catch(() => {})

      for (let remaining = totalSeconds; remaining > 0; remaining -= 1) {
        setPendingCadetActions((prev) =>
          prev.map((item) =>
            item.id === request.id
              ? {
                  ...item,
                  status: "running",
                  message: `Action starts in ${remaining} second${remaining === 1 ? "" : "s"}…`,
                }
              : item,
          ),
        )
        await updateCadetFillPopup(
          {
            title: "CADET is getting ready",
            subtitle: `Action starts in ${remaining} second${remaining === 1 ? "" : "s"}.`,
            badgeLabel: "Starting in",
            countdownSeconds: remaining,
            tone: "countdown",
          },
          popupTabId,
        ).catch(() => {})
        await sleep(1000)
      }

      await updateCadetFillPopup(
        {
          title: "CADET is running your action",
          subtitle: "Replaying the saved click sequence.",
          badgeLabel: "Running",
          statusText: "Working",
          tone: "active",
        },
        popupTabId,
      ).catch(() => {})

      try {
        const result = await runCadetAction(request.actionId, {
          phrase: request.triggerPhrase,
          platform: request.platform,
          focusTab: true,
        })

        setPendingCadetActions((prev) =>
          prev.map((item) =>
            item.id === request.id
              ? {
                  ...item,
                  status: "success",
                  message: result.message,
                  report: result.report as CadetActionReport | undefined,
                }
              : item,
          ),
        )

        await updateCadetFillPopup(
          {
            title: "CADET action complete",
            subtitle: result.message,
            badgeLabel: "Finished",
            statusText: "Done",
            tone: "success",
          },
          popupTabId,
        ).catch(() => {})
        await sleep(POPUP_FINISHED_DISMISS_MS)
        await hideCadetFillPopupSafely()
        scheduleDismissCadetAction(request.id)
      } catch (error) {
        await hideCadetFillPopupSafely()
        const message =
          error instanceof Error ? error.message : "CADET could not run the saved action."

        const isNoTab = message.toLowerCase().includes("tab")
        setPendingCadetActions((prev) =>
          prev.map((item) =>
            item.id === request.id
              ? {
                  ...item,
                  status: isNoTab ? "no_platform_tab" : "error",
                  message,
                }
              : item,
          ),
        )
      }
    },
    [scheduleDismissCadetAction],
  )

  const processQueue = React.useCallback(async () => {
    if (processingQueueRef.current) return
    processingQueueRef.current = true

    try {
      while (actionQueueRef.current.length > 0) {
        const next = actionQueueRef.current.shift()
        if (!next) continue
        await runAction(next)
      }
    } finally {
      processingQueueRef.current = false
    }
  }, [runAction])

  const enqueueCadetAction = React.useCallback(
    (payload: CadetActionRequestedPayload, phrase: string) => {
      const recent = recentEnqueueRef.current
      const now = Date.now()
      if (
        recent &&
        recent.actionId === payload.action_id &&
        now - recent.at < DUPLICATE_ENQUEUE_WINDOW_MS
      ) {
        return
      }

      recentEnqueueRef.current = { actionId: payload.action_id, at: now }
      const request = buildRequest(payload, phrase)
      setPendingCadetActions((prev) => [...prev, request])
      actionQueueRef.current.push(request)
      void processQueue()
    },
    [processQueue],
  )

  const retryCadetAction = React.useCallback(
    (requestId: string) => {
      const existing = pendingCadetActions.find((item) => item.id === requestId)
      if (!existing) return

      const retryRequest: CadetActionRequest = {
        ...existing,
        id: `${existing.actionId}-${Date.now()}-retry`,
        status: "pending",
        message: undefined,
        report: undefined,
        timestamp: new Date(),
      }

      clearDismissTimeout(requestId)
      setPendingCadetActions((prev) =>
        prev.map((item) => (item.id === requestId ? retryRequest : item)),
      )
      actionQueueRef.current.push(retryRequest)
      void processQueue()
    },
    [pendingCadetActions, clearDismissTimeout, processQueue],
  )

  return {
    pendingCadetActions,
    enqueueCadetAction,
    retryCadetAction,
    clearCadetActions,
    clearCompletedCadetActions,
  }
}
