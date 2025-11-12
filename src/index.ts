import { Tokenizer } from "./tokenizer";
import { Parser } from "./parser";

/**
 * Tiny strict JSON parser entrypoint
 * @param input - JSON string
 * @returns Parsed JS value
 */
export function parseJSON(input: string): any {
  if (typeof input !== "string") {
    throw new SyntaxError("Input must be a string");
  }

  const trimmed = input.trim();
  if (trimmed === "") {
    throw new SyntaxError("Unexpected end of JSON input at line 1, column 1");
  }

  const tokens = new Tokenizer(trimmed).tokenize();
  const parser = new Parser(tokens, trimmed);
  return parser.parse();
}

// Export streaming parser
export { StreamingParser, parseJSONStream } from "./streaming-parser";
