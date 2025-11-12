'use client';

import { Token, TokenType, getLineColumn } from '@/lib/simple-tokenizer';

interface TokenizationViewerProps {
  tokens: Token[];
  input: string;
}

const tokenTypeColors: Record<TokenType, string> = {
  [TokenType.LEFT_BRACE]: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  [TokenType.RIGHT_BRACE]: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  [TokenType.LEFT_BRACKET]: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  [TokenType.RIGHT_BRACKET]: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  [TokenType.COLON]: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
  [TokenType.COMMA]: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
  [TokenType.STRING]: 'bg-green-500/20 text-green-700 border-green-500/30',
  [TokenType.NUMBER]: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
  [TokenType.TRUE]: 'bg-indigo-500/20 text-indigo-700 border-indigo-500/30',
  [TokenType.FALSE]: 'bg-indigo-500/20 text-indigo-700 border-indigo-500/30',
  [TokenType.NULL]: 'bg-slate-500/20 text-slate-700 border-slate-500/30',
};

export function TokenizationViewer({ tokens, input }: TokenizationViewerProps) {
  if (tokens.length === 0) {
    return (
      <div className="border border-black/10 p-8 text-center">
        <p className="text-black/60 font-mono">No tokens to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-black/10 p-4 bg-black/5">
        <h3 className="text-sm font-medium text-black/40 mb-2 uppercase tracking-wider font-mono">
          Token Summary
        </h3>
        <p className="text-sm text-black/60 font-mono">
          Total tokens: <span className="text-black font-medium">{tokens.length}</span>
        </p>
      </div>

      <div className="border border-black/10">
        <div className="border-b border-black/10 bg-white p-4">
          <h3 className="text-lg font-medium text-black">Tokenization Steps</h3>
        </div>
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {tokens.map((token, index) => {
            const { line, column } = getLineColumn(input, token.start);
            return (
              <div
                key={index}
                className={`border rounded p-3 ${tokenTypeColors[token.type]}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-medium text-black/40">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium font-mono">
                        {token.type}
                      </span>
                    </div>
                    <div className="text-sm font-mono mt-1">
                      <span className="text-black/80">Value:</span>{' '}
                      <span className="font-medium">{JSON.stringify(token.value)}</span>
                    </div>
                    <div className="text-xs font-mono mt-1 text-black/60">
                      Position: {token.start}-{token.end} (Line {line}, Col {column})
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

