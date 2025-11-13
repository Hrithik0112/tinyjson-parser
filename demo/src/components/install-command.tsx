'use client';

import { useState } from 'react';

export function InstallCommand() {
  const [copied, setCopied] = useState(false);
  const command = 'npm install tinyjson-parser';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex items-center gap-3 mt-4">
      <div className="flex-1 max-w-md border border-black/10 bg-white px-4 py-3 flex items-center justify-between group">
        <code className="text-sm font-mono text-black">{command}</code>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-black/60 hover:text-black border border-black/10 hover:border-black/20 transition-colors ml-4"
          aria-label="Copy command"
        >
          {copied ? (
            <>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Copied</span>
            </>
          ) : (
            <>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <a
        href="https://www.npmjs.com/package/tinyjson-parser"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-3 border border-black/20 text-black text-sm font-medium font-mono hover:bg-black/5 transition-colors whitespace-nowrap"
      >
        View on npm
      </a>
    </div>
  );
}
