"use client";

import React, { useState } from "react";

interface CodeBlockProps {
  children: string;
  filename?: string;
  language?: string;
}

export default function CodeBlock({
  children,
  filename,
  language,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="my-6 group">
      <div className="flex items-center justify-between bg-code-bar border border-code-border border-b-0 rounded-t-md px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          {filename ? (
            <span className="text-xs font-mono text-text-secondary ml-2">
              {filename}
            </span>
          ) : language ? (
            <span className="text-xs font-mono text-text-dim uppercase ml-2">
              {language}
            </span>
          ) : (
            <span className="text-xs font-mono text-text-dim uppercase ml-2">
              terminal
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-text-muted hover:text-accent transition-colors cursor-pointer flex items-center gap-1.5 pr-0.5"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-accent">Copied</span>
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="!rounded-t-none !border-t-0 !mt-0">
        <code>{children}</code>
      </pre>
    </div>
  );
}
