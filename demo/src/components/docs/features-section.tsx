export function FeaturesSection() {
  return (
    <section id="features" className="mb-16">
      <h2 className="text-3xl font-medium text-black mb-6">Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-black/10 p-6">
          <h3 className="text-lg font-medium text-black mb-3">⚡ Performance</h3>
          <p className="text-base text-black/60 leading-relaxed font-mono">
            Optimized tokenizer and parser for maximum speed with minimal memory overhead.
          </p>
        </div>
        <div className="border border-black/10 p-6">
          <h3 className="text-lg font-medium text-black mb-3">📦 Zero Dependencies</h3>
          <p className="text-base text-black/60 leading-relaxed font-mono">
            Built from scratch with no external dependencies. Keep your bundle size minimal.
          </p>
        </div>
        <div className="border border-black/10 p-6">
          <h3 className="text-lg font-medium text-black mb-3">🔍 Detailed Errors</h3>
          <p className="text-base text-black/60 leading-relaxed font-mono">
            Precise error messages with line and column numbers for easy debugging.
          </p>
        </div>
        <div className="border border-black/10 p-6">
          <h3 className="text-lg font-medium text-black mb-3">🌊 Streaming Support</h3>
          <p className="text-base text-black/60 leading-relaxed font-mono">
            Handle large JSON files incrementally with the streaming parser API.
          </p>
        </div>
        <div className="border border-black/10 p-6">
          <h3 className="text-lg font-medium text-black mb-3">✅ Strict Compliance</h3>
          <p className="text-base text-black/60 leading-relaxed font-mono">
            Enforces strict JSON specification compliance, rejecting invalid JSON.
          </p>
        </div>
        <div className="border border-black/10 p-6">
          <h3 className="text-lg font-medium text-black mb-3">📝 TypeScript</h3>
          <p className="text-base text-black/60 leading-relaxed font-mono">
            Full TypeScript support with excellent type inference and IntelliSense.
          </p>
        </div>
      </div>
    </section>
  );
}

