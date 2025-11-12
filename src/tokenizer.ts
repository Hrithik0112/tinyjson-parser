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
    NULL = "NULL"
  }
  
  export interface Token {
    type: TokenType;
    value: string;
  }
  
  export class Tokenizer {
    private input: string;
    private position = 0;
  
    constructor(input: string) {
      this.input = input;
    }
  
    private peek(): string {
      return this.input[this.position];
    }
  
    private advance(): string {
      return this.input[this.position++];
    }
  
    private isDigit(char: string): boolean {
      return /[0-9]/.test(char);
    }
  
    private skipWhitespace() {
      while (/\s/.test(this.peek())) {
        this.advance();
      }
    }
  
    public tokenize(): Token[] {
      const tokens: Token[] = [];
  
      while (this.position < this.input.length) {
        this.skipWhitespace();
        const char = this.peek();
  
        switch (char) {
          case "{":
            tokens.push({ type: TokenType.LEFT_BRACE, value: this.advance() });
            break;
          case "}":
            tokens.push({ type: TokenType.RIGHT_BRACE, value: this.advance() });
            break;
          case "[":
            tokens.push({ type: TokenType.LEFT_BRACKET, value: this.advance() });
            break;
          case "]":
            tokens.push({ type: TokenType.RIGHT_BRACKET, value: this.advance() });
            break;
          case ":":
            tokens.push({ type: TokenType.COLON, value: this.advance() });
            break;
          case ",":
            tokens.push({ type: TokenType.COMMA, value: this.advance() });
            break;
          case '"':
            tokens.push({ type: TokenType.STRING, value: this.readString() });
            break;
          default:
            if (this.isDigit(char) || char === "-") {
              tokens.push({ type: TokenType.NUMBER, value: this.readNumber() });
            } else if (this.input.startsWith("true", this.position)) {
              this.position += 4;
              tokens.push({ type: TokenType.TRUE, value: "true" });
            } else if (this.input.startsWith("false", this.position)) {
              this.position += 5;
              tokens.push({ type: TokenType.FALSE, value: "false" });
            } else if (this.input.startsWith("null", this.position)) {
              this.position += 4;
              tokens.push({ type: TokenType.NULL, value: "null" });
            } else {
              throw new SyntaxError(`Unexpected character: ${char}`);
            }
        }
      }
  
      return tokens;
    }
  
    private readString(): string {
      let str = "";
      this.advance(); // skip initial "
      while (this.position < this.input.length) {
        const char = this.advance();
        if (char === '"') break;
        if (char === "\\") {
          const next = this.advance();
          if (next === '"') str += '"';
          else if (next === "\\") str += "\\";
          else if (next === "n") str += "\n";
          else if (next === "t") str += "\t";
          else str += next;
        } else {
          str += char;
        }
      }
      return str;
    }
  
    private readNumber(): string {
      let num = "";
      while (this.position < this.input.length && /[0-9eE\.\-+]/.test(this.peek())) {
        num += this.advance();
      }
      return num;
    }
  }
  
  