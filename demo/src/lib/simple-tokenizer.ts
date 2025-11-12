// Simple tokenizer for visualization purposes
// This mimics the tokenization process until the package is published

export enum TokenType {
  LEFT_BRACE = "LEFT_BRACE",
  RIGHT_BRACE = "RIGHT_BRACE",
  LEFT_BRACKET = "LEFT_BRACKET",
  RIGHT_BRACKET = "RIGHT_BRACKET",
  COLON = "COLON",
  COMMA = "COMMA",
  STRING = "STRING",
  NUMBER = "NUMBER",
  TRUE = "TRUE",
  FALSE = "FALSE",
  NULL = "NULL",
}

export interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number;
}

export function getLineColumn(input: string, position: number): { line: number; column: number } {
  let line = 1;
  let column = 1;
  
  for (let i = 0; i < position && i < input.length; i++) {
    if (input[i] === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  
  return { line, column };
}

export class SimpleTokenizer {
  private input: string;
  private position = 0;

  constructor(input: string) {
    this.input = input;
  }

  private peek(): string | undefined {
    return this.input[this.position];
  }

  private advance(): string {
    const char = this.peek();
    if (char === undefined) {
      throw new SyntaxError(`Unexpected end of input at position ${this.position}`);
    }
    this.position++;
    return char;
  }

  private skipWhitespace(): void {
    let char = this.peek();
    while (char !== undefined && /\s/.test(char)) {
      this.advance();
      char = this.peek();
    }
  }

  private isDigit(char: string | undefined): boolean {
    return !!char && /[0-9]/.test(char);
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];
    
    while (this.position < this.input.length) {
      const beforeSkip = this.position;
      this.skipWhitespace();
      
      if (this.position >= this.input.length) break;
      
      const char = this.peek();
      if (!char) break;

      const tokenStartPos = this.position;
      let token: Token | null = null;
      
      switch (char) {
        case "{": {
          const start = this.position;
          this.advance();
          token = { type: TokenType.LEFT_BRACE, value: "{", start, end: this.position };
          break;
        }
        case "}": {
          const start = this.position;
          this.advance();
          token = { type: TokenType.RIGHT_BRACE, value: "}", start, end: this.position };
          break;
        }
        case "[": {
          const start = this.position;
          this.advance();
          token = { type: TokenType.LEFT_BRACKET, value: "[", start, end: this.position };
          break;
        }
        case "]": {
          const start = this.position;
          this.advance();
          token = { type: TokenType.RIGHT_BRACKET, value: "]", start, end: this.position };
          break;
        }
        case ":": {
          const start = this.position;
          this.advance();
          token = { type: TokenType.COLON, value: ":", start, end: this.position };
          break;
        }
        case ",": {
          const start = this.position;
          this.advance();
          token = { type: TokenType.COMMA, value: ",", start, end: this.position };
          break;
        }
        case '"': {
          const start = this.position;
          const value = this.readString();
          token = { type: TokenType.STRING, value, start, end: this.position };
          break;
        }
        default:
          if (this.isDigit(char) || char === "-") {
            const start = this.position;
            const value = this.readNumber();
            token = { type: TokenType.NUMBER, value, start, end: this.position };
          } else if (this.input.startsWith("true", this.position)) {
            const start = this.position;
            this.position += 4;
            token = { type: TokenType.TRUE, value: "true", start, end: this.position };
          } else if (this.input.startsWith("false", this.position)) {
            const start = this.position;
            this.position += 5;
            token = { type: TokenType.FALSE, value: "false", start, end: this.position };
          } else if (this.input.startsWith("null", this.position)) {
            const start = this.position;
            this.position += 4;
            token = { type: TokenType.NULL, value: "null", start, end: this.position };
          } else {
            throw new SyntaxError(`Unexpected character '${char}' at position ${this.position}`);
          }
      }
      
      if (token) {
        tokens.push(token);
      }
      
      if (this.position === tokenStartPos && this.position < this.input.length) {
        throw new SyntaxError(`Failed to consume input at position ${this.position}`);
      }
    }

    return tokens;
  }

  private readString(): string {
    let str = "";
    this.advance(); // skip opening "
    const stringStart = this.position - 1;

    while (true) {
      const char = this.advance();

      if (char === '"') return str;

      if (char === "\\") {
        const next = this.advance();
        switch (next) {
          case '"': str += '"'; break;
          case "\\": str += "\\"; break;
          case "/": str += "/"; break;
          case "b": str += "\b"; break;
          case "f": str += "\f"; break;
          case "n": str += "\n"; break;
          case "r": str += "\r"; break;
          case "t": str += "\t"; break;
          case "u":
            const hex = this.input.slice(this.position, this.position + 4);
            if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
              throw new SyntaxError(`Invalid Unicode escape at position ${this.position - 2}`);
            }
            str += String.fromCharCode(parseInt(hex, 16));
            this.position += 4;
            break;
          default:
            throw new SyntaxError(`Invalid escape sequence \\${next} at position ${this.position - 1}`);
        }
      } else if (/[\u0000-\u001F]/.test(char)) {
        throw new SyntaxError(`Unescaped control character in string at position ${this.position - 1}`);
      } else {
        str += char;
      }

      if (this.position >= this.input.length) {
        throw new SyntaxError(`Unterminated string literal starting at position ${stringStart}`);
      }
    }
  }

  private readNumber(): string {
    const start = this.position;
    let char = this.peek();

    if (char === "-") this.advance();
    char = this.peek();

    if (char === "0") {
      this.advance();
      char = this.peek();
      if (this.isDigit(char)) {
        throw new SyntaxError(`Leading zeros not allowed at position ${this.position}`);
      }
    } else if (this.isDigit(char)) {
      while (this.isDigit(this.peek())) this.advance();
    } else {
      throw new SyntaxError(`Invalid number start at position ${this.position}`);
    }

    char = this.peek();
    if (char === ".") {
      this.advance();
      if (!this.isDigit(this.peek())) {
        throw new SyntaxError(`Missing digits after '.' at position ${this.position}`);
      }
      while (this.isDigit(this.peek())) this.advance();
    }

    char = this.peek();
    if (char && /[eE]/.test(char)) {
      this.advance();
      char = this.peek();
      if (char && /[\+\-]/.test(char)) this.advance();
      if (!this.isDigit(this.peek())) {
        throw new SyntaxError(`Invalid exponent at position ${this.position}`);
      }
      while (this.isDigit(this.peek())) this.advance();
    }

    return this.input.slice(start, this.position);
  }
}

