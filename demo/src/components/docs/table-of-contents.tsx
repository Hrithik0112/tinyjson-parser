export function TableOfContents() {
  return (
    <div className="mb-16 border border-black/10 p-6">
      <h2 className="text-sm font-medium text-black/40 mb-4 uppercase tracking-wider font-mono">
        Contents
      </h2>
      <nav className="space-y-2">
        <a href="#installation" className="block text-base text-black/60 hover:text-black transition-colors font-mono">
          Installation
        </a>
        <a href="#basic-usage" className="block text-base text-black/60 hover:text-black transition-colors font-mono">
          Basic Usage
        </a>
        <a href="#streaming-parser" className="block text-base text-black/60 hover:text-black transition-colors font-mono">
          Streaming Parser
        </a>
        <a href="#error-handling" className="block text-base text-black/60 hover:text-black transition-colors font-mono">
          Error Handling
        </a>
        <a href="#features" className="block text-base text-black/60 hover:text-black transition-colors font-mono">
          Features
        </a>
        <a href="#api-reference" className="block text-base text-black/60 hover:text-black transition-colors font-mono">
          API Reference
        </a>
      </nav>
    </div>
  );
}

