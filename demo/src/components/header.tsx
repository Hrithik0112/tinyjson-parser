import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="relative z-10 bg-white">
      <div className="px-6 py-4 border-b border-black/10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/json.svg" alt="tinyjson-parser" width={32} height={32} />
            <div className="text-base font-medium text-black">tinyjson-parser</div>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link href="/docs" className="text-sm text-black/60 hover:text-black transition-colors">
              Docs
            </Link>
            <a href="#" className="text-sm text-black/60 hover:text-black transition-colors">
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

