"use client"

import { useCallback, useRef, useState } from "react"
import { PROCESSING_STEP } from "@/features/transactions/constants"
import type {
  ProcessingProgress,
  TransactionFormData,
} from "@/features/transactions/types"
import { mapRawToFormData } from "@/features/transactions/utils/map-transaction-data"
import { demoDocumentPreviewService } from "../api/demo-document-preview-service"

const INITIAL_PROGRESS: ProcessingProgress = {
  step: PROCESSING_STEP.IDLE,
  percent: 0,
  message: "",
}

export function useDemoDocumentProcessing() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<ProcessingProgress>(INITIAL_PROGRESS)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TransactionFormData | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const animationRef = useRef<number | null>(null)

  const stopProgressAnimation = useCallback(() => {
    if (animationRef.current) {
      window.clearInterval(animationRef.current)
      animationRef.current = null
    }
  }, [])

  const startProgressAnimation = useCallback(() => {
    let current = 20
    stopProgressAnimation()
    animationRef.current = window.setInterval(() => {
      current = Math.min(current + 8, 90)
      setProgress((prev) => ({
        ...prev,
        percent: current,
      }))
    }, 800)
  }, [stopProgressAnimation])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    stopProgressAnimation()
    setIsProcessing(false)
    setProgress(INITIAL_PROGRESS)
    setError(null)
    setResult(null)
  }, [stopProgressAnimation])

  const processFile = useCallback(
    async (file: File) => {
      abortRef.current?.abort()
      abortRef.current = new AbortController()
      setIsProcessing(true)
      setError(null)
      setResult(null)
      setProgress({
        step: PROCESSING_STEP.UPLOADING,
        percent: 15,
        message: "Uploading document...",
      })

      try {
        startProgressAnimation()
        setProgress({
          step: PROCESSING_STEP.ANALYZING,
          percent: 30,
          message: "Analyzing document and preparing review...",
        })
        const previewData = await demoDocumentPreviewService.processDocument({ file })
        const mapped = mapRawToFormData(previewData)

        stopProgressAnimation()
        setProgress({
          step: PROCESSING_STEP.COMPLETE,
          percent: 100,
          message: "Review data is ready.",
        })
        setResult(mapped)
      } catch (caughtError) {
        stopProgressAnimation()
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Something went wrong while processing this file."
        setError(message)
        setProgress({
          step: PROCESSING_STEP.ERROR,
          percent: 0,
          message,
        })
      } finally {
        setIsProcessing(false)
      }
    },
    [startProgressAnimation, stopProgressAnimation],
  )

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    reset()
  }, [reset])

  return {
    isProcessing,
    progress,
    error,
    result,
    processFile,
    cancel,
    reset,
  }
}
