export function Footer() {
  return (
    <footer className="border-t border-black/10 mt-24 relative z-10 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-black/60">© 2025 tinyjson-parser</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-black/60 hover:text-black transition-colors">
              GitHub
            </a>
            <a href="#" className="text-sm text-black/60 hover:text-black transition-colors">
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

