import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-[10px] font-mono uppercase tracking-widest text-text-dim">
        404
      </p>
      <h1 className="text-xl font-semibold text-text">Page not found</h1>
      <p className="text-sm text-text-muted max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-md bg-accent/10 border border-accent/20 px-4 py-2 text-sm text-accent hover:bg-accent/15 transition-colors"
      >
        Back to docs
      </Link>
    </main>
  );
}
