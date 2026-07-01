const DOTLOOP_PREFIX_PATTERN = /^\s*dotloop\s+/i
const LEGACY_PINPOINT_PREFIX_PATTERN = /^\s*pinpoint\s+/i
const CADET_FILL_PREFIX_PATTERN =
  /^\s*(?:fill\s+dotloop(?:\s+for)?|run\s+cadet(?:\s+for)?|cadet)\s+/i

/** Returns true when the message looks like a CADET Dotloop fill command. */
export function isCadetPinpointPhrase(message: string): boolean {
  const normalized = message.trim().toLowerCase()
  return (
    DOTLOOP_PREFIX_PATTERN.test(message) ||
    LEGACY_PINPOINT_PREFIX_PATTERN.test(message) ||
    CADET_FILL_PREFIX_PATTERN.test(message) ||
    normalized.startsWith("dotloop ") ||
    normalized.startsWith("pinpoint ")
  )
}

/** Extract the target property name from a Dotloop-style phrase. */
export function extractPinpointTarget(message: string): string | null {
  const trimmed = message.trim()
  if (!trimmed) return null

  let target = trimmed
  target = target.replace(CADET_FILL_PREFIX_PATTERN, "")
  target = target.replace(DOTLOOP_PREFIX_PATTERN, "")
  target = target.replace(LEGACY_PINPOINT_PREFIX_PATTERN, "")
  target = target.trim().replace(/\s+/g, " ")

  return target || null
}
