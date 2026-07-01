"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  getTransactionCommunications,
  type CommunicationEntry,
  type CommunicationFilter,
  type CommunicationsMeta,
} from "../api/communication-service"

const PER_PAGE = 10
const COMMUNICATION_SENT_EVENT = "subi:communication-sent"

export function useTransactionCommunications(transactionId: string) {
  const [communications, setCommunications] = useState<CommunicationEntry[]>([])
  const [meta, setMeta] = useState<CommunicationsMeta | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilterState] = useState<CommunicationFilter>("all")

  const hasMore = meta ? meta.current_page < meta.total_pages : false

  const filterRef = useRef(filter)
  filterRef.current = filter
  const transactionIdRef = useRef(transactionId)
  transactionIdRef.current = transactionId
  const requestSequenceRef = useRef(0)

  const loadCommunications = useCallback(
    async (page = 1, activeFilter?: CommunicationFilter) => {
      const requestId = ++requestSequenceRef.current
      const expectedTransactionId = transactionId

      setIsLoading(true)
      try {
        const res = await getTransactionCommunications(transactionId, {
          filter: activeFilter ?? filterRef.current,
          page,
          perPage: PER_PAGE,
        })

        const isLatestRequest = requestId === requestSequenceRef.current
        const isSameTransaction = transactionIdRef.current === expectedTransactionId
        if (!isLatestRequest || !isSameTransaction) return

        if (page === 1) {
          setCommunications(res.communications)
        } else {
          setCommunications((prev) => [...prev, ...res.communications])
        }
        setMeta(res.meta)
      } catch (error) {
        console.error("[useTransactionCommunications] error:", error)
      } finally {
        if (requestId === requestSequenceRef.current) {
          setIsLoading(false)
        }
      }
    },
    [transactionId],
  )

  const setFilter = useCallback(
    (next: CommunicationFilter) => {
      setFilterState(next)
      setCommunications([])
      setMeta(null)
      loadCommunications(1, next)
    },
    [loadCommunications],
  )

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !meta) return
    await loadCommunications(meta.current_page + 1)
  }, [isLoading, hasMore, meta, loadCommunications])

  const refresh = useCallback(async () => {
    await loadCommunications(1)
  }, [loadCommunications])

  useEffect(() => {
    loadCommunications(1)
  }, [loadCommunications])

  useEffect(() => {
    const handleCommunicationSent = (event: Event) => {
      const detail = (event as CustomEvent<{ transactionId?: string }>).detail
      if (detail?.transactionId && detail.transactionId !== transactionIdRef.current) return
      void loadCommunications(1)
    }

    window.addEventListener(COMMUNICATION_SENT_EVENT, handleCommunicationSent as EventListener)
    return () => {
      window.removeEventListener(COMMUNICATION_SENT_EVENT, handleCommunicationSent as EventListener)
    }
  }, [loadCommunications])

  return {
    communications,
    meta,
    isLoading,
    filter,
    hasMore,
    setFilter,
    loadMore,
    refresh,
  }
}
