import { describe, it, expect } from "vitest";
import { parseJSON } from "../src/index.js";

// --- Generate valid random JSON ---
function randomJSON(depth = 0): any {
  const types = ["number", "string", "boolean", "null", "array", "object"];
  const choice = types[Math.floor(Math.random() * types.length)];

  if (depth > 5) return null; // limit recursion depth

  switch (choice) {
    case "number":
      const exp = Math.floor(Math.random() * 5) - 2;
      return parseFloat((Math.random() * 1000 * Math.pow(10, exp) - 500).toFixed(2));
    case "string":
      const str = Math.random().toString(36).substring(2, 8);
      return Math.random() > 0.7 ? `${str}\"` : str;
    case "boolean":
      return Math.random() > 0.5;
    case "null":
      return null;
    case "array":
      return Array.from({ length: Math.floor(Math.random() * 5) }, () =>
        randomJSON(depth + 1)
      );
    case "object":
      const obj: Record<string, any> = {};
      const keys = Math.floor(Math.random() * 4);
      for (let i = 0; i < keys; i++) {
        obj[Math.random().toString(36).substring(2, 6)] = randomJSON(depth + 1);
      }
      return obj;
  }
}

// --- Generate invalid random JSON ---
function randomInvalidJSON(): string {
  const base = JSON.stringify(randomJSON());
  if (Math.random() > 0.5) {
    return base.replace(/\}$/, ",}"); // trailing comma
  } else {
    return base.replace(/\]/, ""); // remove closing bracket
  }
}

describe("Fuzzy JSON Tests (Separate File)", () => {
  // Valid JSON tests
  for (let i = 0; i < 50; i++) {
    it(`fuzzy valid JSON test #${i + 1}`, () => {
      const jsonObj = randomJSON();
      const jsonStr = JSON.stringify(jsonObj);

      expect(parseJSON(jsonStr)).toEqual(JSON.parse(jsonStr));
    });
  }

  // Invalid JSON tests
  for (let i = 0; i < 20; i++) {
    it(`fuzzy invalid JSON test #${i + 1}`, () => {
      const invalidStr = randomInvalidJSON();
      expect(() => parseJSON(invalidStr)).toThrow(SyntaxError);
    });
  }
});
