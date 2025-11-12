import { CodeBlock } from '@/components/code-block';

export function StreamingParserSection() {
  return (
    <section id="streaming-parser" className="mb-16">
      <h2 className="text-3xl font-medium text-black mb-6">Streaming Parser</h2>
      <p className="text-base text-black/60 mb-6 leading-relaxed font-mono">
        Parse large JSON files incrementally by processing data in chunks. Perfect for handling files that don't fit in memory.
      </p>
      <CodeBlock
        title="Streaming Large Files"
        code={`import { StreamingParser, parseJSONStream } from 'tinyjson-parser';

// Method 1: Using StreamingParser class
const parser = new StreamingParser();
parser.write('{"name": "');
parser.write('world", "items": [');
parser.write('1, 2, 3]}');
const result = parser.end();
// { name: "world", items: [1, 2, 3] }

// Method 2: Using convenience function
const chunks = ['{"users": [', '{"id": 1}', ']}'];
const data = parseJSONStream(chunks);
// { users: [{ id: 1 }] }`}
      />
      <div className="mt-8">
        <h3 className="text-xl font-medium text-black mb-3">When to Use Streaming</h3>
        <ul className="space-y-2 text-base text-black/60 leading-relaxed font-mono">
          <li className="flex items-start gap-2">
            <span className="text-black mt-1">•</span>
            <span>Parsing files larger than available memory</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-black mt-1">•</span>
            <span>Processing JSON from network streams</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-black mt-1">•</span>
            <span>Handling real-time JSON data feeds</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

