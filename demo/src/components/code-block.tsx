'use client';

import { useState, useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

interface CodeBlockProps {
  title?: string;
  code: string;
  language?: string;
}

export function CodeBlock({ title, code, language = 'typescript' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Map language prop to highlight.js language
  const hljsLanguage = language === 'typescript' ? 'typescript' : 
                       language === 'javascript' ? 'javascript' : 
                       language || 'typescript';

  return (
    <div className="border border-black/10">
      {title && (
        <div className="border-b border-black/10 px-6 py-4 flex items-center justify-between bg-white">
          <h2 className="text-2xl font-medium text-black">{title}</h2>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-black/60 hover:text-black border border-black/10 hover:border-black/20 transition-colors"
            aria-label="Copy code"
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
      )}
      <div className="relative bg-black border-t border-black/10">
        {!title && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-white/70 hover:text-white bg-black/50 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors"
              aria-label="Copy code"
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
        )}
        <div className="p-6 overflow-x-auto">
          <pre className="!bg-black !m-0 !p-0">
            <code
              ref={codeRef}
              className={`hljs language-${hljsLanguage} text-sm font-mono leading-relaxed`}
            >
              {code}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
