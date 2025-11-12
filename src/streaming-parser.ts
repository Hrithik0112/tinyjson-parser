import { Token, TokenType, formatError } from "./tokenizer";
import { Parser } from "./parser";

/**
 * Streaming JSON parser for large JSON files
 * Accepts data in chunks and parses incrementally
 */
export class StreamingParser {
  private buffer: string = "";
  private tokens: Token[] = [];
  private parser: Parser | null = null;
  private isComplete: boolean = false;
  private fullInput: string = ""; // Track full input for error reporting
  private inString: boolean = false; // Track if we're in the middle of a string
  private inNumber: boolean = false; // Track if we're in the middle of a number
  private partialString: string = ""; // Accumulated string value across chunks
  private partialNumber: string = ""; // Accumulated number value across chunks
  private cachedResult: any = undefined; // Cache result for multiple end() calls
  private pendingError: SyntaxError | null = null; // Store errors to throw during end()
  private inUnicodeEscape: boolean = false; // Track if we're in the middle of \uXXXX
  private unicodeEscapeBuffer: string = ""; // Buffer for unicode hex digits

  /**
   * Write a chunk of JSON data
   * @param chunk - Partial JSON string
   */
  public write(chunk: string): void {
    if (this.isComplete) {
      throw new SyntaxError("Cannot write to completed parser");
    }

    if (typeof chunk !== "string") {
      throw new SyntaxError("Chunk must be a string");
    }

    this.fullInput += chunk;
    this.buffer += chunk;
    this.processBuffer();
  }

  /**
   * Signal that all data has been written
   * @returns The parsed JSON value
   */
  public end(): any {
    if (this.isComplete) {
      if (this.cachedResult !== undefined) {
        return this.cachedResult;
      }
      if (this.parser) {
        return this.parser.parse();
      }
      throw new SyntaxError("Parser was completed but no value was parsed");
    }

    this.isComplete = true;
    
    // Throw any pending errors
    if (this.pendingError) {
      throw this.pendingError;
    }
    
    // Process any remaining buffer
    this.processBuffer(true);

    // Check for trailing content
    const trimmed = this.buffer.trim();
    if (trimmed.length > 0) {
      const pos = this.fullInput.length - trimmed.length;
      throw new SyntaxError(
        formatError("Unexpected token after JSON value", this.fullInput, pos)
      );
    }

    if (!this.parser) {
      throw new SyntaxError("Unexpected end of JSON input at line 1, column 1");
    }

    this.cachedResult = this.parser.parse();
    return this.cachedResult;
  }

  /**
   * Process the buffer and tokenize available data
   */
  private processBuffer(final: boolean = false): void {
    // Use the original tokenizer but work incrementally
    const tokenizer = new IncrementalTokenizer(
      this.buffer, 
      this.fullInput.length - this.buffer.length, 
      final,
      this.inString,
      this.inNumber,
      this.partialString,
      this.partialNumber,
      this.inUnicodeEscape,
      this.unicodeEscapeBuffer
    );
    
    try {
      const result = tokenizer.tokenize();
      const newTokens = result.tokens;
      const processedLength = result.processedLength;
      
      // Update state
      this.inString = result.inString;
      this.inNumber = result.inNumber;
      this.partialString = result.partialString;
      this.partialNumber = result.partialNumber;
      this.inUnicodeEscape = result.inUnicodeEscape;
      this.unicodeEscapeBuffer = result.unicodeEscapeBuffer;
      
      // Update tokens and remove processed portion from buffer
      this.tokens.push(...newTokens);
      this.buffer = this.buffer.slice(processedLength);

      // If we have tokens and no parser yet, create one
      if (this.tokens.length > 0 && !this.parser) {
        this.parser = new Parser(this.tokens, this.fullInput);
      }
    } catch (error) {
      // If it's an incomplete token error and we're not final, wait for more data
      if (final || !(error instanceof SyntaxError) || 
          (!error.message.includes("Unexpected end") && 
           !error.message.includes("Unterminated") &&
           !error.message.includes("Missing digits") &&
           !error.message.includes("Invalid exponent"))) {
        // For final processing or non-incomplete errors, store to throw during end()
        if (final) {
          throw error;
        }
        // Store error to throw during end() instead of immediately
        this.pendingError = error as SyntaxError;
        return;
      }
      // Otherwise, we need more data - buffer is incomplete
    }
  }

