import { describe, it, expect } from "vitest";
import { StreamingParser, parseJSONStream } from "../src/index";
import { parseJSON } from "../src/index";

describe("Streaming Parser Tests", () => {
  
  describe("Basic Streaming", () => {
    it("should parse simple JSON in one chunk", () => {
      const parser = new StreamingParser();
      parser.write('{"name":"John","age":30}');
      const result = parser.end();
      expect(result).toEqual({ name: "John", age: 30 });
    });

    it("should parse simple JSON in multiple chunks", () => {
      const parser = new StreamingParser();
      parser.write('{"name"');
      parser.write(':"John",');
      parser.write('"age":30}');
      const result = parser.end();
      expect(result).toEqual({ name: "John", age: 30 });
    });

    it("should parse arrays in chunks", () => {
      const parser = new StreamingParser();
      parser.write('[1,');
      parser.write('2,');
      parser.write('3]');
      const result = parser.end();
      expect(result).toEqual([1, 2, 3]);
    });

    it("should parse nested objects in chunks", () => {
      const parser = new StreamingParser();
      parser.write('{"user":{');
      parser.write('"name":"John",');
      parser.write('"age":30}}');
      const result = parser.end();
      expect(result).toEqual({ user: { name: "John", age: 30 } });
    });
  });

  describe("String Handling Across Chunks", () => {
    it("should handle strings that span chunks", () => {
      const parser = new StreamingParser();
      parser.write('{"message":"Hello ');
      parser.write('World"}');
      const result = parser.end();
      expect(result).toEqual({ message: "Hello World" });
    });

    it("should handle long strings across multiple chunks", () => {
      const parser = new StreamingParser();
      const longString = "a".repeat(1000);
      parser.write(`{"data":"${longString.substring(0, 500)}`);
      parser.write(`${longString.substring(500)}"}`);
      const result = parser.end();
      expect(result).toEqual({ data: longString });
    });

    it("should handle escaped quotes across chunks", () => {
      const parser = new StreamingParser();
      parser.write('{"quote":"He said \\"');
      parser.write('Hello\\""}');
      const result = parser.end();
      expect(result).toEqual({ quote: 'He said "Hello"' });
    });

    it("should handle unicode escapes across chunks", () => {
      const parser = new StreamingParser();
      parser.write('{"unicode":"\\u00');
      parser.write('41"}'); // \u0041 = 'A'
      const result = parser.end();
      expect(result).toEqual({ unicode: "A" });
    });
  });

  describe("Number Handling Across Chunks", () => {
    it("should handle numbers that span chunks", () => {
      const parser = new StreamingParser();
      parser.write('{"value":12');
      parser.write('34}');
      const result = parser.end();
      expect(result).toEqual({ value: 1234 });
    });

    it("should handle decimal numbers across chunks", () => {
      const parser = new StreamingParser();
      parser.write('{"pi":3.');
      parser.write('14159}');
      const result = parser.end();
      expect(result).toEqual({ pi: 3.14159 });
    });

    it("should handle negative numbers across chunks", () => {
      const parser = new StreamingParser();
      parser.write('{"temp":-');
      parser.write('10}');
      const result = parser.end();
      expect(result).toEqual({ temp: -10 });
    });

    it("should handle exponential notation across chunks", () => {
      const parser = new StreamingParser();
      parser.write('{"large":1e');
      parser.write('10}');
      const result = parser.end();
      expect(result).toEqual({ large: 1e10 });
    });
  });

  describe("Complex Structures", () => {
    it("should parse large nested structures", () => {
      const parser = new StreamingParser();
      const json = JSON.stringify({
        users: Array.from({ length: 10 }, (_, i) => ({
          id: i,
          name: `User${i}`,
          data: { score: i * 10 }
        }))
      });
      
      // Split into chunks
      const chunkSize = Math.ceil(json.length / 5);
      for (let i = 0; i < json.length; i += chunkSize) {
        parser.write(json.slice(i, i + chunkSize));
      }
      
      const result = parser.end();
      expect(result).toEqual(JSON.parse(json));
    });

    it("should parse arrays with mixed types across chunks", () => {
      const parser = new StreamingParser();
      parser.write('[1,"two",');
      parser.write('true,false,');
      parser.write('null,{"key":"value"}]');
      const result = parser.end();
      expect(result).toEqual([1, "two", true, false, null, { key: "value" }]);
    });

    it("should handle whitespace across chunks", () => {
      const parser = new StreamingParser();
      parser.write('{ "a" ');
      parser.write(': 1 , ');
      parser.write('"b" : 2 }');
      const result = parser.end();
      expect(result).toEqual({ a: 1, b: 2 });
    });
  });

  describe("parseJSONStream convenience function", () => {
    it("should parse JSON from array of chunks", () => {
      const chunks = ['{"name":', '"John",', '"age":30}'];
      const result = parseJSONStream(chunks);
      expect(result).toEqual({ name: "John", age: 30 });
    });

    it("should handle empty chunks array", () => {
      expect(() => parseJSONStream([])).toThrow(SyntaxError);
    });

    it("should handle single chunk", () => {
      const result = parseJSONStream(['{"a":1}']);
      expect(result).toEqual({ a: 1 });
    });
  });

  describe("Error Handling", () => {
    it("should throw error on invalid JSON", () => {
      const parser = new StreamingParser();
      parser.write('{"a":1x}'); // Invalid character
      expect(() => parser.end()).toThrow(SyntaxError);
    });

    it("should throw error on incomplete JSON", () => {
      const parser = new StreamingParser();
      parser.write('{"a":1'); // Missing closing brace
      expect(() => parser.end()).toThrow(SyntaxError);
    });

    it("should throw error when writing to completed parser", () => {
      const parser = new StreamingParser();
      parser.write('{"a":1}');
      parser.end();
      expect(() => parser.write('more')).toThrow(SyntaxError);
    });

    it("should throw error on invalid chunk type", () => {
      const parser = new StreamingParser();
      expect(() => parser.write(123 as any)).toThrow(SyntaxError);
    });

    it("should throw error on trailing content", () => {
      const parser = new StreamingParser();
      parser.write('{"a":1} extra');
      expect(() => parser.end()).toThrow(SyntaxError);
    });

    it("should throw error on missing colon", () => {
      const parser = new StreamingParser();
      parser.write('{"a" 1}');
      expect(() => parser.end()).toThrow(SyntaxError);
    });

    it("should throw error on trailing comma", () => {
      const parser = new StreamingParser();
      parser.write('{"a":1,}');
      expect(() => parser.end()).toThrow(SyntaxError);
    });
  });

  describe("Comparison with Regular Parser", () => {
    it("should produce same result as regular parser for simple JSON", () => {
      const json = '{"name":"John","age":30}';
      const regular = parseJSON(json);
      
      const parser = new StreamingParser();
      parser.write(json);
      const streaming = parser.end();
      
      expect(streaming).toEqual(regular);
    });

    it("should produce same result as regular parser for complex JSON", () => {
      const json = JSON.stringify({
        users: [
          { id: 1, name: "Alice", active: true },
          { id: 2, name: "Bob", active: false }
        ],
        metadata: {
          count: 2,
          timestamp: 1234567890
        }
      });
      
      const regular = parseJSON(json);
      
      const parser = new StreamingParser();
      // Split into random chunks
      const chunks = [];
      let pos = 0;
      while (pos < json.length) {
        const chunkSize = Math.floor(Math.random() * 10) + 1;
        chunks.push(json.slice(pos, pos + chunkSize));
        pos += chunkSize;
      }
      
      for (const chunk of chunks) {
        parser.write(chunk);
      }
      const streaming = parser.end();
      
      expect(streaming).toEqual(regular);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty object", () => {
      const parser = new StreamingParser();
      parser.write('{}');
      const result = parser.end();
      expect(result).toEqual({});
    });

    it("should handle empty array", () => {
      const parser = new StreamingParser();
      parser.write('[]');
      const result = parser.end();
      expect(result).toEqual([]);
    });

    it("should handle single character chunks", () => {
      const parser = new StreamingParser();
      const json = '{"a":1}';
      for (const char of json) {
        parser.write(char);
      }
      const result = parser.end();
      expect(result).toEqual({ a: 1 });
    });

    it("should handle very large numbers across chunks", () => {
      const parser = new StreamingParser();
      parser.write('{"big":12345678901234567890');
      parser.write('1234567890}');
      const result = parser.end();
      expect(result.big).toBeGreaterThan(0);
    });

    it("should handle boolean values across chunks", () => {
      const parser = new StreamingParser();
      parser.write('{"flag":tru');
      parser.write('e}');
      const result = parser.end();
      expect(result).toEqual({ flag: true });
    });

    it("should handle null values across chunks", () => {
      const parser = new StreamingParser();
      parser.write('{"value":nul');
      parser.write('l}');
      const result = parser.end();
      expect(result).toEqual({ value: null });
    });
  });

  describe("needsMoreData", () => {
    it("should return true when buffer has incomplete data", () => {
      const parser = new StreamingParser();
      parser.write('{"a":');
      expect(parser.needsMoreData()).toBe(true);
    });

    it("should return false when parser is complete", () => {
      const parser = new StreamingParser();
      parser.write('{"a":1}');
      parser.end();
      expect(parser.needsMoreData()).toBe(false);
    });

    it("should return false when buffer is empty", () => {
      const parser = new StreamingParser();
      parser.write('{"a":1}');
      // After processing, buffer should be empty
      expect(parser.needsMoreData()).toBe(false);
    });
  });

  describe("Multiple end() calls", () => {
    it("should return same result on multiple end() calls", () => {
      const parser = new StreamingParser();
      parser.write('{"a":1}');
      const result1 = parser.end();
      const result2 = parser.end();
      expect(result1).toEqual(result2);
    });
  });
});
