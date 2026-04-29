import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 14, className = "text-accent" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={className}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

export function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-7 h-7 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center ${className}`}
    >
      <Logo />
    </div>
  );
}
