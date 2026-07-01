"use client"

import * as React from "react"

export function useChatScroll(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  deps: React.DependencyList,
) {
  const isNearBottomRef = React.useRef(true)

  React.useEffect(() => {
    const viewport = scrollRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    )
    if (!viewport) return

    const handleScroll = () => {
      const threshold = 100
      isNearBottomRef.current =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <
        threshold
    }

    viewport.addEventListener("scroll", handleScroll, { passive: true })
    return () => viewport.removeEventListener("scroll", handleScroll)
  }, [scrollRef])

  const scrollToBottom = React.useCallback(() => {
    const viewport = scrollRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    )
    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTop = viewport.scrollHeight
      })
    }
  }, [scrollRef])

  const scrollToTop = React.useCallback(() => {
    const viewport = scrollRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    )
    viewport?.scrollTo({ top: 0, behavior: "smooth" })
  }, [scrollRef])

  React.useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom()
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return { scrollToBottom, scrollToTop }
}
