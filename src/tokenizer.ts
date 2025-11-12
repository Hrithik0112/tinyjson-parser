export enum TokenType {
    LEFT_BRACE,
    RIGHT_BRACE,
    LEFT_BRACKET,
    RIGHT_BRACKET,
    COLON,
    COMMA,
    STRING,
    NUMBER,
    TRUE,
    FALSE,
    NULL
  }
  
  export interface Token {
    type: TokenType;
    value: string;
  }
  
  export function tokenize(input: string): Token[] {
    console.log("Tokenizer placeholder - ready for M1 implementation.");
    return [];
  }
  