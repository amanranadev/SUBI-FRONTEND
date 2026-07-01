import { addBreadcrumb, captureCableError } from "@/lib/sentry"

type MessageHandler = (message: Record<string, unknown>) => void
type StateHandler = () => void

interface Subscription {
  identifier: string
  onMessage: MessageHandler
}

interface ActionCableEvents {
  onOpen?: StateHandler
  onClose?: StateHandler
  onReject?: StateHandler
}

const PING_STALE_THRESHOLD_MS = 8_000
const RECONNECT_BASE_MS = 1_000
const RECONNECT_MAX_MS = 30_000

export class ActionCableClient {
  private ws: WebSocket | null = null
  private subscriptions = new Map<string, Subscription>()
  private events: ActionCableEvents
  private url: string
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private pingTimer: ReturnType<typeof setTimeout> | null = null
  private lastPingAt = 0
  private intentionalDisconnect = false

  constructor(url: string, events: ActionCableEvents = {}) {
    this.url = url
    this.events = events
  }

  connect() {
    this.intentionalDisconnect = false
    this.createSocket()
  }

  disconnect() {
    this.intentionalDisconnect = true
    this.clearTimers()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  subscribe(channel: string, params: Record<string, unknown> = {}, onMessage: MessageHandler) {
    const identifier = JSON.stringify({ channel, ...params })
    this.subscriptions.set(identifier, { identifier, onMessage })

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribe(identifier)
    }

    return () => {
      this.unsubscribe(identifier)
    }
  }

  send(channel: string, params: Record<string, unknown> = {}, data: Record<string, unknown>) {
    const identifier = JSON.stringify({ channel, ...params })

    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn("[ActionCable] Cannot send — socket not open")
      return
    }

    this.ws.send(JSON.stringify({
      command: "message",
      identifier,
      data: JSON.stringify(data),
    }))
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN
  }

  private createSocket() {
    this.clearTimers()

    try {
      this.ws = new WebSocket(this.url)
    } catch {
      this.scheduleReconnect()
      return
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.lastPingAt = Date.now()
      this.startPingMonitor()
      addBreadcrumb("cable", "WebSocket connected")

      for (const [identifier] of this.subscriptions) {
        this.sendSubscribe(identifier)
      }

      this.events.onOpen?.()
    }

    this.ws.onclose = (event) => {
      this.clearTimers()
      this.events.onClose?.()
      if (event.code !== 1000 && event.code !== 1001) {
        captureCableError(
          new Error(`WebSocket disconnected (${event.code})`),
          {
            event: "disconnect",
            channel: "ChatChannel",
            code: event.code,
          },
        )
      }

      if (!this.intentionalDisconnect) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = (_event) => {
      captureCableError(new Error("WebSocket connection error"), {
        event: "connect-error",
        channel: "ChatChannel",
      })
      // onclose will fire after onerror, reconnect handled there
    }

    this.ws.onmessage = (event) => {
      let parsed: Record<string, unknown>
      try {
        parsed = JSON.parse(event.data as string)
      } catch {
        return
      }

      this.handleMessage(parsed)
    }
  }

  private handleMessage(msg: Record<string, unknown>) {
    const type = msg.type as string | undefined

    if (type === "ping") {
      this.lastPingAt = Date.now()
      return
    }

    if (type === "welcome") {
      return
    }

    if (type === "confirm_subscription") {
      addBreadcrumb("cable", "Subscription confirmed", {
        identifier: String(msg.identifier ?? "unknown"),
      })
      return
    }

    if (type === "reject_subscription") {
      const identifier = msg.identifier as string | undefined
      captureCableError(
        new Error("Subscription rejected by ActionCable"),
        {
          event: "subscribe-rejected",
          channel: "ChatChannel",
        },
      )
      if (identifier) {
        this.subscriptions.delete(identifier)
      }
      this.events.onReject?.()
      return
    }

    if (type === "disconnect") {
      const reason = msg.reason as string | undefined
      if (reason === "unauthorized") {
        this.intentionalDisconnect = true
      }
      this.ws?.close()
      return
    }

    // Channel message — route to subscription handler
    const identifier = msg.identifier as string | undefined
    const message = msg.message as Record<string, unknown> | undefined

    if (identifier && message) {
      // Try exact match first
      let sub = this.subscriptions.get(identifier)

      // If no exact match, try to find a subscription for the same channel
      if (!sub) {
        try {
          const parsed = JSON.parse(identifier)
          const channelName = parsed.channel as string | undefined
          if (channelName) {
            for (const [key, subscription] of this.subscriptions) {
              const keyParsed = JSON.parse(key)
              if (keyParsed.channel === channelName) {
                sub = subscription
                break
              }
            }
          }
        } catch {
          // identifier wasn't valid JSON, skip
        }
      }

      if (sub) {
        sub.onMessage(message)
        return
      }
    }

    // Direct broadcast (from stream_from) — no identifier wrapper
    // These come from ActionCable.server.broadcast("stream_name", data)
    // Route to all subscriptions since we can't determine which channel it's for
    if (message || msg.type) {
      const payload = message || msg
      for (const sub of this.subscriptions.values()) {
        sub.onMessage(payload as Record<string, unknown>)
      }
    }
  }

  private sendSubscribe(identifier: string) {
    this.ws?.send(JSON.stringify({
      command: "subscribe",
      identifier,
    }))
  }

  private unsubscribe(identifier: string) {
    this.subscriptions.delete(identifier)

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        command: "unsubscribe",
        identifier,
      }))
    }
  }

  private scheduleReconnect() {
    if (this.intentionalDisconnect) return

    const delay = Math.min(
      RECONNECT_BASE_MS * Math.pow(2, this.reconnectAttempts),
      RECONNECT_MAX_MS,
    )
    this.reconnectAttempts++

    this.reconnectTimer = setTimeout(() => {
      this.createSocket()
    }, delay)
  }

  private startPingMonitor() {
    this.pingTimer = setInterval(() => {
      if (Date.now() - this.lastPingAt > PING_STALE_THRESHOLD_MS) {
        // Server stopped pinging — connection is stale
        this.ws?.close()
      }
    }, PING_STALE_THRESHOLD_MS)
  }

  private clearTimers() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }
}

/**
 * Build the Action Cable WebSocket URL from the HTTP API base URL.
 * `http://localhost:4000` -> `ws://localhost:4000/cable?token=xxx`
 */
export function buildCableUrl(apiBaseUrl: string, token: string): string {
  const url = new URL("/cable", apiBaseUrl)
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:"
  url.searchParams.set("token", token)
  return url.toString()
}
