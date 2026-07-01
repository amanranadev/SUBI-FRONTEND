"use client"

import * as React from "react"

export function useChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isClosing, setIsClosing] = React.useState(false)
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const handleOpen = React.useCallback(() => setIsOpen(true), [])

  const handleClose = React.useCallback(() => {
    setIsClosing(true)
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 700)
  }, [])

  return { isOpen, isClosing, handleOpen, handleClose }
}
