import axios from "axios"
import { env } from "@/lib/env"
import {
  TRANSACTION_CATEGORY,
  type TransactionCategory,
} from "@/features/transactions/constants"
import type { RawTransactionData } from "@/features/transactions/types"

type DemoDocumentPreviewResponse = {
  success: boolean
  transactionData?: RawTransactionData
  error?: string
}

type DemoPreviewParams = {
  file: File
  transactionCategory?: TransactionCategory
}

const demoDocumentPreviewClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
})

class DemoDocumentPreviewService {
  async processDocument({
    file,
    transactionCategory = TRANSACTION_CATEGORY.PSA,
  }: DemoPreviewParams): Promise<RawTransactionData> {
    if (!env.NEXT_PUBLIC_DEMO_DOCUMENT_PREVIEW_TOKEN) {
      throw new Error(
        "Missing NEXT_PUBLIC_DEMO_DOCUMENT_PREVIEW_TOKEN for public demo requests.",
      )
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("transaction_category", transactionCategory)

    const { data } = await demoDocumentPreviewClient.post<DemoDocumentPreviewResponse>(
      "/demo/document_preview",
      formData,
      {
        headers: {
          "X-Demo-Token": env.NEXT_PUBLIC_DEMO_DOCUMENT_PREVIEW_TOKEN,
        },
      },
    )

    if (!data?.transactionData) {
      throw new Error(data?.error || "Demo processing did not return review data.")
    }

    return data.transactionData
  }
}

export const demoDocumentPreviewService = new DemoDocumentPreviewService()
