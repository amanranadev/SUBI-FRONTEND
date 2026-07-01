import {
  addBusinessDaysToISODate,
  addDaysToISODate,
  parseDateToISO,
} from "./format";

describe("format date helpers", () => {
  it("parses single-digit month/day dates without timezone drift", () => {
    expect(parseDateToISO("4/21/2026")).toBe("2026-04-21");
    expect(parseDateToISO("4-5-2026")).toBe("2026-04-05");
  });

  it("adds 5 business days from mutual acceptance and skips weekend", () => {
    expect(addBusinessDaysToISODate("2026-04-21", 5)).toBe("2026-04-28");
  });

  it("does not count federal holidays as business days", () => {
    expect(addBusinessDaysToISODate("2026-11-20", 5)).toBe("2026-11-30");
    expect(addDaysToISODate("2026-11-20", 5)).toBe("2026-11-25");
  });
});
