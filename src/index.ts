import { Tokenizer } from "./tokenizer";
import { Parser } from "./parser";

export function parseJSON(input: string): any {
  const tokenizer = new Tokenizer(input);
  const tokens = tokenizer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}
