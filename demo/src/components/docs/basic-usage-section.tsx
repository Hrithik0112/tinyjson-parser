import { CodeBlock } from '@/components/code-block';

export function BasicUsageSection() {
  return (
    <section id="basic-usage" className="mb-16">
      <h2 className="text-3xl font-medium text-black mb-6">Basic Usage</h2>
      <p className="text-base text-black/60 mb-6 leading-relaxed font-mono">
        Parse JSON strings with a simple, clean API.
      </p>
      <CodeBlock
        title="Simple Parsing"
        code={`import { parseJSON } from 'tinyjson-parser';

const json = '{"name": "world", "count": 42}';
const result = parseJSON(json);
// { name: "world", count: 42 }`}
      />
      <div className="mt-8 space-y-6">
        <div>
          <h3 className="text-xl font-medium text-black mb-3">Supported Types</h3>
          <p className="text-base text-black/60 mb-4 leading-relaxed font-mono">
            tinyjson-parser supports all standard JSON types:
          </p>
          <CodeBlock
            code={`import { parseJSON } from 'tinyjson-parser';

// Objects
parseJSON('{"key": "value"}');

// Arrays
parseJSON('[1, 2, 3]');

// Strings
parseJSON('"hello world"');

// Numbers
parseJSON('42');
parseJSON('-3.14');
parseJSON('1e10');

// Booleans
parseJSON('true');
parseJSON('false');

// Null
parseJSON('null');

// Nested structures
parseJSON('{"users": [{"id": 1, "active": true}]}');`}
          />
        </div>
      </div>
    </section>
  );
}

