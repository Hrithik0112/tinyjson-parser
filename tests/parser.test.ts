import { describe, it, expect } from "vitest";
import { parse } from "../src/parser";

describe("Parser M0 Test", () => {
  it("should run the placeholder parser", () => {
    const result = parse([]);
    expect(result).toEqual({});
  });
});
