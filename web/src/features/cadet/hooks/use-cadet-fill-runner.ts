"use client"

import * as React from "react"
import {
  fillTransaction,
  focusDotloopTab,
  hideCadetFillPopup,
  isCadetExtensionConfigured,
  pingCadet,
  showCadetFillPopup,
  updateCadetFillPopup,
} from "../lib/cadet-extension-bridge"
import { formatCadetCommandDisplay } from "../lib/pinpoint-command"
import { reportCadetFill } from "../api/cadet-fill-report-service"
import type { CadetFillRequest, CadetFillRequestedPayload } from "../types"

const PRE_FILL_DELAY_MS = 15_000
const COMPLETED_FILL_DISMISS_MS = 8_000
const POPUP_FINISHED_DISMISS_MS = 2_000
/** Collapse duplicate enqueue from client fast-path + WebSocket for the same user message. */
const DUPLICATE_ENQUEUE_WINDOW_MS = 2_000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitBeforeFill(
  requestId: string,
  onTick: (message: string) => void,
): Promise<void> {
  const totalSeconds = Math.ceil(PRE_FILL_DELAY_MS / 1000)

  for (let remaining = totalSeconds; remaining > 0; remaining -= 1) {
    onTick(
      `Dotloop tab focused. Select your loop — filling starts in ${remaining} second${remaining === 1 ? "" : "s"}…`,
    )
    await sleep(1000)
  }
}

async function hideCadetFillPopupSafely(): Promise<void> {
  try {
    await hideCadetFillPopup()
  } catch {}
}

function buildRequest(payload: CadetFillRequestedPayload): CadetFillRequest {
  const now = Date.now()
  return {
    id: `${payload.transaction_id}-${now}-${Math.random().toString(36).slice(2, 8)}`,
    chatId: payload.chat_id,
    transactionId: payload.transaction_id,
    cadetCommand: formatCadetCommandDisplay(payload.cadet_command, payload.address),
    address: payload.address,
    platform: payload.platform ?? "dotloop",
    status: "pending",
    timestamp: new Date(payload.timestamp ?? now),
  }
}

function isActiveCadetFillStatus(status: CadetFillRequest["status"]): boolean {
  return status === "pending" || status === "running"
}

