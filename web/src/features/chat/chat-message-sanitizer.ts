const INTERNAL_COMMAND_MARKER_PATTERN =
  /\b(template_id\s*:|force_template_create\s*:|instruction_text\s*:|use my selected template)\b/i

const INTERNAL_COMMAND_LINE_PATTERN =
  /^(template_id\s*:|force_template_create\s*:|instruction_text\s*:|use my selected template)\b/i

const UUID_PATTERN =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi

const KEYED_ID_PATTERN =
  /\b([a-z_]*id)\s*:\s*([0-9a-f]{8}-[0-9a-f-]{27,}|[a-z0-9_-]{16,})\b/gi

const LABELLED_ID_PATTERN =
  /\b(transaction id|draft id|template id|task id|contact id|request id|preview id)\s*[:#]?\s*([a-z0-9_-]{8,})\b/gi

export function isInternalCommandMessage(text: string): boolean {
  return INTERNAL_COMMAND_MARKER_PATTERN.test(text.toLowerCase())
}

export function isRawInternalCommandMessage(text: string): boolean {
  const normalizedText = text.toString().trim()
  if (!normalizedText) return false

  const lines = normalizedText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) return false
  return lines.every((line) => INTERNAL_COMMAND_LINE_PATTERN.test(line))
}

export function isInternalCommandPayloadMessage(text: string): boolean {
  const normalizedText = text.toString().trim()
  if (!normalizedText) return false

  const normalizedLines = normalizedText
    .split("\n")
    .map((line) => line.replace(/^[`>\-\s]+/, "").trim())
    .filter(Boolean)

  if (normalizedLines.some((line) => INTERNAL_COMMAND_LINE_PATTERN.test(line))) {
    return true
  }

  const hasTemplateCommand =
    /\btemplate_id\s*:/i.test(normalizedText) &&
    /use this selected template for the email draft/i.test(normalizedText)
  if (hasTemplateCommand) return true

  const hasForcedCreateCommand =
    /\bforce_template_create\s*:\s*true\b/i.test(normalizedText) &&
    /\binstruction_text\s*:/i.test(normalizedText)
  if (hasForcedCreateCommand) return true

  return false
}

export function redactTechnicalIds(text: string): string {
  return text
    .replace(KEYED_ID_PATTERN, "$1: [hidden]")
    .replace(LABELLED_ID_PATTERN, "$1: [hidden]")
    .replace(UUID_PATTERN, "[hidden-id]")
}

export function sanitizeChatDisplayText(text: string): string {
  return redactTechnicalIds(text)
    .replace(/[^\S\r\n]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/** Draft was created (email/sms/message), including "drafted the escrow email". */
const DRAFT_CREATED_PATTERNS = [
  /\b(?:draft(?:ed)?|prepared?|created?|written?|composed?)\s+(?:(?:an?|the|your|this|that)\s+)?(?:[\w&.'/-]+\s+){0,10}(?:email|sms|message)\b/i,
  /\b(?:draft(?:ed)?|prepared?|created?|written?|composed?)\s+(?:an?\s+)?(?:email|sms|message|draft)\b/i,
  /\b(?:email|sms|message)\s+draft\b/i,
  /\bhere\s+is\s+(?:a[n]?\s+)?(?:draft\s+)?(?:email|sms|message)\b/i,
] as const

/** User is asked to review or confirm before sending. */
const DRAFT_REVIEW_ASK_PATTERNS = [
  /\bplease\s+(?:review|confirm|check)\b/i,
  /\breview\s+(?:the\s+)?(?:draft|it|and|before)\b/i,
  /\bconfirm\s+(?:if|to\s+send|before\s+send)/i,
  /\bwould\s+you\s+like\s+to\s+(?:review|send|confirm)\b/i,
] as const

/**
 * Returns true when an AI message is clearly announcing a new draft and asking
 * the user to review/confirm/send it. Intentionally broad to catch the many
 * ways the AI can phrase this (e.g. "I've drafted", "I have prepared", "Here is
 * a draft", "I created a draft email", "I've drafted the escrow email", etc.).
 */
export function isAssistantDraftReviewMessage(text: string): boolean {
  const t = text.trim()
  if (!t) return false

  const hasDraftAnnouncement = DRAFT_CREATED_PATTERNS.some((pattern) => pattern.test(t))
  const hasReviewAsk = DRAFT_REVIEW_ASK_PATTERNS.some((pattern) => pattern.test(t))

  return hasDraftAnnouncement && hasReviewAsk
}

export function assistantDraftMessageLikelyMatchesDraft(
  assistantText: string,
  draft: {
    recipient: { name: string; email?: string; phone?: string }
  },
): boolean {
  const text = assistantText
  const email = draft.recipient.email?.trim()
  if (email && text.includes(email)) return true
  const phone = draft.recipient.phone?.replace(/\D/g, "")
  if (phone && phone.length >= 7) {
    const digitsInText = text.replace(/\D/g, "")
    if (digitsInText.includes(phone)) return true
  }
  const name = draft.recipient.name?.trim()
  if (name && name.length > 2 && text.includes(name)) return true
  return false
}
