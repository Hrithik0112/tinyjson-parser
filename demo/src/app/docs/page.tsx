import { TableOfContents } from '@/components/docs/table-of-contents';
import { InstallationSection } from '@/components/docs/installation-section';
import { BasicUsageSection } from '@/components/docs/basic-usage-section';
import { StreamingParserSection } from '@/components/docs/streaming-parser-section';
import { ErrorHandlingSection } from '@/components/docs/error-handling-section';
import { FeaturesSection } from '@/components/docs/features-section';
import { ApiReferenceSection } from '@/components/docs/api-reference-section';

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 md:py-16 relative z-10">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-medium text-black mb-4 leading-tight tracking-tight">
          Documentation
        </h1>
        <p className="text-lg text-black/60 leading-relaxed font-mono">
          Complete guide to using tinyjson-parser
        </p>
      </div>

      <TableOfContents />
      <InstallationSection />
      <BasicUsageSection />
      <StreamingParserSection />
      <ErrorHandlingSection />
      <FeaturesSection />
      <ApiReferenceSection />
    </main>
  );
}