export function useCadetFillRunner() {
  const [pendingCadetFills, setPendingCadetFills] = React.useState<CadetFillRequest[]>([])
  const fillQueueRef = React.useRef<CadetFillRequest[]>([])
  const processingFillQueueRef = React.useRef(false)
  const recentEnqueueRef = React.useRef<{ transactionId: string; at: number } | null>(null)
  const dismissTimeoutsRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const clearDismissTimeout = React.useCallback((requestId: string) => {
    const timeout = dismissTimeoutsRef.current.get(requestId)
    if (timeout) {
      clearTimeout(timeout)
      dismissTimeoutsRef.current.delete(requestId)
    }
  }, [])

  const dismissCadetFill = React.useCallback(
    (requestId: string) => {
      clearDismissTimeout(requestId)
      setPendingCadetFills((prev) => prev.filter((item) => item.id !== requestId))
    },
    [clearDismissTimeout],
  )

  const scheduleDismissCadetFill = React.useCallback(
    (requestId: string, delayMs = COMPLETED_FILL_DISMISS_MS) => {
      clearDismissTimeout(requestId)
      const timeout = setTimeout(() => {
        dismissTimeoutsRef.current.delete(requestId)
        setPendingCadetFills((prev) => prev.filter((item) => item.id !== requestId))
      }, delayMs)
      dismissTimeoutsRef.current.set(requestId, timeout)
    },
    [clearDismissTimeout],
  )

  const clearCompletedCadetFills = React.useCallback(() => {
    setPendingCadetFills((prev) => {
      prev.forEach((item) => {
        if (!isActiveCadetFillStatus(item.status)) {
          clearDismissTimeout(item.id)
        }
      })
      return prev.filter((item) => isActiveCadetFillStatus(item.status))
    })
  }, [clearDismissTimeout])

  React.useEffect(() => {
    const timeouts = dismissTimeoutsRef.current
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout))
      timeouts.clear()
    }
  }, [])

  const runFill = React.useCallback(
    async (request: CadetFillRequest) => {
      setPendingCadetFills((prev) =>
        prev.map((item) =>
          item.id === request.id
            ? { ...item, status: "running", message: "Focusing Dotloop tab…" }
            : item,
        ),
      )

      if (!isCadetExtensionConfigured()) {
        await hideCadetFillPopupSafely()
        setPendingCadetFills((prev) =>
          prev.map((item) =>
            item.id === request.id
              ? {
                  ...item,
                  status: "extension_missing",
                  message:
                    "CADET extension is not configured for this environment. Install CADET and open a Dotloop form tab.",
                }
              : item,
          ),
        )
        return
      }

      const dotloopTab = await focusDotloopTab()
      if (!dotloopTab) {
        await hideCadetFillPopupSafely()
        setPendingCadetFills((prev) =>
          prev.map((item) =>
            item.id === request.id
              ? {
                  ...item,
                  status: "no_dotloop_tab",
                  message:
                    "No Dotloop form tab found. Open a Dotloop transaction form in another tab, then retry your command.",
                }
              : item,
          ),
        )
        return
      }

      setPendingCadetFills((prev) =>
        prev.map((item) =>
          item.id === request.id
            ? {
                ...item,
                status: "running",
                message: "Dotloop tab focused. Select your loop — filling starts in 15 seconds…",
              }
            : item,
        ),
      )

      await showCadetFillPopup({
        title: "CADET is getting Dotloop ready",
        subtitle: "Open the correct loop. Autofill starts in 15 seconds.",
        badgeLabel: "Starting in",
        countdownSeconds: Math.ceil(PRE_FILL_DELAY_MS / 1000),
        tone: "countdown",
      }).catch(() => {})

      const installed = await pingCadet()
      if (!installed) {
        await hideCadetFillPopupSafely()
        setPendingCadetFills((prev) =>
          prev.map((item) =>
            item.id === request.id
              ? {
                  ...item,
                  status: "extension_missing",
                  message:
                    "CADET extension not detected. Install CADET, open a Dotloop form tab, then retry your command.",
                }
              : item,
          ),
        )
        return
      }

      await waitBeforeFill(request.id, (message) => {
        setPendingCadetFills((prev) =>
          prev.map((item) =>
            item.id === request.id ? { ...item, status: "running", message } : item,
          ),
        )

        const match = message.match(/(\d+)/)
        const countdownSeconds = match ? Number(match[1]) : null
        void updateCadetFillPopup({
          title: "CADET is getting Dotloop ready",
          subtitle: message,
          badgeLabel: "Starting in",
          countdownSeconds: countdownSeconds ?? undefined,
          tone: "countdown",
        }).catch(() => {})
      })

      setPendingCadetFills((prev) =>
        prev.map((item) =>
          item.id === request.id
            ? {
                ...item,
                status: "running",
                message: "Filling Dotloop details and saving…",
              }
            : item,
        ),
      )

      await updateCadetFillPopup({
        title: "CADET is updating Dotloop",
        subtitle: "Your transaction details are being added now.",
        badgeLabel: "Updating",
        statusText: "Working",
        tone: "active",
      }).catch(() => {})

      try {
        const result = await fillTransaction(request.transactionId, request.platform, {
          focusDotloopTab: true,
          multiSection: true,
          clickSave: true,
          silent: true,
        })
        setPendingCadetFills((prev) =>
          prev.map((item) =>
            item.id === request.id
              ? {
                  ...item,
                  status: "success",
                  message: result.message,
                  report: result.report,
                }
              : item,
          ),
        )
        await updateCadetFillPopup({
          title: "CADET finished filling",
          subtitle: "Dotloop data has been filled and saved.",
          badgeLabel: "Finished",
          statusText: "Done",
          tone: "success",
        }).catch(() => {})
        await sleep(POPUP_FINISHED_DISMISS_MS)
        await hideCadetFillPopupSafely()
        scheduleDismissCadetFill(request.id)

        void reportCadetFill({
          transactionId: request.transactionId,
          chatId: request.chatId,
          platform: request.platform,
          report: result.report,
        }).catch(() => {})
      } catch (error) {
        await hideCadetFillPopupSafely()
        const message =
          error instanceof Error
            ? error.message
            : "CADET could not fill the Dotloop tab. Open a Dotloop form tab and try again."

        const isNoTab =
          message.toLowerCase().includes("dotloop") && message.toLowerCase().includes("tab")

        setPendingCadetFills((prev) =>
          prev.map((item) =>
            item.id === request.id
              ? {
                  ...item,
                  status: isNoTab ? "no_dotloop_tab" : "error",
                  message,
                }
              : item,
          ),
        )
      }
    },
    [scheduleDismissCadetFill],
  )

  const drainFillQueue = React.useCallback(async () => {
    if (processingFillQueueRef.current) return

    processingFillQueueRef.current = true
    try {
      while (fillQueueRef.current.length > 0) {
        const request = fillQueueRef.current.shift()
        if (!request) continue
        await runFill(request)
      }
    } finally {
      processingFillQueueRef.current = false
    }
  }, [runFill])

  const enqueueCadetFill = React.useCallback(
    (payload: CadetFillRequestedPayload) => {
      const request = buildRequest(payload)
      const now = Date.now()
      const recent = recentEnqueueRef.current

      if (
        recent?.transactionId === request.transactionId &&
        now - recent.at < DUPLICATE_ENQUEUE_WINDOW_MS
      ) {
        return
      }

      recentEnqueueRef.current = { transactionId: request.transactionId, at: now }

      setPendingCadetFills((prev) => {
        const active = prev.filter((item) => isActiveCadetFillStatus(item.status))
        return [...active, request]
      })

      fillQueueRef.current.push(request)
      void drainFillQueue()
    },
    [drainFillQueue],
  )

  const retryCadetFill = React.useCallback(
    (requestId: string) => {
      const request = pendingCadetFills.find((item) => item.id === requestId)
      if (!request) return

      clearDismissTimeout(requestId)
      const retryRequest: CadetFillRequest = {
        ...request,
        id: `${request.transactionId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        status: "pending",
        message: undefined,
        report: undefined,
        timestamp: new Date(),
      }

      setPendingCadetFills((prev) => {
        const withoutRetried = prev.filter((item) => item.id !== requestId)
        const active = withoutRetried.filter((item) => isActiveCadetFillStatus(item.status))
        return [...active, retryRequest]
      })

      fillQueueRef.current.push(retryRequest)
      void drainFillQueue()
    },
    [pendingCadetFills, drainFillQueue, clearDismissTimeout],
  )

  const clearCadetFills = React.useCallback(() => {
    dismissTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    dismissTimeoutsRef.current.clear()
    fillQueueRef.current = []
    processingFillQueueRef.current = false
    recentEnqueueRef.current = null
    void hideCadetFillPopupSafely()
    setPendingCadetFills([])
  }, [])

  return {
    pendingCadetFills,
    enqueueCadetFill,
    retryCadetFill,
    clearCadetFills,
    clearCompletedCadetFills,
    dismissCadetFill,
  }
}
