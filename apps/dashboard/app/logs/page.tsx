"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";

interface Log {
  id: string;
  message: string;
  created_at: string;
  explanation?: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      const searchParams = new URLSearchParams();
      if (search) searchParams.set("search", search);

      const res = await apiFetch(`/logs?${searchParams.toString()}`);
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
        return;
      }
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    fetchLogs();
  }

  function handleSignOut() {
    localStorage.removeItem("token");
    document.cookie = "token=; Max-Age=0; path=/";
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="container mx-auto max-w-5xl p-6">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-5xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Logs</h1>
        <button
          onClick={handleSignOut}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-border bg-card px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </form>

      <div className="space-y-2">
        {logs.length === 0 ? (
          <p className="text-muted-foreground">No logs found.</p>
        ) : (
          logs.map((log) => (
            <Link
              key={log.id}
              href={`/logs/${log.id}`}
              className="flex items-center justify-between rounded-md border border-border bg-card p-4 hover:bg-accent transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{log.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
              {log.explanation && (
                <span className="ml-4 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                  Explained
                </span>
              )}
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
