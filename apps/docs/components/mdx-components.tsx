import React from "react";

export function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-2xl font-semibold tracking-tight mt-16 mb-5 scroll-mt-8 group"
    >
      <a
        href={`#${id}`}
        className="heading-anchor"
        aria-label={`Link to ${children}`}
      >
        #
      </a>
      {children}
    </h2>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold text-text mt-8 mb-3 tracking-tight">
      {children}
    </h3>
  );
}

export function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-text-secondary leading-relaxed mb-4">{children}</p>;
}

const calloutIcons = {
  info: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-accent shrink-0 mt-0.5"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
  warning: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-warning shrink-0 mt-0.5"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
  danger: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-danger shrink-0 mt-0.5"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6" />
      <path d="M9 9l6 6" />
    </svg>
  ),
};

export function Callout({
  variant,
  children,
}: {
  variant: "info" | "warning" | "danger";
  children: React.ReactNode;
}) {
  return (
    <div className={`callout callout-${variant}`}>
      {calloutIcons[variant]}
      <div>{children}</div>
    </div>
  );
}

export function ServiceCard({
  name,
  desc,
  port,
}: {
  name: string;
  desc: string;
  port: string | null;
}) {
  return (
    <div className="service-card border border-border rounded-md p-4 bg-surface transition-all duration-200">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-medium text-sm text-text">{name}</span>
        {port && (
          <span className="font-mono text-[11px] text-accent bg-accent/10 px-1.5 py-0.5 rounded">
            :{port}
          </span>
        )}
      </div>
      <p className="text-xs text-text-muted">{desc}</p>
    </div>
  );
}

export function CredentialCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border border-border rounded-md p-3 bg-surface transition-colors duration-200 hover:border-border-hover">
      <div className="text-[10px] font-mono uppercase tracking-wider text-text-dim mb-1.5">
        {label}
      </div>
      <code className="text-xs bg-transparent border-0 p-0 text-text-secondary">
        {value}
      </code>
    </div>
  );
}
