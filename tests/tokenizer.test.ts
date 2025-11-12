import { describe, it, expect } from "vitest";
import { Tokenizer, TokenType } from "../src/tokenizer";

describe("Tokenizer M1 Tests", () => {

  it("should tokenize an empty object", () => {
    const input = "{}";
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      { type: TokenType.LEFT_BRACE, value: "{", start: 0, end: 1 },
      { type: TokenType.RIGHT_BRACE, value: "}", start: 1, end: 2 }
    ]);
  });

  it("should tokenize a simple object", () => {
    const input = '{"name":"hrithik","age":23}';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      { type: TokenType.LEFT_BRACE, value: "{", start: 0, end: 1 },
      { type: TokenType.STRING, value: "name", start: 1, end: 7 },
      { type: TokenType.COLON, value: ":", start: 7, end: 8 },
      { type: TokenType.STRING, value: "hrithik", start: 8, end: 17 },
      { type: TokenType.COMMA, value: ",", start: 17, end: 18 },
      { type: TokenType.STRING, value: "age", start: 18, end: 23 },
      { type: TokenType.COLON, value: ":", start: 23, end: 24 },
      { type: TokenType.NUMBER, value: "23", start: 24, end: 26 },
      { type: TokenType.RIGHT_BRACE, value: "}", start: 26, end: 27 }
    ]);
  });

  it("should tokenize strings with escaped quotes", () => {
    const input = '{"quote":"He said \\"Hello\\""}';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      { type: TokenType.LEFT_BRACE, value: "{", start: 0, end: 1 },
      { type: TokenType.STRING, value: "quote", start: 1, end: 8 },
      { type: TokenType.COLON, value: ":", start: 8, end: 9 },
      { type: TokenType.STRING, value: 'He said "Hello"', start: 9, end: 28 },
      { type: TokenType.RIGHT_BRACE, value: "}", start: 28, end: 29 }
    ]);
  });

  it("should tokenize numbers including negatives and decimals", () => {
    const input = '{"num":-3.14,"exp":1e10}';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      { type: TokenType.LEFT_BRACE, value: "{", start: 0, end: 1 },
      { type: TokenType.STRING, value: "num", start: 1, end: 6 },
      { type: TokenType.COLON, value: ":", start: 6, end: 7 },
      { type: TokenType.NUMBER, value: "-3.14", start: 7, end: 12 },
      { type: TokenType.COMMA, value: ",", start: 12, end: 13 },
      { type: TokenType.STRING, value: "exp", start: 13, end: 18 },
      { type: TokenType.COLON, value: ":", start: 18, end: 19 },
      { type: TokenType.NUMBER, value: "1e10", start: 19, end: 23 },
      { type: TokenType.RIGHT_BRACE, value: "}", start: 23, end: 24 }
    ]);
  });

  it("should tokenize arrays", () => {
    const input = '[1, 2, 3]';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      { type: TokenType.LEFT_BRACKET, value: "[", start: 0, end: 1 },
      { type: TokenType.NUMBER, value: "1", start: 1, end: 2 },
      { type: TokenType.COMMA, value: ",", start: 2, end: 3 },
      { type: TokenType.NUMBER, value: "2", start: 4, end: 5 },
      { type: TokenType.COMMA, value: ",", start: 5, end: 6 },
      { type: TokenType.NUMBER, value: "3", start: 7, end: 8 },
      { type: TokenType.RIGHT_BRACKET, value: "]", start: 8, end: 9 }
    ]);
  });

  it("should tokenize booleans and null", () => {
    const input = '{"truth": true, "lie": false, "nothing": null}';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      { type: TokenType.LEFT_BRACE, value: "{", start: 0, end: 1 },
      { type: TokenType.STRING, value: "truth", start: 1, end: 8 },
      { type: TokenType.COLON, value: ":", start: 8, end: 9 },
      { type: TokenType.TRUE, value: "true", start: 10, end: 14 },
      { type: TokenType.COMMA, value: ",", start: 14, end: 15 },
      { type: TokenType.STRING, value: "lie", start: 16, end: 21 },
      { type: TokenType.COLON, value: ":", start: 21, end: 22 },
      { type: TokenType.FALSE, value: "false", start: 23, end: 28 },
      { type: TokenType.COMMA, value: ",", start: 28, end: 29 },
      { type: TokenType.STRING, value: "nothing", start: 30, end: 39 },
      { type: TokenType.COLON, value: ":", start: 39, end: 40 },
      { type: TokenType.NULL, value: "null", start: 41, end: 45 },
      { type: TokenType.RIGHT_BRACE, value: "}", start: 45, end: 46 }
    ]);
  });

  it("should throw error on invalid character", () => {
    const input = "{@}";
    const tokenizer = new Tokenizer(input);
    expect(() => tokenizer.tokenize()).toThrow(SyntaxError);
  });

});
