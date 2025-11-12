import { describe, it, expect } from "vitest";
import { tokenize } from "../src/tokenizer";

describe("Tokenizer M0 Test", () => {
  it("should run the placeholder tokenizer", () => {
    const tokens = tokenize("{}");
    expect(tokens).toEqual([]);
  });
});
