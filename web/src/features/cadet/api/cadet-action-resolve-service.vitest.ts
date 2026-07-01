import { describe, expect, it } from "vitest"
import { resolveCadetActionPhrase } from "./cadet-action-resolve-service"

describe("resolveCadetActionPhrase", () => {
  it("is a function", () => {
    expect(typeof resolveCadetActionPhrase).toBe("function")
  })
})
