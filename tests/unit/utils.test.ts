import { describe, expect, it } from "vitest";
import { assertDefined, formatDate, groupBy, truncate } from "@xyphyx/shared";

describe("truncate", () => {
  it("returns the original string when shorter than maxLength", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates and appends ellipsis when longer than maxLength", () => {
    expect(truncate("hello world", 8)).toBe("hello...");
  });

  it("returns the string as-is when equal to maxLength", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    const date = new Date("2024-01-15");
    const result = formatDate(date);
    expect(result).toContain("2024");
    expect(result).toContain("January");
  });

  it("formats a timestamp number", () => {
    const ts = new Date("2024-06-01").getTime();
    const result = formatDate(ts);
    expect(result).toContain("2024");
  });
});

describe("assertDefined", () => {
  it("returns the value when defined", () => {
    expect(assertDefined("hello")).toBe("hello");
    expect(assertDefined(0)).toBe(0);
    expect(assertDefined(false)).toBe(false);
  });

  it("throws when null", () => {
    expect(() => assertDefined(null)).toThrow();
  });

  it("throws when undefined", () => {
    expect(() => assertDefined(undefined)).toThrow();
  });

  it("uses the custom message when provided", () => {
    expect(() => assertDefined(null, "custom error")).toThrow("custom error");
  });
});

describe("groupBy", () => {
  it("groups items by a string key", () => {
    const items = [
      { type: "fruit", name: "apple" },
      { type: "vegetable", name: "carrot" },
      { type: "fruit", name: "banana" },
    ];
    const result = groupBy(items, (i) => i.type);
    expect(result.fruit).toHaveLength(2);
    expect(result.vegetable).toHaveLength(1);
  });

  it("returns an empty object for an empty array", () => {
    expect(groupBy([], (i: { id: number }) => i.id)).toEqual({});
  });
});
