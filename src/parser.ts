import { Token, TokenType, formatError, getLineColumn } from "./tokenizer";

export class Parser {
  private tokens: Token[];
  private position = 0;
  private input: string; // Store original input for error messages

  constructor(tokens: Token[], input: string) {
    this.tokens = tokens;
    this.input = input;
  }

  /** Get position for error reporting */
  private getErrorPosition(): number {
    if (this.position < this.tokens.length) {
      return this.tokens[this.position].start;
    }
    // If at end, use the last token's end position
    if (this.tokens.length > 0) {
      return this.tokens[this.tokens.length - 1].end;
    }
    return 0;
  }

  /** Peek safely */
  private peek(): Token {
    const token = this.tokens[this.position];
    if (!token) {
      const pos = this.getErrorPosition();
      throw new SyntaxError(formatError("Unexpected end of JSON input", this.input, pos));
    }
    return token;
  }

  /** Advance and return current token */
  private advance(): Token {
    const token = this.peek();
    this.position++;
    return token;
  }

  /** Entry point: parse JSON and ensure no trailing tokens */
  public parse(): any {
    const value = this.parseValue();

    // must reach end of input
    if (this.position < this.tokens.length) {
      const next = this.tokens[this.position];
      const pos = next.start;
      throw new SyntaxError(
        formatError(`Unexpected token ${next.value ?? next.type} after JSON value`, this.input, pos)
      );
    }

    return value;
  }

  /** Parse any JSON value */
  private parseValue(): any {
    if (this.position >= this.tokens.length) {
      const pos = this.getErrorPosition();
      throw new SyntaxError(formatError("Unexpected end of JSON input", this.input, pos));
    }

    const token = this.peek();

    switch (token.type) {
      case TokenType.LEFT_BRACE:
        return this.parseObject();
      case TokenType.LEFT_BRACKET:
        return this.parseArray();
      case TokenType.STRING:
        return this.advance().value;
      case TokenType.NUMBER:
        return this.parseNumber(this.advance());
      case TokenType.TRUE:
        this.advance();
        return true;
      case TokenType.FALSE:
        this.advance();
        return false;
      case TokenType.NULL:
        this.advance();
        return null;
      // Explicitly reject structural tokens as values
      case TokenType.COLON:
      case TokenType.COMMA:
      case TokenType.RIGHT_BRACE:
      case TokenType.RIGHT_BRACKET:
        throw new SyntaxError(formatError(`Unexpected structural token ${token.type} where value expected`, this.input, token.start));
      default:
        throw new SyntaxError(formatError(`Unexpected token: ${token.type}`, this.input, token.start));
    }
  }

  /** Strict JSON number parsing */
  private parseNumber(token: Token): number {
    // must not allow leading zeros unless exactly "0"
    const numRegex = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/;
    if (!numRegex.test(token.value)) {
      throw new SyntaxError(formatError(`Invalid number: ${token.value}`, this.input, token.start));
    }

    const num = Number(token.value);
    if (!Number.isFinite(num)) {
      throw new SyntaxError(formatError(`Number out of range: ${token.value}`, this.input, token.start));
    }

    return num;
  }

  /** Parse JSON object `{ ... }` */
  private parseObject(): Record<string, any> {
    const obj: Record<string, any> = {};
    const openBrace = this.advance(); // skip '{'

    if (this.position >= this.tokens.length) {
      throw new SyntaxError(formatError("Unterminated object", this.input, openBrace.start));
    }

    // Check for leading comma
    if (this.peek().type === TokenType.COMMA) {
      const comma = this.peek();
      throw new SyntaxError(formatError("Unexpected comma at start of object", this.input, comma.start));
    }

    if (this.peek().type === TokenType.RIGHT_BRACE) {
      this.advance();
      return obj;
    }

    while (true) {
      const keyToken = this.peek();
      if (keyToken.type !== TokenType.STRING) {
        throw new SyntaxError(formatError(`Expected string for key, got ${keyToken.type}`, this.input, keyToken.start));
      }

      const key = this.advance().value;

      if (this.position >= this.tokens.length) {
        throw new SyntaxError(formatError("Unterminated object after key", this.input, keyToken.end));
      }

      const colon = this.peek();
      if (colon.type !== TokenType.COLON) {
        throw new SyntaxError(formatError("Expected ':' after key", this.input, colon.start));
      }
      this.advance(); // skip ':'

      // Check for double colon
      if (this.position < this.tokens.length && this.peek().type === TokenType.COLON) {
        const nextColon = this.peek();
        throw new SyntaxError(formatError("Unexpected colon after colon", this.input, nextColon.start));
      }

      const value = this.parseValue();
      obj[key] = value;

      if (this.position >= this.tokens.length) {
        throw new SyntaxError(formatError("Unterminated object", this.input, openBrace.start));
      }

      const next = this.peek();
      if (next.type === TokenType.COMMA) {
        this.advance();
        if (this.position >= this.tokens.length) {
          throw new SyntaxError(formatError("Trailing comma in object", this.input, next.end));
        }
        const afterComma = this.peek();
        // Check for double comma
        if (afterComma.type === TokenType.COMMA) {
          throw new SyntaxError(formatError("Unexpected comma after comma", this.input, afterComma.start));
        }
        if (afterComma.type === TokenType.RIGHT_BRACE) {
          throw new SyntaxError(formatError("Trailing comma in object is not allowed", this.input, afterComma.start));
        }
      } else if (next.type === TokenType.RIGHT_BRACE) {
        this.advance();
        break;
      } else {
        // This catches extra values, missing commas, etc.
        throw new SyntaxError(formatError(`Expected ',' or '}', got ${next.type}`, this.input, next.start));
      }
    }

    return obj;
  }

  /** Parse JSON array `[ ... ]` */
  private parseArray(): any[] {
    const arr: any[] = [];
    const openBracket = this.advance(); // skip '['

    if (this.position >= this.tokens.length) {
      throw new SyntaxError(formatError("Unterminated array", this.input, openBracket.start));
    }

    // Check for leading comma
    if (this.peek().type === TokenType.COMMA) {
      const comma = this.peek();
      throw new SyntaxError(formatError("Unexpected comma at start of array", this.input, comma.start));
    }

    if (this.peek().type === TokenType.RIGHT_BRACKET) {
      this.advance();
      return arr;
    }

    while (true) {
      arr.push(this.parseValue());

      if (this.position >= this.tokens.length) {
        throw new SyntaxError(formatError("Unterminated array", this.input, openBracket.start));
      }

      const next = this.peek();
      if (next.type === TokenType.COMMA) {
        this.advance();
        if (this.position >= this.tokens.length) {
          throw new SyntaxError(formatError("Trailing comma in array", this.input, next.end));
        }
        const afterComma = this.peek();
        // Check for double comma
        if (afterComma.type === TokenType.COMMA) {
          throw new SyntaxError(formatError("Unexpected comma after comma", this.input, afterComma.start));
        }
        if (afterComma.type === TokenType.RIGHT_BRACKET) {
          throw new SyntaxError(formatError("Trailing comma in array is not allowed", this.input, afterComma.start));
        }
      } else if (next.type === TokenType.RIGHT_BRACKET) {
        this.advance();
        break;
      } else {
        throw new SyntaxError(formatError(`Expected ',' or ']', got ${next.type}`, this.input, next.start));
      }
    }

    return arr;
  }
}
