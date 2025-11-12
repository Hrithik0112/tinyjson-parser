import { CodeBlock } from '@/components/code-block';

export function InstallationSection() {
  return (
    <section id="installation" className="mb-16">
      <h2 className="text-3xl font-medium text-black mb-6">Installation</h2>
      <CodeBlock
        code={`npm install tinyjson-parser
# or
pnpm add tinyjson-parser
# or
yarn add tinyjson-parser`}
        language="bash"
      />
    </section>
  );
}

