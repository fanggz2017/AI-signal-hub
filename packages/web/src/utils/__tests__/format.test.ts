import { describe, expect, it } from "vitest";
import { formatNumber } from "../format";

describe("formatNumber", () => {
  it("should format numbers >= 1000 with 'k'", () => {
    expect(formatNumber(1000)).toBe("1k");
    expect(formatNumber(1500)).toBe("1.5k");
    expect(formatNumber(10000)).toBe("10k");
    expect(formatNumber(10500)).toBe("10.5k");
  });

  it("should return string for numbers < 1000", () => {
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(123)).toBe("123");
  });
});
