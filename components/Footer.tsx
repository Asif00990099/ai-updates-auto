export default function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 py-8">
      <div className="mx-auto max-w-5xl px-4 text-sm text-neutral-400">
        <p>
          AI Pulse aggregates and rewrites headlines from public AI sources. Every
          post links back to its original source.
        </p>
        <p className="mt-1">© {new Date().getFullYear()} AI Pulse.</p>
      </div>
    </footer>
  );
}
