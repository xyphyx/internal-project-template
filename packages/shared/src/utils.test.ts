import { describe, expect, it } from "vitest";
import { assertDefined, formatDate, groupBy, truncate } from "./utils";

describe("formatDate", () => {
  it("formats a Date object to a human-readable string", () => {
    const date = new Date("2024-01-15T12:00:00Z");
    const result = formatDate(date, "en-US");
    expect(result).toContain("2024");
    expect(result).toContain("15");
  });

  it("accepts a numeric timestamp", () => {
    const ts = new Date("2024-06-01T00:00:00Z").getTime();
    const result = formatDate(ts, "en-US");
    expect(result).toContain("2024");
  });
});

describe("truncate", () => {
  it("returns the original string when within maxLength", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("returns the string unchanged when exactly at maxLength", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("truncates and appends ellipsis when over maxLength", () => {
    expect(truncate("hello world", 8)).toBe("hello...");
    expect(truncate("hello world", 8).length).toBe(8);
  });
});

describe("assertDefined", () => {
  it("returns the value when it is defined", () => {
    expect(assertDefined(42)).toBe(42);
    expect(assertDefined("hello")).toBe("hello");
    expect(assertDefined(0)).toBe(0);
  });

  it("throws when value is null", () => {
    expect(() => assertDefined(null)).toThrow();
  });

  it("throws when value is undefined", () => {
    expect(() => assertDefined(undefined)).toThrow();
  });

  it("throws with a custom message when provided", () => {
    expect(() => assertDefined(null, "custom error")).toThrow("custom error");
  });
});

describe("groupBy", () => {
  it("groups items by a string key", () => {
    const items = [
      { type: "a", value: 1 },
      { type: "b", value: 2 },
      { type: "a", value: 3 },
    ];
    const result = groupBy(items, (item) => item.type);
    expect(result.a).toHaveLength(2);
    expect(result.b).toHaveLength(1);
    expect(result.a![0]!.value).toBe(1);
    expect(result.a![1]!.value).toBe(3);
  });

  it("returns an empty object for an empty array", () => {
    expect(groupBy([], (item) => item)).toEqual({});
  });

  it("handles a single item", () => {
    const result = groupBy([{ id: 1 }], (item) => item.id);
    expect(result[1]).toEqual([{ id: 1 }]);
  });
});