  /**
   * Check if the parser needs more data
   */
  public needsMoreData(): boolean {
    if (this.isComplete) return false;
    if (this.buffer.trim().length > 0 || this.inString || this.inNumber) return true;
    
    // Check if we're waiting for a value (last token was colon or comma, or we're in an object/array)
    if (this.tokens.length > 0) {
      const lastToken = this.tokens[this.tokens.length - 1];
      if (lastToken.type === TokenType.COLON || lastToken.type === TokenType.COMMA) {
        return true; // Waiting for a value
      }
      // Check if we're in an object/array (more opening than closing)
      const openCount = this.tokens.filter(t => 
        t.type === TokenType.LEFT_BRACE || t.type === TokenType.LEFT_BRACKET
      ).length;
      const closeCount = this.tokens.filter(t => 
        t.type === TokenType.RIGHT_BRACE || t.type === TokenType.RIGHT_BRACKET
      ).length;
      if (openCount > closeCount) {
        return true; // Still in an object/array
      }
    }
    
    return false;
  }
}

/**
 * Incremental tokenizer that can handle partial input
 */
class IncrementalTokenizer {
  private input: string;
  private position = 0;
  private startOffset: number; // Offset in the full input stream
  private isFinal: boolean; // Whether this is the final chunk
  private inString: boolean; // Whether we're continuing a string from previous chunk
  private inNumber: boolean; // Whether we're continuing a number from previous chunk
  private partialString: string; // Accumulated string value across chunks
  private partialNumber: string; // Accumulated number value across chunks
  private inUnicodeEscape: boolean = false; // Track if we're in the middle of \uXXXX
  private unicodeEscapeBuffer: string = ""; // Buffer for unicode hex digits

  constructor(
    input: string, 
    startOffset: number = 0, 
    isFinal: boolean = false,
    inString: boolean = false,
    inNumber: boolean = false,
    partialString: string = "",
    partialNumber: string = "",
    inUnicodeEscape: boolean = false,
    unicodeEscapeBuffer: string = ""
  ) {
    this.input = input;
    this.startOffset = startOffset;
    this.isFinal = isFinal;
    this.inString = inString;
    this.inNumber = inNumber;
    this.partialString = partialString;
    this.partialNumber = partialNumber;
    this.inUnicodeEscape = inUnicodeEscape;
    this.unicodeEscapeBuffer = unicodeEscapeBuffer;
  }

  private peek(): string | undefined {
    return this.input[this.position];
  }

