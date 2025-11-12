import { Token, TokenType } from "./tokenizer";

export class Parser {
  private tokens: Token[];
  private position = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  /** Peek safely */
  private peek(): Token {
    const token = this.tokens[this.position];
    if (!token) throw new SyntaxError("Unexpected end of JSON input");
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
      throw new SyntaxError(
        `Unexpected token ${next.value ?? next.type} after JSON value`
      );
    }

    return value;
  }

  /** Parse any JSON value */
  private parseValue(): any {
    if (this.position >= this.tokens.length) {
      throw new SyntaxError("Unexpected end of JSON input");
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
        throw new SyntaxError(`Unexpected structural token ${token.type} where value expected`);
      default:
        throw new SyntaxError(`Unexpected token: ${token.type}`);
    }
  }

  /** Strict JSON number parsing */
  private parseNumber(token: Token): number {
    // must not allow leading zeros unless exactly "0"
    const numRegex = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/;
    if (!numRegex.test(token.value)) {
      throw new SyntaxError(`Invalid number: ${token.value}`);
    }

    const num = Number(token.value);
    if (!Number.isFinite(num)) {
      throw new SyntaxError(`Number out of range: ${token.value}`);
    }

    return num;
  }

  /** Parse JSON object `{ ... }` */
  private parseObject(): Record<string, any> {
    const obj: Record<string, any> = {};
    this.advance(); // skip '{'

    if (this.position >= this.tokens.length) {
      throw new SyntaxError("Unterminated object");
    }

    // Check for leading comma
    if (this.peek().type === TokenType.COMMA) {
      throw new SyntaxError("Unexpected comma at start of object");
    }

    if (this.peek().type === TokenType.RIGHT_BRACE) {
      this.advance();
      return obj;
    }

    while (true) {
      const keyToken = this.peek();
      if (keyToken.type !== TokenType.STRING) {
        throw new SyntaxError(`Expected string for key, got ${keyToken.type}`);
      }

      const key = this.advance().value;

      if (this.position >= this.tokens.length) {
        throw new SyntaxError("Unterminated object after key");
      }

      const colon = this.peek();
      if (colon.type !== TokenType.COLON) {
        throw new SyntaxError("Expected ':' after key");
      }
      this.advance(); // skip ':'

      // Check for double colon
      if (this.position < this.tokens.length && this.peek().type === TokenType.COLON) {
        throw new SyntaxError("Unexpected colon after colon");
      }

      const value = this.parseValue();
      obj[key] = value;

      if (this.position >= this.tokens.length) {
        throw new SyntaxError("Unterminated object");
      }

      const next = this.peek();
      if (next.type === TokenType.COMMA) {
        this.advance();
        if (this.position >= this.tokens.length) {
          throw new SyntaxError("Trailing comma in object");
        }
        const afterComma = this.peek();
        // Check for double comma
        if (afterComma.type === TokenType.COMMA) {
          throw new SyntaxError("Unexpected comma after comma");
        }
        if (afterComma.type === TokenType.RIGHT_BRACE) {
          throw new SyntaxError("Trailing comma in object is not allowed");
        }
      } else if (next.type === TokenType.RIGHT_BRACE) {
        this.advance();
        break;
      } else {
        // This catches extra values, missing commas, etc.
        throw new SyntaxError(`Expected ',' or '}', got ${next.type}`);
      }
    }

    return obj;
  }

  /** Parse JSON array `[ ... ]` */
  private parseArray(): any[] {
    const arr: any[] = [];
    this.advance(); // skip '['

    if (this.position >= this.tokens.length) {
      throw new SyntaxError("Unterminated array");
    }

    // Check for leading comma
    if (this.peek().type === TokenType.COMMA) {
      throw new SyntaxError("Unexpected comma at start of array");
    }

    if (this.peek().type === TokenType.RIGHT_BRACKET) {
      this.advance();
      return arr;
    }

    while (true) {
      arr.push(this.parseValue());

      if (this.position >= this.tokens.length) {
        throw new SyntaxError("Unterminated array");
      }

      const next = this.peek();
      if (next.type === TokenType.COMMA) {
        this.advance();
        if (this.position >= this.tokens.length) {
          throw new SyntaxError("Trailing comma in array");
        }
        const afterComma = this.peek();
        // Check for double comma
        if (afterComma.type === TokenType.COMMA) {
          throw new SyntaxError("Unexpected comma after comma");
        }
        if (afterComma.type === TokenType.RIGHT_BRACKET) {
          throw new SyntaxError("Trailing comma in array is not allowed");
        }
      } else if (next.type === TokenType.RIGHT_BRACKET) {
        this.advance();
        break;
      } else {
        throw new SyntaxError(`Expected ',' or ']', got ${next.type}`);
      }
    }

    return arr;
  }
}
