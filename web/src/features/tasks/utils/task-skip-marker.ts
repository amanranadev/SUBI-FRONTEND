export const TASK_SKIP_MARKER = "[[SUBI_SKIP]]"

export function hasTaskSkipMarker(value?: string | null): boolean {
  return typeof value === "string" && value.includes(TASK_SKIP_MARKER)
}

export function stripTaskSkipMarker(value?: string | null): string {
  if (typeof value !== "string" || value.length === 0) {
    return ""
  }

  return value
    .replace(TASK_SKIP_MARKER, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export function applyTaskSkipMarker(
  value: string | null | undefined,
  skipped: boolean,
): string {
  const cleanValue = stripTaskSkipMarker(value)

  if (!skipped) {
    return cleanValue
  }

  return cleanValue ? `${cleanValue}\n${TASK_SKIP_MARKER}` : TASK_SKIP_MARKER
}
