import { describe, expect, it } from "vitest"
import {
  dateToInputFormat,
  formatLocalDateToIsoDay,
  parseDateValue,
} from "@/shared/utils/dateUtils"
import { parseDateToISO } from "@/shared/utils/format"
import { mapApiTransactionToTransaction } from "@/features/transactions/api/map-api-transaction"

describe("date-only timezone regression", () => {
  it("keeps calendar day when parseDateToISO receives ISO datetime", () => {
    expect(parseDateToISO("2026-06-01T00:00:00.000Z")).toBe("2026-06-01")
  })

  it("converts US slash format to ISO day", () => {
    expect(parseDateToISO("06/01/2026")).toBe("2026-06-01")
  })

  it("extracts day from ISO datetime for input fields", () => {
    expect(dateToInputFormat("2026-06-01T23:59:59.000Z")).toBe("2026-06-01")
  })

  it("parses ISO datetime values as local calendar day", () => {
    const parsed = parseDateValue("2026-06-01T00:00:00.000Z")
    expect(parsed).toBeDefined()
    if (!parsed) {
      throw new Error("Expected parsed date")
    }
    expect(formatLocalDateToIsoDay(parsed)).toBe("2026-06-01")
  })

  it("formats Date objects without UTC day shifts", () => {
    const localDate = new Date(2026, 5, 1, 0, 0, 0)
    expect(dateToInputFormat(localDate)).toBe("2026-06-01")
  })

  it("keeps selected day after API roundtrip mapping", () => {
    const selectedDay = "2026-06-01"
    const payloadDate = parseDateToISO(selectedDay)

    const mapped = mapApiTransactionToTransaction({
      id: 1,
      amount: 1000000,
      address: "123 Main St",
      closeDate: `${payloadDate}T00:00:00.000Z`,
    })

    expect(mapped.date).toBe("06/01/2026")
    expect(parseDateToISO(mapped.date)).toBe(selectedDay)
  })
})
