import Link from "next/link";
import { CodeBlock } from '@/components/code-block';

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 md:py-24 relative z-10">
        {/* Hero Section */}
        <div className="mb-20 md:mb-32">
          <h1 className="text-5xl md:text-7xl font-medium text-black mb-6 leading-[1.1] tracking-tight">
            Fast, minimal
            <br />
            JSON parser
          </h1>
          <p className="text-lg text-black/60 mb-8 max-w-2xl leading-relaxed font-mono">
            A lightweight, performant JSON parser built for modern applications. 
            Clean API, zero dependencies, maximum speed.
          </p>
          <div className="flex gap-3">
            <Link href="/docs" className="px-5 py-2.5 bg-black text-white text-sm font-medium font-mono hover:bg-black/90 transition-colors">
              Get Started
            </Link>
            <Link href="/docs" className="px-5 py-2.5 border border-black/20 text-black text-sm font-medium font-mono hover:bg-black/5 transition-colors">
              View Docs
            </Link>
          </div>
        </div>

        {/* Feature Grid with Intersecting Borders */}
        <div className="grid grid-cols-1 md:grid-cols-3 mb-20">
          {/* First Box - Top Left */}
          <div className="border-t border-l border-black/10 p-8 md:border-r-0">
            <div className="w-10 h-10 border border-black/10 mb-4 flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-black mb-2">Lightning Fast</h3>
            <p className="text-base text-black/60 leading-relaxed font-mono">
              Optimized for performance with minimal overhead and maximum throughput.
            </p>
          </div>

          {/* Second Box - Top Middle */}
          <div className="border-t border-l border-black/10 p-8 md:border-r-0">
            <div className="w-10 h-10 border border-black/10 mb-4 flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-black mb-2">Zero Dependencies</h3>
            <p className="text-base text-black/60 leading-relaxed font-mono">
              Built from scratch with no external dependencies. Keep your bundle size minimal.
            </p>
          </div>

          {/* Third Box - Top Right */}
          <div className="border-t border-l border-r border-black/10 p-8">
            <div className="w-10 h-10 border border-black/10 mb-4 flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-black mb-2">Type Safe</h3>
            <p className="text-base text-black/60 leading-relaxed font-mono">
              Full TypeScript support with excellent type inference and IntelliSense.
            </p>
          </div>

          {/* Bottom row - invisible spacers to complete the grid */}
          <div className="border-b border-l border-black/10 md:border-r-0 hidden md:block"></div>
          <div className="border-b border-l border-black/10 md:border-r-0 hidden md:block"></div>
          <div className="border-b border-l border-r border-black/10 hidden md:block"></div>
        </div>

        {/* Code Example */}
        <CodeBlock
          title="Quick Start"
          code={`import { parseJSON } from 'tinyjson-parser';

const json = '{"name": "world"}';
const result = parseJSON(json);
// { name: "world" }`}
        />
    </main>
  );
}
