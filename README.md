# tinyjson-parser

A tiny, dependency-free JSON parser written in TypeScript. Built from scratch with a two-phase approach: tokenization and parsing.

## Features

- 🚀 **Zero dependencies** - Pure TypeScript implementation
- 📦 **Tiny footprint** - Minimal codebase, maximum clarity
- ⚡ **Strict JSON compliance** - Follows JSON specification exactly
- 🎯 **Detailed error messages** - Line and column information for debugging
- 🌊 **Streaming support** - Parse large JSON files incrementally
- 🔒 **Type-safe** - Full TypeScript support with type definitions

## How It Works

The parser uses a classic two-phase approach:

### 1. Tokenization

The input JSON string is first converted into a stream of tokens. The tokenizer scans the input character by character, identifying:

- **Structural tokens**: `{`, `}`, `[`, `]`, `:`, `,`
- **Value tokens**: strings, numbers, `true`, `false`, `null`

Each token includes its type, value, and position information for accurate error reporting.

```typescript
// Input: '{"name":"John","age":30}'
// Tokens: [
//   { type: LEFT_BRACE, value: '{', ... },
//   { type: STRING, value: 'name', ... },
//   { type: COLON, value: ':', ... },
//   { type: STRING, value: 'John', ... },
//   ...
// ]
```

### 2. Parsing

The parser consumes tokens and builds the JavaScript value structure:

- Objects are parsed by matching key-value pairs
- Arrays are parsed by collecting sequential values
- Numbers are validated and converted
- Strings handle escape sequences (`\n`, `\uXXXX`, etc.)
- Booleans and null are recognized as literals

The parser enforces strict JSON rules: no trailing commas, no leading zeros, proper escaping, etc.

## Installation

```bash
npm install tinyjson-parser
```

## Usage

### Basic Parsing

```typescript
import { parseJSON } from 'tinyjson-parser';

const json = '{"name":"Alice","age":30,"active":true}';
const data = parseJSON(json);

console.log(data.name);  // "Alice"
console.log(data.age);   // 30
console.log(data.active); // true
```

### Complex JSON

```typescript
const complex = `{
  "users": [
    {"id": 1, "name": "John"},
    {"id": 2, "name": "Jane"}
  ],
  "metadata": {
    "count": 2,
    "timestamp": 1234567890
  }
}`;

const parsed = parseJSON(complex);
console.log(parsed.users[0].name); // "John"
```

### Streaming Parser

For large JSON files, use the streaming parser:

```typescript
import { StreamingParser } from 'tinyjson-parser';

const parser = new StreamingParser();

// Write chunks as they arrive
parser.write('{"name":');
parser.write('"Alice"');
parser.write(',"age":30}');

// Get the final result
const result = parser.end();
console.log(result); // { name: "Alice", age: 30 }
```

### Error Handling

The parser provides detailed error messages with line and column information:

```typescript
try {
  parseJSON('{"invalid": json}');
} catch (error) {
  console.error(error.message);
  // "Unexpected character 'j' at line 1, column 15"
}
```

## License

MIT
