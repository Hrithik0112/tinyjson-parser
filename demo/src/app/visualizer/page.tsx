'use client';

import { useState } from 'react';
import { SimpleTokenizer, Token } from '@/lib/simple-tokenizer';
import { TokenizationViewer } from '@/components/visualizer/tokenization-viewer';
import { ParsingTreeViewer } from '@/components/visualizer/parsing-tree-viewer';

const exampleJSON = {
  simple: '{"name": "world", "count": 42}',
  nested: '{"users": [{"id": 1, "name": "Alice", "active": true}, {"id": 2, "name": "Bob", "active": false}]}',
  array: '[1, 2, 3, "hello", true, null]',
  complex: '{"data": {"items": [{"value": 10}, {"value": 20}], "metadata": {"count": 2}}}',
};

export default function VisualizerPage() {
  const [input, setInput] = useState(exampleJSON.simple);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tokenization' | 'parsing'>('tokenization');
  const [activeExample, setActiveExample] = useState<keyof typeof exampleJSON | null>('simple');

  const handleAnalyze = () => {
    setError(null);
    try {
      // Tokenize
      const tokenizer = new SimpleTokenizer(input);
      const tokenized = tokenizer.tokenize();
      setTokens(tokenized);

      // Parse using native JSON.parse
      const parsed = JSON.parse(input);
      setParsedData(parsed);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setTokens([]);
      setParsedData(null);
    }
  };

  const handleExampleSelect = (example: keyof typeof exampleJSON) => {
    setInput(exampleJSON[example]);
    setActiveExample(example);
    setError(null);
    setTokens([]);
    setParsedData(null);
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-16 relative z-10">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-medium text-black mb-4 leading-tight tracking-tight">
          JSON Visualizer
        </h1>
        <p className="text-lg text-black/60 leading-relaxed font-mono">
          Visualize tokenization steps and recursive parsing tree
        </p>
      </div>

      {/* Examples */}
      <div className="mb-8 border border-black/10 p-4">
        <h2 className="text-sm font-medium text-black/40 mb-3 uppercase tracking-wider font-mono">
          Quick Examples
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.keys(exampleJSON).map((key) => {
            const isActive = activeExample === key;
            return (
              <button
                key={key}
                onClick={() => handleExampleSelect(key as keyof typeof exampleJSON)}
                className={`px-3 py-1.5 text-xs font-mono border transition-colors ${
                  isActive
                    ? 'bg-black text-white border-black font-medium'
                    : 'border-black/20 text-black/60 hover:text-black hover:border-black/40'
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Section */}
      <div className="mb-8 border border-black/10">
        <div className="border-b border-black/10 bg-white p-4">
          <h2 className="text-lg font-medium text-black">JSON Input</h2>
        </div>
        <div className="p-4">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setActiveExample(null);
              setError(null);
              setTokens([]);
              setParsedData(null);
            }}
            className="w-full h-32 p-3 font-mono text-sm border border-black/20 focus:outline-none focus:border-black/40 bg-white"
            placeholder='Enter JSON here, e.g., {"name": "world"}'
          />
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleAnalyze}
              className="px-5 py-2.5 bg-black text-white text-sm font-medium font-mono hover:bg-black/90 transition-colors"
            >
              Analyze
            </button>
            {error && (
              <div className="text-sm text-red-600 font-mono">
                Error: {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Tabs */}
      {tokens.length > 0 && (
        <div className="mb-6 border-b border-black/10">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('tokenization')}
              className={`px-4 py-2 text-sm font-mono border-b-2 transition-colors ${
                activeTab === 'tokenization'
                  ? 'border-black text-black font-medium'
                  : 'border-transparent text-black/60 hover:text-black'
              }`}
            >
              Tokenization
            </button>
            <button
              onClick={() => setActiveTab('parsing')}
              className={`px-4 py-2 text-sm font-mono border-b-2 transition-colors ${
                activeTab === 'parsing'
                  ? 'border-black text-black font-medium'
                  : 'border-transparent text-black/60 hover:text-black'
              }`}
            >
              Parsing Tree
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-8">
        {activeTab === 'tokenization' && tokens.length > 0 && (
          <TokenizationViewer tokens={tokens} input={input} />
        )}

        {activeTab === 'parsing' && parsedData !== null && (
          <ParsingTreeViewer data={parsedData} />
        )}
      </div>
    </main>
  );
}

