import { CodeBlock } from '@/components/code-block';

export function ApiReferenceSection() {
  return (
    <section id="api-reference" className="mb-16">
      <h2 className="text-3xl font-medium text-black mb-6">API Reference</h2>
      
      <div className="space-y-12">
        {/* parseJSON */}
        <div>
          <h3 className="text-2xl font-medium text-black mb-4">parseJSON</h3>
          <p className="text-base text-black/60 mb-4 leading-relaxed font-mono">
            Parses a complete JSON string and returns the parsed JavaScript value.
          </p>
          <CodeBlock
            code={`function parseJSON(input: string): any`}
          />
          <div className="mt-4 space-y-3">
            <div>
              <h4 className="text-base font-medium text-black mb-2">Parameters</h4>
              <div className="border-l-2 border-black/10 pl-4">
                <p className="text-sm text-black/60 font-mono">
                  <span className="text-black">input</span>: string - The JSON string to parse
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-base font-medium text-black mb-2">Returns</h4>
              <div className="border-l-2 border-black/10 pl-4">
                <p className="text-sm text-black/60 font-mono">
                  any - The parsed JavaScript value
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-base font-medium text-black mb-2">Throws</h4>
              <div className="border-l-2 border-black/10 pl-4">
                <p className="text-sm text-black/60 font-mono">
                  SyntaxError - If the input is not valid JSON
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* StreamingParser */}
        <div>
          <h3 className="text-2xl font-medium text-black mb-4">StreamingParser</h3>
          <p className="text-base text-black/60 mb-4 leading-relaxed font-mono">
            A class for parsing JSON incrementally from multiple chunks.
          </p>
          <CodeBlock
            code={`class StreamingParser {
  write(chunk: string): void
  end(): any
  needsMoreData(): boolean
}`}
          />
          <div className="mt-4 space-y-3">
            <div>
              <h4 className="text-base font-medium text-black mb-2">Methods</h4>
              <div className="space-y-3 border-l-2 border-black/10 pl-4">
                <div>
                  <p className="text-sm font-medium text-black mb-1">write(chunk: string)</p>
                  <p className="text-sm text-black/60 font-mono">
                    Writes a chunk of JSON data to the parser. Can be called multiple times.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-black mb-1">end(): any</p>
                  <p className="text-sm text-black/60 font-mono">
                    Signals that all data has been written and returns the parsed JSON value.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-black mb-1">needsMoreData(): boolean</p>
                  <p className="text-sm text-black/60 font-mono">
                    Returns true if the parser is waiting for more data to complete parsing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* parseJSONStream */}
        <div>
          <h3 className="text-2xl font-medium text-black mb-4">parseJSONStream</h3>
          <p className="text-base text-black/60 mb-4 leading-relaxed font-mono">
            Convenience function to parse JSON from an array of chunks.
          </p>
          <CodeBlock
            code={`function parseJSONStream(chunks: string[]): any`}
          />
          <div className="mt-4 space-y-3">
            <div>
              <h4 className="text-base font-medium text-black mb-2">Parameters</h4>
              <div className="border-l-2 border-black/10 pl-4">
                <p className="text-sm text-black/60 font-mono">
                  <span className="text-black">chunks</span>: string[] - Array of JSON string chunks
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-base font-medium text-black mb-2">Returns</h4>
              <div className="border-l-2 border-black/10 pl-4">
                <p className="text-sm text-black/60 font-mono">
                  any - The parsed JavaScript value
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

