/** Strip a leading street number so "345 Diagon Alley" → "Diagon Alley". */
export function pinpointNameFromAddress(address: string): string {
  return address.trim().replace(/^\d+\s+/, "").replace(/\s+/g, " ").trim()
}

/** Standard SUBI chat phrase: `Dotloop <property name>`. */
export function formatPinpointCommand(address: string): string {
  const name = pinpointNameFromAddress(address)
  if (!name) return ""
  return `Dotloop ${name}`
}

/** Prefer address-based command; fall back to normalizing legacy `pinpoint` prefixes. */
export function formatCadetCommandDisplay(
  cadetCommand?: string,
  address?: string,
): string {
  if (address?.trim()) {
    const fromAddress = formatPinpointCommand(address)
    if (fromAddress) return fromAddress
  }

  const command = cadetCommand?.trim() ?? ""
  if (!command) return ""

  return command.replace(/^pinpoint\s+/i, "Dotloop ")
}
