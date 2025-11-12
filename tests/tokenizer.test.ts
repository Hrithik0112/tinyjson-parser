import { describe, it, expect } from "vitest";
import { Tokenizer, TokenType } from "../src/tokenizer";

describe("Tokenizer M1 Tests", () => {

  it("should tokenize an empty object", () => {
    const input = "{}";
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      { type: TokenType.LEFT_BRACE, value: "{" },
      { type: TokenType.RIGHT_BRACE, value: "}" }
    ]);
  });

  it("should tokenize a simple object", () => {
    const input = '{"name":"hrithik","age":23}';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      { type: TokenType.LEFT_BRACE, value: "{" },
      { type: TokenType.STRING, value: "name" },
      { type: TokenType.COLON, value: ":" },
      { type: TokenType.STRING, value: "hrithik" },
      { type: TokenType.COMMA, value: "," },
      { type: TokenType.STRING, value: "age" },
      { type: TokenType.COLON, value: ":" },
      { type: TokenType.NUMBER, value: "23" },
      { type: TokenType.RIGHT_BRACE, value: "}" }
    ]);
  });

  it("should tokenize strings with escaped quotes", () => {
    const input = '{"quote":"He said \\"Hello\\""}';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      { type: TokenType.LEFT_BRACE, value: "{" },
      { type: TokenType.STRING, value: "quote" },
      { type: TokenType.COLON, value: ":" },
      { type: TokenType.STRING, value: 'He said "Hello"' },
      { type: TokenType.RIGHT_BRACE, value: "}" }
    ]);
  });

  it("should tokenize numbers including negatives and decimals", () => {
    const input = '{"num": -3.14, "exp": 1e10}';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      { type: TokenType.LEFT_BRACE, value: "{" },
      { type: TokenType.STRING, value: "num" },
      { type: TokenType.COLON, value: ":" },
      { type: TokenType.NUMBER, value: "-3.14" },
      { type: TokenType.COMMA, value: "," },
      { type: TokenType.STRING, value: "exp" },
      { type: TokenType.COLON, value: ":" },
      { type: TokenType.NUMBER, value: "1e10" },
      { type: TokenType.RIGHT_BRACE, value: "}" }
    ]);
  });

  it("should tokenize arrays", () => {
    const input = '[1, 2, 3]';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      { type: TokenType.LEFT_BRACKET, value: "[" },
      { type: TokenType.NUMBER, value: "1" },
      { type: TokenType.COMMA, value: "," },
      { type: TokenType.NUMBER, value: "2" },
      { type: TokenType.COMMA, value: "," },
      { type: TokenType.NUMBER, value: "3" },
      { type: TokenType.RIGHT_BRACKET, value: "]" }
    ]);
  });

  it("should tokenize booleans and null", () => {
    const input = '{"truth": true, "lie": false, "nothing": null}';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    expect(tokens).toEqual([
      { type: TokenType.LEFT_BRACE, value: "{" },
      { type: TokenType.STRING, value: "truth" },
      { type: TokenType.COLON, value: ":" },
      { type: TokenType.TRUE, value: "true" },
      { type: TokenType.COMMA, value: "," },
      { type: TokenType.STRING, value: "lie" },
      { type: TokenType.COLON, value: ":" },
      { type: TokenType.FALSE, value: "false" },
      { type: TokenType.COMMA, value: "," },
      { type: TokenType.STRING, value: "nothing" },
      { type: TokenType.COLON, value: ":" },
      { type: TokenType.NULL, value: "null" },
      { type: TokenType.RIGHT_BRACE, value: "}" }
    ]);
  });

  it("should throw error on invalid character", () => {
    const input = "{@}";
    const tokenizer = new Tokenizer(input);
    expect(() => tokenizer.tokenize()).toThrow(SyntaxError);
  });

});