  private advance(): string {
    const char = this.peek();
    if (char === undefined) {
      throw new SyntaxError(formatError("Unexpected end of input", this.input, this.position));
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

  /**
   * Check if remaining input could be a prefix of true/false/null
   */
  private couldBeBooleanOrNull(remaining: string): boolean {
    const lower = remaining.toLowerCase();
    return lower === "t" || lower === "tr" || lower === "tru" ||
           lower === "f" || lower === "fa" || lower === "fal" || lower === "fals" ||
           lower === "n" || lower === "nu" || lower === "nul";
  }

  /**
   * Check if a character could be part of an identifier (for checking true/false/null boundaries)
   */
  private isIdentifierChar(char: string | undefined): boolean {
    return !!char && /[a-zA-Z0-9_$]/.test(char);
  }

  public tokenize(): { 
    tokens: Token[]; 
    processedLength: number; 
    inString: boolean; 
    inNumber: boolean;
    partialString: string;
    partialNumber: string;
    inUnicodeEscape: boolean;
    unicodeEscapeBuffer: string;
  } {
    const tokens: Token[] = [];
    let currentInString = this.inString;
    let currentInNumber = this.inNumber;
    let currentPartialString = this.partialString;
    let currentPartialNumber = this.partialNumber;
    let currentInUnicodeEscape = this.inUnicodeEscape;
    let currentUnicodeEscapeBuffer = this.unicodeEscapeBuffer;

    // Check if we should log - we need access to fullInput, so we'll check in the error case
    const shouldLog = false; // We'll set this when we hit the error
    
    // Remove most logging, only keep critical ones for the error case

    // If we're continuing a string, read it first
    if (currentInString) {
      try {
        const start = this.startOffset + this.position;
        // Restore unicode escape state before reading
        this.inUnicodeEscape = currentInUnicodeEscape;
        this.unicodeEscapeBuffer = currentUnicodeEscapeBuffer;
        // CRITICAL: Set this.inString to true before calling readString
        // so readString knows we're continuing
        this.inString = true;
        const value = this.readString(currentPartialString);
        tokens.push({ type: TokenType.STRING, value, start, end: this.startOffset + this.position });
        currentInString = false;
        currentPartialString = "";
        // Capture updated state
        currentInUnicodeEscape = this.inUnicodeEscape;
        currentUnicodeEscapeBuffer = this.unicodeEscapeBuffer;
        // Clear the instance variable
        this.inString = false;
      } catch (error) {
        if (error instanceof SyntaxError && error.message.includes("Unterminated")) {
          if (this.isFinal) throw error;
          // Capture current state before returning
          currentInUnicodeEscape = this.inUnicodeEscape;
          currentUnicodeEscapeBuffer = this.unicodeEscapeBuffer;
          currentPartialString = this.partialString;
          // Ensure inString state is preserved
          this.inString = true;
          // Use this.position - readString has already advanced it
          return { 
            tokens, 
            processedLength: this.position,
            inString: true, 
            inNumber: false,
            partialString: currentPartialString,
            partialNumber: "",
            inUnicodeEscape: currentInUnicodeEscape,
            unicodeEscapeBuffer: currentUnicodeEscapeBuffer
          };
        }
        throw error;
      }
    }

    // If we're continuing a number, read it first
    if (currentInNumber) {
      try {
        const start = this.startOffset + this.position;
        // CRITICAL: Set this.inNumber to true before calling readNumber
        // so readNumber knows we're continuing
        this.inNumber = true;
        const value = this.readNumber(currentPartialNumber);
        tokens.push({ type: TokenType.NUMBER, value, start, end: this.startOffset + this.position });
        currentInNumber = false;
        currentPartialNumber = "";
        // Clear the instance variable
        this.inNumber = false;
      } catch (error) {
        if (error instanceof SyntaxError && 
            (error.message.includes("Unexpected end") || 
             error.message.includes("Missing digits") ||
             error.message.includes("Invalid exponent"))) {
          if (this.isFinal) throw error;
          // Capture current state
          currentPartialNumber = this.partialNumber;
          // Ensure inNumber state is preserved
          this.inNumber = true;
          // Use this.position - readNumber has already advanced it
          return { 
            tokens, 
            processedLength: this.position,
            inString: false, 
            inNumber: true,
            partialString: "",
            partialNumber: currentPartialNumber,
            inUnicodeEscape: false,
            unicodeEscapeBuffer: ""
          };
        }
        throw error;
      }
    }

    while (this.position < this.input.length) {
      const beforeSkip = this.position;
      this.skipWhitespace();

      if (this.position >= this.input.length) break;

      const char = this.peek();
      if (!char) break;

      const tokenStartPos = this.position;

      try {
        let token: Token | null = null;

        switch (char) {
          case "{": {
            const start = this.startOffset + this.position;
            this.advance();
            token = { type: TokenType.LEFT_BRACE, value: "{", start, end: this.startOffset + this.position };
            break;
          }
          case "}": {
            const start = this.startOffset + this.position;
            this.advance();
            token = { type: TokenType.RIGHT_BRACE, value: "}", start, end: this.startOffset + this.position };
            break;
          }
          case "[": {
            const start = this.startOffset + this.position;
            this.advance();
            token = { type: TokenType.LEFT_BRACKET, value: "[", start, end: this.startOffset + this.position };
            break;
          }
          case "]": {
            const start = this.startOffset + this.position;
            this.advance();
            token = { type: TokenType.RIGHT_BRACKET, value: "]", start, end: this.startOffset + this.position };
            break;
          }
          case ":": {
            const start = this.startOffset + this.position;
            this.advance();
            token = { type: TokenType.COLON, value: ":", start, end: this.startOffset + this.position };
            break;
          }
          case ",": {
            const start = this.startOffset + this.position;
            this.advance();
            token = { type: TokenType.COMMA, value: ",", start, end: this.startOffset + this.position };
            break;
          }
          case '"': {
            const start = this.startOffset + this.position;
            try {
              // CRITICAL: Set inString to false before calling readString
              // readString will handle setting it correctly
              this.inString = false;
              const value = this.readString("");
              token = { type: TokenType.STRING, value, start, end: this.startOffset + this.position };
              currentInString = false;
              currentInUnicodeEscape = false;
              currentUnicodeEscapeBuffer = "";
              // Clear instance variable
              this.inString = false;
            } catch (error) {
              if (error instanceof SyntaxError && error.message.includes("Unterminated")) {
                if (this.isFinal) throw error;
                // readString has already advanced past the opening " and read some characters
                // Set state and return immediately - don't try to tokenize more
                currentInString = true;
                currentPartialString = this.partialString;
                currentInUnicodeEscape = this.inUnicodeEscape;
                currentUnicodeEscapeBuffer = this.unicodeEscapeBuffer;
                // Ensure instance variable is set
                this.inString = true;
                // CRITICAL: Return immediately with processedLength = this.position
                // This ensures we consume what we've read (the " and any characters)
                return {
                  tokens,
                  processedLength: this.position, // This should include the " and any chars read
                  inString: true,
                  inNumber: false,
                  partialString: currentPartialString,
                  partialNumber: "",
                  inUnicodeEscape: currentInUnicodeEscape,
                  unicodeEscapeBuffer: currentUnicodeEscapeBuffer
                };
              }
              throw error;
            }
            break;
          }
          default:
            if (this.isDigit(char) || char === "-") {
              const start = this.startOffset + this.position;
              // CRITICAL: Set inNumber to false before calling readNumber
              // because this is a new number, not a continuation
              this.inNumber = false;
              const value = this.readNumber("");
              token = { type: TokenType.NUMBER, value, start, end: this.startOffset + this.position };
              currentInNumber = false;
              // Clear instance variable
              this.inNumber = false;
            } else {
              // Check for true/false/null
              const remaining = this.input.slice(this.position);
              
              // Only check for boolean/null if we're not in a string
              // (This shouldn't happen in valid JSON, but handle edge cases)
              if (this.input.startsWith("true", this.position) && 
                  (this.position + 4 >= this.input.length || !this.isIdentifierChar(this.input[this.position + 4]))) {
                const start = this.startOffset + this.position;
                this.position += 4;
                token = { type: TokenType.TRUE, value: "true", start, end: this.startOffset + this.position };
              } else if (this.input.startsWith("false", this.position) &&
                         (this.position + 5 >= this.input.length || !this.isIdentifierChar(this.input[this.position + 5]))) {
                const start = this.startOffset + this.position;
                this.position += 5;
                token = { type: TokenType.FALSE, value: "false", start, end: this.startOffset + this.position };
              } else if (this.input.startsWith("null", this.position) &&
                         (this.position + 4 >= this.input.length || !this.isIdentifierChar(this.input[this.position + 4]))) {
                const start = this.startOffset + this.position;
                this.position += 4;
                token = { type: TokenType.NULL, value: "null", start, end: this.startOffset + this.position };
              } else if (!this.isFinal && this.couldBeBooleanOrNull(remaining)) {
                // Could be a prefix of true/false/null - wait for more data
                // Don't advance position, return what we have
                return { 
                  tokens, 
                  processedLength: this.position, 
                  inString: false, 
                  inNumber: false,
                  partialString: "",
                  partialNumber: "",
                  inUnicodeEscape: false,
                  unicodeEscapeBuffer: ""
                };
              } else {
                // ONLY LOG HERE - this is where the error occurs
                console.error(`[UNEXPECTED CHAR ERROR] char='${char}', position=${this.position}, buffer="${this.input}", bufferLength=${this.input.length}`);
                console.error(`[STATE] inString=${currentInString}, partialString="${currentPartialString}", inNumber=${currentInNumber}, partialNumber="${currentPartialNumber}"`);
                console.error(`[CONTEXT] charCode=${char.charCodeAt(0)}, prevChars="${this.input.slice(Math.max(0, this.position - 10), this.position)}", nextChars="${this.input.slice(this.position, this.position + 10)}"`);
                console.error(`[TOKENS SO FAR] count=${tokens.length}, lastToken=${tokens.length > 0 ? tokens[tokens.length - 1].type : 'none'}`);
                throw new SyntaxError(formatError(`Unexpected character '${char}'`, this.input, this.position));
              }
            }
        }

        if (token) {
          tokens.push(token);
        }

        if (this.position === tokenStartPos && this.position < this.input.length) {
          throw new SyntaxError(formatError("Failed to consume input", this.input, this.position));
        }
      } catch (error) {
        // If we hit an incomplete token, stop here and wait for more data
        if (error instanceof SyntaxError && 
            (error.message.includes("Unexpected end") || 
             error.message.includes("Unterminated") ||
             error.message.includes("Missing digits") ||
             error.message.includes("Invalid exponent"))) {
          if (this.isFinal) {
            throw error;
          }
          
          // Only log if it's an "Unexpected character" error (which we catch and re-throw)
          if (error.message.includes("Unexpected character")) {
            console.error(`[INCOMPLETE TOKEN - UNEXPECTED CHAR] error="${error.message}", position=${this.position}`);
            console.error(`[STATE] inString=${currentInString}, partialString="${currentPartialString}"`);
          }
          
          // State should already be set in inner catch for strings, but ensure it's set here too
          if (error.message.includes("Unterminated string")) {
            // Only set if not already set (to avoid overwriting)
            if (!currentInString) {
              // console.log(`[SETTING INSTRING] was false, setting to true, partialString="${this.partialString}"`); // Removed logging
              currentInString = true;
              currentPartialString = this.partialString;
              currentInUnicodeEscape = this.inUnicodeEscape;
              currentUnicodeEscapeBuffer = this.unicodeEscapeBuffer;
            }
          } else if (error.message.includes("Unexpected end") || 
                     error.message.includes("Missing digits") ||
                     error.message.includes("Invalid exponent")) {
            currentInNumber = true;
            currentPartialNumber = this.partialNumber;
          }
          
          break; // Stop tokenizing, wait for more data
        }
        throw error;
      }
    }

    return { 
      tokens, 
      processedLength: this.position,
      inString: currentInString, 
      inNumber: currentInNumber,
      partialString: currentPartialString,
      partialNumber: currentPartialNumber,
      inUnicodeEscape: currentInUnicodeEscape,
      unicodeEscapeBuffer: currentUnicodeEscapeBuffer
    };
  }

  // Fix readString to properly handle continuation when buffer starts with closing quote:
  private readString(accumulated: string): string {
    let str = accumulated;
    const wasInString = this.inString;
    
    // CRITICAL: When continuing a string, we don't skip the opening quote
    // because we're already inside the string. The first character we read
    // should be the closing " if the string is complete, or more content if not.
    if (!this.inString) {
      this.advance(); // skip opening "
    }
    // When continuing, we don't skip, so we start reading from current position
    
    const stringStart = wasInString ? (this.startOffset + this.position - str.length - 1) : (this.startOffset + this.position - 1);

    // If we're continuing a string with an incomplete unicode escape, handle it first
    if (this.inUnicodeEscape && this.unicodeEscapeBuffer.length > 0) {
      // We need to read the remaining hex digits
      const needed = 4 - this.unicodeEscapeBuffer.length;
      for (let i = 0; i < needed && this.position < this.input.length; i++) {
        const char = this.input[this.position];
        if (/[0-9a-fA-F]/.test(char)) {
          this.unicodeEscapeBuffer += char;
          this.position++;
        } else {
          // Invalid hex digit - this shouldn't happen in valid JSON, but handle it
          this.inUnicodeEscape = false;
          this.unicodeEscapeBuffer = "";
          throw new SyntaxError(formatError(`Invalid Unicode escape`, this.input, this.position - 2));
        }
      }
      
      if (this.unicodeEscapeBuffer.length === 4) {
        // Complete unicode escape - convert to character
        str += String.fromCharCode(parseInt(this.unicodeEscapeBuffer, 16));
        this.inUnicodeEscape = false;
        this.unicodeEscapeBuffer = "";
      } else {
        // Still incomplete - need more data
        this.partialString = str;
        this.inString = true; // Ensure state is set
        throw new SyntaxError(formatError("Unterminated string literal", this.input, stringStart));
      }
    }

    while (true) {
      if (this.position >= this.input.length) {
        this.partialString = str;
        this.inString = true; // Ensure state is set
        throw new SyntaxError(formatError("Unterminated string literal", this.input, stringStart));
      }

      const char = this.advance();

      if (char === '"') {
        // Found closing quote - string is complete
        this.partialString = "";
        this.inString = false; // Clear string state
        this.inUnicodeEscape = false;
        this.unicodeEscapeBuffer = "";
        return str;
      }

      if (char === "\\") {
        if (this.position >= this.input.length) {
          this.partialString = str;
          this.inString = true; // Ensure state is set
          throw new SyntaxError(formatError("Unterminated string literal", this.input, stringStart));
        }
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
            // Start reading unicode escape
            if (this.position + 4 > this.input.length) {
              // Not enough characters - save state
              this.inUnicodeEscape = true;
              this.unicodeEscapeBuffer = "";
              // Read what we have
              while (this.position < this.input.length) {
                const hexChar = this.input[this.position];
                if (/[0-9a-fA-F]/.test(hexChar)) {
                  this.unicodeEscapeBuffer += hexChar;
                  this.position++;
                } else {
                  break;
                }
              }
              this.partialString = str;
              this.inString = true; // Ensure state is set
              throw new SyntaxError(formatError("Unterminated string literal", this.input, stringStart));
            }
            const hex = this.input.slice(this.position, this.position + 4);
            if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
              throw new SyntaxError(formatError(`Invalid Unicode escape`, this.input, this.position - 2));
            }
            str += String.fromCharCode(parseInt(hex, 16));
            this.position += 4;
            break;
          default:
            throw new SyntaxError(formatError(`Invalid escape sequence \\${next}`, this.input, this.position - 1));
        }
      } else if (/[\u0000-\u001F]/.test(char)) {
        throw new SyntaxError(formatError(`Unescaped control character in string`, this.input, this.position - 1));
      } else {
        str += char;
      }
    }
  }

