import * as React from "react"

interface MarkdownProps {
  content: string
  className?: string
}

export function Markdown({ content, className }: MarkdownProps) {
  const rendered = React.useMemo(() => {
    return parseMarkdown(content)
  }, [content])

  return <div className={className}>{rendered}</div>
}

function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n")
  const result: React.ReactNode[] = []
  let listItems: React.ReactNode[] = []
  let inList = false

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim()

    // Check for list items
    const listMatch = trimmed.match(/^[-*]\s+(.+)$/)
    if (listMatch) {
      if (!inList) {
        inList = true
        listItems = []
      }
      listItems.push(
        <li key={`li-${lineIndex}`} className="ml-4">
          {parseInline(listMatch[1])}
        </li>
      )
      return
    }

    // End of list
    if (inList && listItems.length > 0) {
      result.push(
        <ul key={`ul-${lineIndex}`} className="list-disc pl-4 my-2">
          {listItems}
        </ul>
      )
      listItems = []
      inList = false
    }

    // Empty line
    if (trimmed === "") {
      result.push(<br key={`br-${lineIndex}`} />)
      return
    }

    // Regular paragraph
    result.push(
      <p key={`p-${lineIndex}`} className="my-1">
        {parseInline(trimmed)}
      </p>
    )
  })

  // Handle remaining list items
  if (inList && listItems.length > 0) {
    result.push(
      <ul key="ul-final" className="list-disc pl-4 my-2">
        {listItems}
      </ul>
    )
  }

  return result
}

function parseInline(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = []
  let remaining = text
  let keyIndex = 0

  while (remaining.length > 0) {
    // Bold with ** or __
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)$/) || 
                      remaining.match(/^(.*?)__(.+?)__(.*)$/)
    if (boldMatch) {
      if (boldMatch[1]) {
        result.push(...parseInlineSimple(boldMatch[1], `pre-bold-${keyIndex}`))
      }
      result.push(
        <strong key={`bold-${keyIndex}`} className="font-semibold">
          {boldMatch[2]}
        </strong>
      )
      remaining = boldMatch[3]
      keyIndex++
      continue
    }

    // Italic with * or _
    const italicMatch = remaining.match(/^(.*?)\*(.+?)\*(.*)$/) ||
                        remaining.match(/^(.*?)_(.+?)_(.*)$/)
    if (italicMatch) {
      if (italicMatch[1]) {
        result.push(...parseInlineSimple(italicMatch[1], `pre-italic-${keyIndex}`))
      }
      result.push(
        <em key={`italic-${keyIndex}`} className="italic">
          {italicMatch[2]}
        </em>
      )
      remaining = italicMatch[3]
      keyIndex++
      continue
    }

    // Code with backticks
    const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)$/)
    if (codeMatch) {
      if (codeMatch[1]) {
        result.push(...parseInlineSimple(codeMatch[1], `pre-code-${keyIndex}`))
      }
      result.push(
        <code key={`code-${keyIndex}`} className="bg-black/5 px-1.5 py-0.5 rounded text-sm font-mono">
          {codeMatch[2]}
        </code>
      )
      remaining = codeMatch[3]
      keyIndex++
      continue
    }

    // No more matches, add remaining text
    result.push(...parseInlineSimple(remaining, `text-${keyIndex}`))
    break
  }

  return result
}

function parseInlineSimple(text: string, keyPrefix: string): React.ReactNode[] {
  // Handle links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`${keyPrefix}-text-${lastIndex}`}>
          {text.slice(lastIndex, match.index)}
        </span>
      )
    }
    parts.push(
      <a
        key={`${keyPrefix}-link-${match.index}`}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline hover:no-underline"
      >
        {match[1]}
      </a>
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(
      <span key={`${keyPrefix}-text-final`}>
        {text.slice(lastIndex)}
      </span>
    )
  }

  return parts.length > 0 ? parts : [<span key={keyPrefix}>{text}</span>]
}
