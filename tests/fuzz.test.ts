import { describe, it, expect } from "vitest";
import { parseJSON } from "../src/index.js";

// --- Generate valid random JSON with deep nesting and varied types ---
function randomJSON(depth = 0, maxDepth = 6): any {
  const types = ["number", "string", "boolean", "null", "array", "object"];
  const choice = types[Math.floor(Math.random() * types.length)];

  if (depth > maxDepth) return null; // limit recursion depth

  switch (choice) {
    case "number": {
      const exp = Math.floor(Math.random() * 5) - 2;
      return parseFloat(
        (Math.random() * 1000 * Math.pow(10, exp) - 500).toFixed(2)
      );
    }
    case "string": {
      // sometimes include tricky characters
      const base = Math.random().toString(36).substring(2, 10);
      if (Math.random() < 0.1) return base + '"'; // intentionally malformed string
      if (Math.random() < 0.1) return base + "\n"; // newline in string
      return base;
    }
    case "boolean":
      return Math.random() > 0.5;
    case "null":
      return null;
    case "array":
      return Array.from(
        { length: Math.floor(Math.random() * 5) },
        () => randomJSON(depth + 1, maxDepth)
      );
    case "object": {
      const obj: Record<string, any> = {};
      const keys = Math.floor(Math.random() * 4);
      for (let i = 0; i < keys; i++) {
        obj[Math.random().toString(36).substring(2, 6)] = randomJSON(
          depth + 1,
          maxDepth
        );
      }
      return obj;
    }
  }
}

