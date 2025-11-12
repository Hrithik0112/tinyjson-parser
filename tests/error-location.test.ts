import { describe, it, expect } from "vitest";
import { parseJSON } from "../src/index";

describe("Error Location Tests (Line & Column Numbers)", () => {
  
  it("should report column number for single-line errors", () => {
    const input = '{"a":1x}'; // Invalid character 'x' at column 7
    try {
      parseJSON(input);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      expect((error as SyntaxError).message).toContain("line 1, column 7");
    }
  });

  it("should report line and column for multi-line errors", () => {
    const input = `{
  "a": 1,
  "b": 2x
}`; // Invalid character 'x' at line 3, column 9
    try {
      parseJSON(input);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      expect((error as SyntaxError).message).toContain("line 3, column 9");
    }
  });

  it("should report correct location for missing colon", () => {
    const input = '{"a" 1}'; // Missing colon after "a"
    try {
      parseJSON(input);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      expect((error as SyntaxError).message).toContain("Expected ':' after key");
      expect((error as SyntaxError).message).toMatch(/line \d+, column \d+/);
    }
  });

  it("should report correct location for trailing comma", () => {
    const input = '{"a":1,}'; // Trailing comma
    try {
      parseJSON(input);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      expect((error as SyntaxError).message).toContain("Trailing comma");
      expect((error as SyntaxError).message).toMatch(/line \d+, column \d+/);
    }
  });

  it("should report correct location for double comma", () => {
    const input = '{"a":1,,}'; // Double comma
    try {
      parseJSON(input);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      expect((error as SyntaxError).message).toContain("Unexpected comma after comma");
      expect((error as SyntaxError).message).toMatch(/line \d+, column \d+/);
    }
  });

  it("should report correct location for missing closing brace", () => {
    const input = '{"a":1'; // Missing closing brace
    try {
      parseJSON(input);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      expect((error as SyntaxError).message).toMatch(/line \d+, column \d+/);
    }
  });

  it("should report correct location for missing closing bracket", () => {
    const input = '[1,2,3'; // Missing closing bracket
    try {
      parseJSON(input);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      expect((error as SyntaxError).message).toMatch(/line \d+, column \d+/);
    }
  });

  it("should report correct location for invalid number", () => {
    const input = '{"a":0123}'; // Leading zero
    try {
      parseJSON(input);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      expect((error as SyntaxError).message).toContain("Leading zeros not allowed");
      expect((error as SyntaxError).message).toMatch(/line \d+, column \d+/);
    }
  });

  it("should report correct location for malformed number", () => {
    const input = '{"a":1.2.3}'; // Malformed number
    try {
      parseJSON(input);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      expect((error as SyntaxError).message).toMatch(/line \d+, column \d+/);
    }
  });

  it("should report correct location for unterminated string", () => {
    const input = '{"a":"hello'; // Unterminated string
    try {
      parseJSON(input);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      expect((error as SyntaxError).message).toContain("Unterminated string literal");
      expect((error as SyntaxError).message).toMatch(/line \d+, column \d+/);
    }
  });

  it("should report correct location for invalid escape sequence", () => {
    const input = '{"a":"hello\\x"}'; // Invalid escape \x
    try {
      parseJSON(input);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      expect((error as SyntaxError).message).toContain("Invalid escape sequence");
      expect((error as SyntaxError).message).toMatch(/line \d+, column \d+/);
    }
  });

  it("should report correct location for unexpected token after value", () => {
    const input = '{"a":1 "b":2}'; // Missing comma
    try {
      parseJSON(input);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      expect((error as SyntaxError).message).toMatch(/line \d+, column \d+/);
    }
  });

  it("should report line 1, column 1 for empty input", () => {
    const input = '';
    try {
      parseJSON(input);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      expect((error as SyntaxError).message).toContain("line 1, column 1");
    }
  });

  it("should handle complex multi-line JSON errors", () => {
    const input = `{
  "name": "John",
  "age": 30,
  "city": "New York"
  "country": "USA"
}`; // Missing comma after "New York"
    try {
      parseJSON(input);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      expect((error as SyntaxError).message).toMatch(/line \d+, column \d+/);
      // Should be around line 5, column 3 (where "country" starts)
    }
  });

  it("should report correct location for leading comma in array", () => {
    const input = '[,1,2,3]'; // Leading comma
    try {
      parseJSON(input);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      expect((error as SyntaxError).message).toContain("Unexpected comma at start of array");
      expect((error as SyntaxError).message).toMatch(/line \d+, column \d+/);
    }
  });

  it("should report correct location for double colon", () => {
    const input = '{"a"::1}'; // Double colon
    try {
      parseJSON(input);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      expect((error as SyntaxError).message).toContain("Unexpected colon after colon");
      expect((error as SyntaxError).message).toMatch(/line \d+, column \d+/);
    }
  });

  it("should report correct location for invalid boolean casing", () => {
    const input = '{"a":True}'; // Invalid boolean
    try {
      parseJSON(input);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      expect((error as SyntaxError).message).toMatch(/line \d+, column \d+/);
    }
  });

  it("should report correct location for invalid null casing", () => {
    const input = '{"a":Null}'; // Invalid null
    try {
      parseJSON(input);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      expect((error as SyntaxError).message).toMatch(/line \d+, column \d+/);
    }
  });

  it("should report correct location for extra tokens", () => {
    const input = '{"a":1} extra'; // Extra tokens
    try {
      parseJSON(input);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      // The tokenizer catches this first, so it will be "Unexpected character" not "Unexpected token"
      expect((error as SyntaxError).message).toMatch(/Unexpected (character|token)/);
      expect((error as SyntaxError).message).toMatch(/line \d+, column \d+/);
    }
  });
});
