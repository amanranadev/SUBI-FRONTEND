"use client"

import { MessageSquare, ExternalLink, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"

type SmsLinkData = {
  phoneNumbers: string[]
  message: string
  recipientCount: number
  note: string
  iosLink: string
  androidLink: string
}

interface SmsLinkCardProps {
  data: SmsLinkData
  compact?: boolean
}

function detectPlatform(): "ios" | "android" | "unknown" {
  if (typeof navigator === "undefined") return "unknown"
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod|Macintosh/.test(ua)) return "ios"
  if (/Android/.test(ua)) return "android"
  return "unknown"
}

export function SmsLinkCard({ data, compact }: SmsLinkCardProps) {
  const platform = detectPlatform()
  return (
    <div
      className={cn(
        "rounded-2xl border border-green-200 bg-green-50/50 overflow-hidden",
        compact ? "text-sm" : "text-base",
      )}
    >
      <div className="flex items-center gap-2 px-4 py-2.5 bg-green-100/60 border-b border-green-200">
        <MessageSquare className="size-4 text-green-700" />
        <span className="font-semibold text-green-800">
          Group Text Ready
        </span>
        <span className="ml-auto text-xs text-green-600 font-medium">
          {data.recipientCount} recipient{data.recipientCount !== 1 ? "s" : ""}
        </span>
      </div>

      <div className={cn("space-y-3", compact ? "p-3" : "p-4")}>
        {data.note && (
          <p className="text-sm text-green-800/80">{data.note}</p>
        )}

        <div className="space-y-1.5">
          {data.phoneNumbers.map((phone) => (
            <div key={phone} className="flex items-center gap-2 text-sm">
              <Smartphone className="size-3 text-green-600/60 shrink-0" />
              <span className="font-medium text-green-900">{phone}</span>
            </div>
          ))}
        </div>

        <div
          className={cn(
            "whitespace-pre-wrap rounded-xl bg-white border border-green-100",
            compact ? "p-3 text-xs" : "p-4 text-sm",
          )}
        >
          {data.message}
        </div>

        {platform === "unknown" ? (
          <div className="flex gap-2">
            <a
              href={data.iosLink}
              className="flex items-center justify-center gap-2 flex-1 h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <ExternalLink className="size-4" />
              iPhone / Mac
            </a>
            <a
              href={data.androidLink}
              className="flex items-center justify-center gap-2 flex-1 h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <ExternalLink className="size-4" />
              Android
            </a>
          </div>
        ) : (
          <a
            href={platform === "ios" ? data.iosLink : data.androidLink}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <ExternalLink className="size-4" />
            Open in Messages
          </a>
        )}

        <p className="text-[10px] text-green-700/50 text-center">
          Opens your device&apos;s Messages app with recipients and message pre-filled
        </p>
      </div>
    </div>
  )
}

// Match both formats:
// Android: sms:+1234,+5678?body=Hello
// iOS: sms:&addresses=+1234,+5678&body=Hello
const SMS_LINK_REGEX = /sms:\/?\/?[^\s"'<>)}\]]*/

export function extractSmsLinkData(text: string): SmsLinkData | null {
  const linkMatch = text.match(SMS_LINK_REGEX)
  if (!linkMatch) return null

  const smsLink = linkMatch[0]
  let phoneNumbers: string[] = []
  let message = ""

  // iOS format: sms:&addresses=+123,+456&body=Hello
  const addressesMatch = smsLink.match(/addresses=([^&]*)/)
  if (addressesMatch) {
    phoneNumbers = decodeURIComponent(addressesMatch[1]).split(",").filter(Boolean)
  }

  // Android format: sms:+123,+456?body=Hello
  if (phoneNumbers.length === 0) {
    const uriPart = smsLink.replace(/^sms:/, "").split("?")[0]
    phoneNumbers = uriPart.split(",").filter((p) => p.startsWith("+"))
  }

  // Extract body from either format
  const bodyMatch = smsLink.match(/body=([^\s&]*)/)
  if (bodyMatch) {
    message = decodeURIComponent(bodyMatch[1])
  }

  if (phoneNumbers.length === 0) return null

  // Build both platform links
  const encodedBody = encodeURIComponent(message)
  const phones = phoneNumbers.join(",")
  const iosLink = `sms:&addresses=${phones}&body=${encodedBody}`
  const androidLink = `sms://${phones}?body=${encodedBody}`

  // Extract note from surrounding text
  const note = text
    .replace(smsLink, "")
    .replace(/[*_`#\[\]()]/g, "")
    .trim()
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .slice(0, 2)
    .join(" ")

  return {
    phoneNumbers,
    message,
    recipientCount: phoneNumbers.length,
    note: note || "Tap a button below to open your Messages app with the text pre-filled.",
    iosLink,
    androidLink,
  }
}
