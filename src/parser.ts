import { Token, TokenType } from "./tokenizer";

export class Parser {
  private tokens: Token[];
  private position = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.position];
  }

  private advance(): Token {
    return this.tokens[this.position++];
  }

  public parse(): any {
    return this.parseValue();
  }

  private parseValue(): any {
    const token = this.peek();
    switch (token.type) {
      case TokenType.LEFT_BRACE:
        return this.parseObject();
      case TokenType.LEFT_BRACKET:
        return this.parseArray();
      case TokenType.STRING:
        return this.advance().value;
      case TokenType.NUMBER:
        return parseFloat(this.advance().value);
      case TokenType.TRUE:
        this.advance();
        return true;
      case TokenType.FALSE:
        this.advance();
        return false;
      case TokenType.NULL:
        this.advance();
        return null;
      default:
        throw new SyntaxError(`Unexpected token: ${token.type}`);
    }
  }

  private parseObject(): Record<string, any> {
    const obj: Record<string, any> = {};
    this.advance(); // skip '{'
  
    if (this.peek().type === TokenType.RIGHT_BRACE) {
      this.advance(); // empty object
      return obj;
    }
  
    while (true) {
      const keyToken = this.advance();
      if (keyToken.type !== TokenType.STRING) {
        throw new SyntaxError(`Expected string key, got ${keyToken.type}`);
      }
  
      const colon = this.advance();
      if (colon.type !== TokenType.COLON) {
        throw new SyntaxError(`Expected colon after key`);
      }
  
      obj[keyToken.value] = this.parseValue();
  
      const next = this.peek();
      if (next.type === TokenType.COMMA) {
        this.advance();
        // Throw error if comma is last before closing brace
        if (this.peek().type === TokenType.RIGHT_BRACE) {
          throw new SyntaxError("Trailing comma is not allowed");
        }
      } else if (next.type === TokenType.RIGHT_BRACE) {
        this.advance();
        break;
      } else {
        throw new SyntaxError(`Expected ',' or '}', got ${next.type}`);
      }
    }
  
    return obj;
  }
  

  private parseArray(): any[] {
    const arr: any[] = [];
    this.advance(); // skip '['
  
    if (this.peek().type === TokenType.RIGHT_BRACKET) {
      this.advance(); // empty array
      return arr;
    }
  
    while (true) {
      arr.push(this.parseValue());
  
      const next = this.peek();
      if (next.type === TokenType.COMMA) {
        this.advance();
        // Throw error if comma is last before closing bracket
        if (this.peek().type === TokenType.RIGHT_BRACKET) {
          throw new SyntaxError("Trailing comma is not allowed");
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
