import { Tokenizer } from "./tokenizer";
import { Parser } from "./parser";

/**
 * Parse a JSON string into a JavaScript object.
 * @param input JSON string
 */
export function parseJSON(input: string): any {
  const tokenizer = new Tokenizer(input);
  const tokens = tokenizer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}

