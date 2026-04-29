"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";

interface Log {
  id: string;
  message: string;
  stack?: string;
  url?: string;
  metadata: Record<string, unknown>;
  explanation?: string;
  causes?: string[];
  fix?: string;
  created_at: string;
}

export default function LogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [log, setLog] = useState<Log | null>(null);
  const [loading, setLoading] = useState(true);
  const [explaining, setExplaining] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchLog(controller.signal);
    return () => controller.abort();
  }, [params.id]);

  async function fetchLog(signal?: AbortSignal) {
    try {
      const res = await apiFetch(`/logs/${params.id}`, { signal });
      const data = await res.json();
      setLog(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
        return;
      }
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("Failed to fetch log:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleExplain() {
    if (!log) return;

    setExplaining(true);
    try {
      const res = await apiFetch(`/logs/${log.id}/explain`, {
        method: "POST",
      });
      const data = await res.json();
      setLog({ ...log, ...data });
    } catch (err) {
      console.error("Failed to explain:", err);
    } finally {
      setExplaining(false);
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto max-w-3xl p-6">
        <div className="space-y-4">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="h-48 animate-pulse rounded bg-muted" />
        </div>
      </main>
    );
  }

  if (!log) {
    return (
      <main className="container mx-auto max-w-3xl p-6">
        <p className="text-muted-foreground">Log not found.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <Link
          href="/logs"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to logs
        </Link>
      </div>

      <div className="space-y-6">
        <div className="rounded-md border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Error Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Message
              </label>
              <p className="mt-1 text-sm">{log.message}</p>
            </div>
            {log.stack && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Stack Trace
                </label>
                <pre className="mt-1 overflow-x-auto rounded bg-background p-3 text-xs">
                  {log.stack}
                </pre>
              </div>
            )}
            {log.url && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  URL
                </label>
                <p className="mt-1 text-sm">{log.url}</p>
              </div>
            )}
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Metadata
                </label>
                <pre className="mt-1 overflow-x-auto rounded bg-background p-3 text-xs">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">AI Explanation</h2>
            {!log.explanation && (
              <button
                onClick={handleExplain}
                disabled={explaining}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {explaining ? "Analyzing..." : "Explain Error"}
              </button>
            )}
          </div>

          {log.explanation ? (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Explanation
                </label>
                <p className="mt-1 text-sm leading-relaxed">
                  {log.explanation}
                </p>
              </div>
              {log.causes && log.causes.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Possible Causes
                  </label>
                  <ul className="mt-2 space-y-2">
                    {log.causes.map((cause, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {log.fix && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Suggested Fix
                  </label>
                  <div className="mt-2 rounded bg-background p-4">
                    <p className="text-sm leading-relaxed">{log.fix}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Click "Explain Error" to get an AI-powered analysis of this
              error.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