  private readNumber(accumulated: string): string {
    const start = this.position;
    let char = this.peek();
    let numStr = accumulated;

    // If we're continuing a number, we already have the start (including "-")
    if (!this.inNumber) {
      if (char === "-") {
        this.advance();
        numStr += "-";
        char = this.peek();
        if (char === undefined && !this.isFinal) {
          this.partialNumber = numStr;
          throw new SyntaxError(formatError("Unexpected end of input", this.input, this.position));
        }
      }

      if (char === "0") {
        this.advance();
        numStr += "0";
        char = this.peek();
        if (this.isDigit(char)) {
          throw new SyntaxError(formatError("Leading zeros not allowed", this.input, this.position));
        }
      } else if (this.isDigit(char)) {
        while (this.isDigit(this.peek())) {
          numStr += this.advance();
        }
      } else {
        throw new SyntaxError(formatError("Invalid number start", this.input, this.position));
      }
    } else {
      // Continuing a number - just read digits
      // But first check if we're at the end of buffer
      if (char === undefined) {
        if (!this.isFinal) {
          this.partialNumber = numStr;
          this.inNumber = true; // Ensure state is set
          throw new SyntaxError(formatError("Unexpected end of input", this.input, this.position));
        }
        // If final and no more input, the number is complete
        this.partialNumber = "";
        this.inNumber = false;
        return numStr;
      }
      
      if (this.isDigit(char)) {
        while (this.isDigit(this.peek())) {
          numStr += this.advance();
        }
      } else {
        // Not a digit - number is complete
        // But check if we're at end of buffer first
        if (this.position >= this.input.length && !this.isFinal) {
          this.partialNumber = numStr;
          this.inNumber = true; // Ensure state is set
          throw new SyntaxError(formatError("Unexpected end of input", this.input, this.position));
        }
        // Number is complete
        this.partialNumber = "";
        this.inNumber = false;
        return numStr;
      }
    }

    char = this.peek();
    if (char === ".") {
      this.advance();
      numStr += ".";
      if (this.position >= this.input.length) {
        if (!this.isFinal) {
          this.partialNumber = numStr;
          throw new SyntaxError(formatError("Missing digits after '.'", this.input, this.position));
        }
        throw new SyntaxError(formatError("Missing digits after '.'", this.input, this.position));
      }
      if (!this.isDigit(this.peek())) {
        throw new SyntaxError(formatError("Missing digits after '.'", this.input, this.position));
      }
      while (this.isDigit(this.peek())) {
        numStr += this.advance();
      }
    }

    char = this.peek();
    if (char && /[eE]/.test(char)) {
      this.advance();
      numStr += char;
      char = this.peek();
      if (char && /[\+\-]/.test(char)) {
        this.advance();
        numStr += char;
        // If we have "e" or "e+" or "e-" and no more input, wait for more data
        if (this.position >= this.input.length && !this.isFinal) {
          this.partialNumber = numStr;
          throw new SyntaxError(formatError("Invalid exponent", this.input, this.position));
        }
      }
      if (this.position >= this.input.length) {
        if (!this.isFinal) {
          this.partialNumber = numStr;
          throw new SyntaxError(formatError("Invalid exponent", this.input, this.position));
        }
        throw new SyntaxError(formatError("Invalid exponent", this.input, this.position));
      }
      if (!this.isDigit(this.peek())) {
        throw new SyntaxError(formatError("Invalid exponent", this.input, this.position));
      }
      while (this.isDigit(this.peek())) {
        numStr += this.advance();
      }
    }

    // Check if number is followed by a delimiter
    // If we're at the end of buffer and not final, the number might continue
    char = this.peek();
    if (char === undefined && !this.isFinal) {
      // At end of buffer - number might continue, wait for more data
      this.partialNumber = numStr;
      throw new SyntaxError(formatError("Unexpected end of input", this.input, this.position));
    }

    this.partialNumber = ""; // Clear partial when complete
    return numStr;
  }
}

/**
 * Convenience function to parse JSON from a stream
 * @param chunks - Array of JSON string chunks
 * @returns Parsed JSON value
 */
export function parseJSONStream(chunks: string[]): any {
  const parser = new StreamingParser();
  for (const chunk of chunks) {
    parser.write(chunk);
  }
  return parser.end();
}
