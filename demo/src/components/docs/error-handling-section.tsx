import { CodeBlock } from '@/components/code-block';

export function ErrorHandlingSection() {
  return (
    <section id="error-handling" className="mb-16">
      <h2 className="text-3xl font-medium text-black mb-6">Error Handling</h2>
      <p className="text-base text-black/60 mb-6 leading-relaxed font-mono">
        tinyjson-parser provides detailed error messages with line and column information for easy debugging.
      </p>
      <CodeBlock
        title="Error Messages"
        code={`import { parseJSON } from 'tinyjson-parser';

try {
  parseJSON('{"invalid": json}');
} catch (error) {
  // SyntaxError: Unexpected character 'j' at line 1, column 15
  console.error(error.message);
}

try {
  parseJSON('{"trailing": "comma",}');
} catch (error) {
  // SyntaxError: Trailing comma in object is not allowed at line 1, column 25
  console.error(error.message);
}

try {
  parseJSON('{"number": 0123}');
} catch (error) {
  // SyntaxError: Leading zeros not allowed at line 1, column 14
  console.error(error.message);
}`}
      />
      <div className="mt-8">
        <h3 className="text-xl font-medium text-black mb-3">Strict Validation</h3>
        <p className="text-base text-black/60 mb-4 leading-relaxed font-mono">
          The parser enforces strict JSON compliance:
        </p>
        <ul className="space-y-2 text-base text-black/60 leading-relaxed font-mono">
          <li className="flex items-start gap-2">
            <span className="text-black mt-1">•</span>
            <span>No trailing commas in objects or arrays</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-black mt-1">•</span>
            <span>No leading zeros in numbers (except "0")</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-black mt-1">•</span>
            <span>Proper string escaping and unicode support</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-black mt-1">•</span>
            <span>No duplicate commas or colons</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