// --- Generate extreme invalid JSON covering almost all edge cases ---
function randomInvalidJSON(): { mutation: string; input: string } {
  const base = JSON.stringify(randomJSON());
  const variants: Array<{ name: string; fn: () => string | null }> = [
    { name: "empty input", fn: () => "" },
    { name: "incomplete object", fn: () => "{" },
    { name: "incomplete array", fn: () => "[" },
    { 
      name: "missing closing bracket", 
      fn: () => {
        const result = base.replace(/\]$/, "");
        return result !== base ? result : null;
      }
    },
    { 
      name: "missing closing brace", 
      fn: () => {
        const result = base.replace(/\}$/, "");
        return result !== base ? result : null;
      }
    },
    { 
      name: "missing colon", 
      fn: () => {
        const result = base.replace(/:/, "");
        return result !== base ? result : null;
      }
    },
    { 
      name: "double comma", 
      fn: () => {
        const result = base.replace(/,/, ",,");
        return result !== base ? result : null;
      }
    },
    { 
      name: "leading comma", 
      fn: () => {
        const result = base.replace(/^\[/, "[,");
        return result !== base ? result : null;
      }
    },
    { name: "extra tokens", fn: () => base + " abc" },
    { 
      name: "remove quotes from strings", 
      fn: () => {
        // Only remove quotes if it would create invalid JSON
        // Skip if it's a primitive value that would become valid
        if (base === '"null"' || base === '"true"' || base === '"false"') {
          return null; // These become valid primitives
        }
        // Skip if it's a quoted number
        if (/^"\d/.test(base) || /^"-\d/.test(base)) {
          return null; // These become valid numbers
        }
        const result = base.replace(/"/g, "");
        return result !== base ? result : null;
      }
    },
    { 
      name: "invalid boolean casing (True)", 
      fn: () => {
        const result = base.replace(/true/g, "True");
        return result !== base ? result : null;
      }
    },
    { 
      name: "invalid boolean casing (FALSE)", 
      fn: () => {
        const result = base.replace(/false/g, "FALSE");
        return result !== base ? result : null;
      }
    },
    { 
      name: "invalid null casing", 
      fn: () => {
        const result = base.replace(/null/g, "Null");
        return result !== base ? result : null;
      }
    },
    { 
      name: "malformed number (1.2.3)", 
      fn: () => {
        // Only replace if it's not inside a string
        // Look for patterns like :123.45 or ,123.45 or [123.45 (not inside quotes)
        const result = base.replace(/([\[,:])\s*(\d+\.\d+)/g, (match, prefix, num) => {
          // Check if we're inside a string by counting quotes before this position
          const pos = base.indexOf(match);
          const before = base.substring(0, pos);
          const quoteCount = (before.match(/"/g) || []).length;
          // If odd number of quotes, we're inside a string
          if (quoteCount % 2 === 1) return match;
          return prefix + " 1.2.3";
        });
        return result !== base ? result : null;
      }
    },
    { 
      name: "leading zero", 
      fn: () => {
        // Only replace numbers that are actual JSON number tokens, not inside strings
        const result = base.replace(/([\[,:])\s*(\d+)/g, (match, prefix, num) => {
          // Check if we're inside a string
          const pos = base.indexOf(match);
          const before = base.substring(0, pos);
          const quoteCount = (before.match(/"/g) || []).length;
          if (quoteCount % 2 === 1) return match; // Inside string
          return prefix + " 0123";
        });
        return result !== base ? result : null;
      }
    },
    { 
      name: "malformed exponent", 
      fn: () => {
        // Only replace if not inside a string
        const result = base.replace(/([\[,:])\s*(\d+e[+-]?\d+)/g, (match, prefix, num) => {
          const pos = base.indexOf(match);
          const before = base.substring(0, pos);
          const quoteCount = (before.match(/"/g) || []).length;
          if (quoteCount % 2 === 1) return match; // Inside string
          return prefix + " 1e+e";
        });
        return result !== base ? result : null;
      }
    },
    { 
      name: "unescaped newline in string", 
      fn: () => {
        const result = base.replace(/\\?"/, "\n");
        return result !== base ? result : null;
      }
    },
    { 
      name: "remove comma between values", 
      fn: () => {
        const result = base.replace(/,/, " ");
        return result !== base ? result : null;
      }
    },
    { 
      name: "trailing comma in nested structure", 
      fn: () => {
        const result = base.replace(/(\[.*?\]|\{.*?\})/, "$1,");
        return result !== base ? result : null;
      }
    },
    { 
      name: "double colon", 
      fn: () => {
        const result = base.replace(/:/, "::");
        return result !== base ? result : null;
      }
    },
    { 
      name: "missing colon in object", 
      fn: () => {
        const result = base.replace(/"[^"]+":\s*[^,}]+/, (match) => match.replace(":", ""));
        return result !== base ? result : null;
      }
    },
    { 
      name: "extra value after key", 
      fn: () => {
        const result = base.replace(/"[^"]+":\s*[^,}]+/, (match) => match + " " + match);
        return result !== base ? result : null;
      }
    },
  ];

  // Filter out mutations that didn't match and try again if needed
  const validMutations = variants.filter(v => {
    const result = v.fn();
    return result !== null;
  });

  if (validMutations.length === 0) {
    // Fallback: always return something invalid
    return { mutation: "empty input", input: "" };
  }

  const choice = validMutations[Math.floor(Math.random() * validMutations.length)];
  const input = choice.fn();
  
  return { mutation: choice.name, input: input ?? "" };
}

// --- Vitest Fuzzy JSON Tests ---
describe("Fuzzy JSON Tests", () => {
  // --- Valid JSON tests ---
  for (let i = 0; i < 50; i++) {
    it(`fuzzy valid JSON test #${i + 1}`, () => {
      const jsonObj = randomJSON();
      const jsonStr = JSON.stringify(jsonObj);

      expect(parseJSON(jsonStr)).toEqual(JSON.parse(jsonStr));
    });
  }

  // --- Invalid JSON tests ---
  for (let i = 0; i < 50; i++) {
    it(`fuzzy invalid JSON test #${i + 1}`, () => {
      const { mutation, input } = randomInvalidJSON();
      
      try {
        parseJSON(input);
        // If we get here, the parser didn't throw - this is a failure
        console.error(`\n❌ FAILED: Mutation "${mutation}" did not throw an error`);
        console.error(`Input: ${JSON.stringify(input)}`);
        console.error(`Input length: ${input.length}`);
        throw new Error(`Expected parseJSON to throw SyntaxError for mutation: ${mutation}\nInput: ${JSON.stringify(input)}`);
      } catch (error) {
        if (error instanceof SyntaxError) {
          // This is expected - the parser correctly rejected invalid JSON
          return;
        }
        // Re-throw if it's not a SyntaxError (like our custom error above)
        throw error;
      }
    });
  }
});
