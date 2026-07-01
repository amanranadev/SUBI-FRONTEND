/** Matches `syncAgentTcFieldsToUserProfile` / onboarding merge format. */
export const MANAGING_BROKER_USER_COMBINED_SEPARATOR = " · " as const

/**
 * `GET /users` exposes a single `managing_broker` string; complete-profile uses
 * separate name/phone on onboarding. Split for Settings form display.
 */
export function splitManagingBrokerFromUser(combined: string): {
  name: string
  phone: string
} {
  const trimmed = combined.trim().replace(/\u00a0/g, " ")
  if (!trimmed) return { name: "", phone: "" }

  const canonicalSep = MANAGING_BROKER_USER_COMBINED_SEPARATOR
  let idx = trimmed.indexOf(canonicalSep)
  if (idx !== -1) {
    return {
      name: trimmed.slice(0, idx).trim(),
      phone: trimmed.slice(idx + canonicalSep.length).trim(),
    }
  }

  // API / copy-paste may use another middle dot, bullet, or pipe
  const parts = trimmed.split(/\s*[\u00B7\u2022|]\s*/)
  if (parts.length >= 2) {
    const phone = parts[parts.length - 1]?.trim() ?? ""
    const name = parts.slice(0, -1).join(" · ").trim()
    return { name, phone }
  }

  const digits = trimmed.replace(/\D/g, "")
  if (digits.length >= 10 && /^[\d\s\-()+.]+$/.test(trimmed)) {
    return { name: "", phone: trimmed }
  }

  return { name: trimmed, phone: "" }
}

export function combineManagingBrokerForUser(name: string, phone: string): string {
  return [name.trim(), phone.trim()].filter(Boolean).join(MANAGING_BROKER_USER_COMBINED_SEPARATOR)
}
