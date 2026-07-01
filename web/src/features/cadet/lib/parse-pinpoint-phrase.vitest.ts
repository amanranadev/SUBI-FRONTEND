import { describe, expect, it } from "vitest"
import {
  extractPinpointTarget,
  isCadetPinpointPhrase,
} from "./parse-pinpoint-phrase"

describe("parse-pinpoint-phrase", () => {
  it("detects Dotloop commands", () => {
    expect(isCadetPinpointPhrase("Dotloop downtown st")).toBe(true)
    expect(isCadetPinpointPhrase("dotloop downtown st")).toBe(true)
    expect(isCadetPinpointPhrase("pinpoint downtown st")).toBe(true)
    expect(isCadetPinpointPhrase("fill dotloop for downtown st")).toBe(true)
    expect(isCadetPinpointPhrase("hello there")).toBe(false)
  })

  it("extracts the property target", () => {
    expect(extractPinpointTarget("Dotloop downtown st")).toBe("downtown st")
    expect(extractPinpointTarget("dotloop Downtown St")).toBe("Downtown St")
    expect(extractPinpointTarget("pinpoint downtown st")).toBe("downtown st")
    expect(extractPinpointTarget("fill dotloop for Downtown St")).toBe("Downtown St")
  })
})
