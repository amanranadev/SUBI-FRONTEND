import { env } from "@/lib/env"
import type { CadetFillReport } from "../types"

export type CadetFillOptions = {
  focusDotloopTab?: boolean
  multiSection?: boolean
  clickSave?: boolean
  silent?: boolean
}

type CadetFillPopupPayload = {
  title?: string
  subtitle?: string
  badgeLabel?: string
  countdownSeconds?: number
  statusText?: string
  tone?: "countdown" | "active" | "success"
}

type CadetExtensionResponse = {
  ok?: boolean
  error?: string
  message?: string
  report?: CadetFillReport
  version?: string
  tabId?: number
  url?: string
  requestId?: string
  status?: "running" | "success" | "error"
}

function getExtensionId(): string | null {
  const extensionId = env.NEXT_PUBLIC_CADET_EXTENSION_ID?.trim()
  return extensionId || null
}

function getChromeRuntime():
  | {
      sendMessage: (
        extensionId: string,
        message: Record<string, unknown>,
        callback: (response: CadetExtensionResponse) => void,
      ) => void
      lastError?: { message?: string }
    }
  | undefined {
  if (typeof window === "undefined") return undefined
  return (window as Window & { chrome?: { runtime?: unknown } }).chrome
    ?.runtime as ReturnType<typeof getChromeRuntime>
}

function sendExtensionMessage<T extends CadetExtensionResponse>(
  message: Record<string, unknown>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const extensionId = getExtensionId()
    const runtime = getChromeRuntime()

    if (!extensionId) {
      reject(new Error("CADET extension ID is not configured."))
      return
    }

    if (!runtime?.sendMessage) {
      reject(new Error("Chrome extension messaging is unavailable in this browser."))
      return
    }

    runtime.sendMessage(extensionId, message, (response) => {
      const lastError = runtime.lastError?.message
      if (lastError) {
        reject(new Error(lastError))
        return
      }

      if (!response?.ok) {
        reject(new Error(response?.error || "CADET extension request failed."))
        return
      }

      resolve(response as T)
    })
  })
}

export function isCadetExtensionConfigured(): boolean {
  return Boolean(getExtensionId())
}

export async function pingCadet(): Promise<boolean> {
  try {
    await sendExtensionMessage({ type: "CADET_PING" })
    return true
  } catch {
    return false
  }
}

export async function focusDotloopTab(): Promise<{ tabId: number; url: string } | null> {
  try {
    const response = await sendExtensionMessage<CadetExtensionResponse>({
      type: "FOCUS_DOTLOOP_TAB",
    })
    if (response.tabId && response.url) {
      return { tabId: response.tabId, url: response.url }
    }
    return null
  } catch {
    return null
  }
}

export async function showCadetFillPopup(payload: CadetFillPopupPayload): Promise<void> {
  // #region agent log
  fetch('http://127.0.0.1:7282/ingest/f0f2430a-4db9-4ac2-b5cc-951cde15ed9e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4db5fc'},body:JSON.stringify({sessionId:'4db5fc',location:'cadet-extension-bridge.ts:showCadetFillPopup',message:'sending show popup',data:{payload},timestamp:Date.now(),runId:'popup-debug',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  await sendExtensionMessage({
    type: "SHOW_SUBI_FILL_POPUP",
    payload,
  })
}

export async function updateCadetFillPopup(payload: CadetFillPopupPayload): Promise<void> {
  // #region agent log
  fetch('http://127.0.0.1:7282/ingest/f0f2430a-4db9-4ac2-b5cc-951cde15ed9e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4db5fc'},body:JSON.stringify({sessionId:'4db5fc',location:'cadet-extension-bridge.ts:updateCadetFillPopup',message:'sending update popup',data:{payload},timestamp:Date.now(),runId:'popup-debug',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  await sendExtensionMessage({
    type: "UPDATE_SUBI_FILL_POPUP",
    payload,
  })
}

export async function hideCadetFillPopup(): Promise<void> {
  await sendExtensionMessage({
    type: "HIDE_SUBI_FILL_POPUP",
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function pollSubiFillStatus(
  requestId: string,
  maxWaitMs = 180_000,
): Promise<{ message: string; report?: CadetFillReport }> {
  const startedAt = Date.now()

  while (Date.now() - startedAt < maxWaitMs) {
    const response = await sendExtensionMessage<CadetExtensionResponse>({
      type: "GET_SUBI_FILL_STATUS",
      requestId,
    })

    if (response.status === "success") {
      return {
        message: response.message || "CADET fill complete.",
        report: response.report,
      }
    }

    if (response.status === "error") {
      throw new Error(response.error || "CADET fill failed.")
    }

    await sleep(1000)
  }

  throw new Error("CADET fill timed out. Open a Dotloop form tab and try again.")
}

export async function fillTransaction(
  transactionId: string,
  platform = "dotloop",
  options: CadetFillOptions = {},
): Promise<{ message: string; report?: CadetFillReport }> {
  const response = await sendExtensionMessage<CadetExtensionResponse>({
    type: "FILL_SUBI_TRANSACTION",
    transactionId,
    platform,
    options: {
      focusDotloopTab: options.focusDotloopTab ?? true,
      multiSection: options.multiSection ?? true,
      clickSave: options.clickSave ?? true,
      silent: options.silent ?? true,
    },
  })

  if (response.requestId) {
    return pollSubiFillStatus(response.requestId)
  }

  return {
    message: response.message || "CADET fill complete.",
    report: response.report,
  }
}
