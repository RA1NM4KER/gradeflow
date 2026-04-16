import { describe, expect, it } from "vitest";

import {
  sanitizeIntegerInput,
  sanitizePlainNumberInput,
  sanitizeScoreExpressionInput,
} from "@/lib/assessments/numeric-input";

describe("numeric-input", () => {
  it("sanitizes plain numeric input", () => {
    expect(sanitizePlainNumberInput("12.5%abc")).toBe("12.5");
    expect(sanitizePlainNumberInput("..1a2")).toBe("..12");
    expect(sanitizePlainNumberInput("abc")).toBe("");
  });

  it("sanitizes integer input", () => {
    expect(sanitizeIntegerInput("MAT101-20")).toBe("10120");
    expect(sanitizeIntegerInput("abc")).toBe("");
  });

  it("sanitizes score expressions", () => {
    expect(
      sanitizeScoreExpressionInput(" (12/15) * 100% + abc ^ 2 ").replace(
        /\s+/g,
        " ",
      ),
    ).toBe(" (12/15) * 100% ^ 2 ");
    expect(sanitizeScoreExpressionInput("98,5% / 100")).toBe("98,5% / 100");
    expect(sanitizeScoreExpressionInput("abc")).toBe("");
  });
});
