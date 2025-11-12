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
  }
  
  export class Tokenizer {
    private input: string;
    private position = 0;
  
    constructor(input: string) {
      this.input = input;
    }
  
    /** Safely peek next char, return undefined at end */
    private peek(): string | undefined {
      return this.input[this.position];
    }
  
    /** Advance pointer and return char, throw only if really needed */
    private advance(): string {
      const char = this.peek();
      if (char === undefined) throw new SyntaxError("Unexpected end of input");
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
        
        // If we've consumed all input (only whitespace remains), break
        if (this.position >= this.input.length) break;
        
        const char = this.peek();
        if (!char) break;

        const tokenStartPos = this.position; // Track position after whitespace skip
        
        switch (char) {
          case "{": tokens.push({ type: TokenType.LEFT_BRACE, value: this.advance() }); break;
          case "}": tokens.push({ type: TokenType.RIGHT_BRACE, value: this.advance() }); break;
          case "[": tokens.push({ type: TokenType.LEFT_BRACKET, value: this.advance() }); break;
          case "]": tokens.push({ type: TokenType.RIGHT_BRACKET, value: this.advance() }); break;
          case ":": tokens.push({ type: TokenType.COLON, value: this.advance() }); break;
          case ",": tokens.push({ type: TokenType.COMMA, value: this.advance() }); break;
          case '"': tokens.push({ type: TokenType.STRING, value: this.readString() }); break;
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
              throw new SyntaxError(`Unexpected character '${char}' at position ${this.position}`);
            }
        }
        
        // Ensure we made progress (prevent infinite loops)
        if (this.position === tokenStartPos && this.position < this.input.length) {
          throw new SyntaxError(`Failed to consume input at position ${this.position}`);
        }
      }

      // After loop, ensure we consumed everything (allowing only trailing whitespace)
      const remaining = this.input.slice(this.position);
      if (remaining.trim().length > 0) {
        throw new SyntaxError(`Unexpected token at position ${this.position}: "${remaining.substring(0, 10)}"`);
      }
  
      return tokens;
    }
  
    private readString(): string {
      let str = "";
      this.advance(); // skip opening "
  
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
          throw new SyntaxError("Unterminated string literal");
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
        if (this.isDigit(char)) throw new SyntaxError(`Leading zeros not allowed at position ${this.position}`);
      } else if (this.isDigit(char)) {
        while (this.isDigit(this.peek())) this.advance();
      } else {
        throw new SyntaxError(`Invalid number start at position ${this.position}`);
      }
  
      char = this.peek();
      if (char === ".") {
        this.advance();
        if (!this.isDigit(this.peek())) throw new SyntaxError(`Missing digits after '.' at ${this.position}`);
        while (this.isDigit(this.peek())) this.advance();
      }
  
      char = this.peek();
      if (char && /[eE]/.test(char)) {
        this.advance();
        char = this.peek();
        if (char && /[\+\-]/.test(char)) this.advance();
        if (!this.isDigit(this.peek())) throw new SyntaxError(`Invalid exponent at ${this.position}`);
        while (this.isDigit(this.peek())) this.advance();
      }
  
      return this.input.slice(start, this.position);
    }
  }
  