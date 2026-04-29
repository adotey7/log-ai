"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-[10px] font-mono uppercase tracking-widest text-text-dim">
        Error
      </p>
      <h1 className="text-xl font-semibold text-text">Something went wrong</h1>
      <p className="text-sm text-text-muted max-w-md">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-md bg-accent/10 border border-accent/20 px-4 py-2 text-sm text-accent hover:bg-accent/15 transition-colors"
      >
        Try again
      </button>
    </main>
  );
}
