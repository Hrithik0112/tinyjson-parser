import { describe, it, expect } from "vitest";
import { parseJSON } from "../src/index";

describe("Parser M2 Tests", () => {

  it("should parse an empty object", () => {
    const input = '{}';
    expect(parseJSON(input)).toEqual({});
  });

  it("should parse a simple object", () => {
    const input = '{"a":1}';
    expect(parseJSON(input)).toEqual({ a: 1 });
  });

  it("should parse multiple key-value pairs", () => {
    const input = '{"a":1,"b":2}';
    expect(parseJSON(input)).toEqual({ a: 1, b: 2 });
  });

  it("should parse nested objects", () => {
    const input = '{"a":{"b":2}}';
    expect(parseJSON(input)).toEqual({ a: { b: 2 } });
  });

  it("should parse arrays", () => {
    const input = '[1,2,3]';
    expect(parseJSON(input)).toEqual([1, 2, 3]);
  });

  it("should parse nested arrays", () => {
    const input = '[1,[2,3],4]';
    expect(parseJSON(input)).toEqual([1, [2, 3], 4]);
  });

  it("should parse mixed arrays and objects", () => {
    const input = '[{"x":1},2,null]';
    expect(parseJSON(input)).toEqual([{ x: 1 }, 2, null]);
  });

  it("should parse strings with escaped quotes", () => {
    const input = '{"quote":"He said \\"Hello\\""}';
    expect(parseJSON(input)).toEqual({ quote: 'He said "Hello"' });
  });

  it("should parse numbers including negatives, decimals, and exponentials", () => {
    const input = '{"n1":-5,"n2":3.14,"n3":1e3}';
    expect(parseJSON(input)).toEqual({ n1: -5, n2: 3.14, n3: 1000 });
  });

  it("should parse booleans and null", () => {
    const input = '{"t":true,"f":false,"n":null}';
    expect(parseJSON(input)).toEqual({ t: true, f: false, n: null });
  });

  it("should throw on invalid JSON", () => {
    const input = '{"a":1,}'; // trailing comma not allowed
    expect(() => parseJSON(input)).toThrow(SyntaxError);
  });

  it("should parse whitespace correctly", () => {
    const input = `{
      "a" : 1 ,
      "b" : [ 2 , 3 ]
    }`;
    expect(parseJSON(input)).toEqual({ a: 1, b: [2, 3] });
  });

});
