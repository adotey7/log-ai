import React from "react";
import { LogoIcon } from "./logo";

interface NavItem {
  id: string;
  title: string;
}

interface SidebarProps {
  items: NavItem[];
  activeSection: string;
}

export default function Sidebar({ items, activeSection }: SidebarProps) {
  return (
    <aside className="hidden lg:block w-[260px] shrink-0 sticky top-0 h-screen border-r border-border bg-bg overflow-y-auto">
      <div className="px-5 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-1">
            <LogoIcon />
            <span className="font-semibold text-sm tracking-tight text-text">
              AI Logger
            </span>
          </div>
          <p className="text-[11px] text-text-muted mt-1 ml-9.5 font-mono tracking-wide">
            Documentation
          </p>
        </div>

        <nav className="space-y-0.5">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-link ${activeSection === item.id ? "active" : ""}`}
            >
              {item.title}
            </a>
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-text-dim">
            <span className="status-dot" />
            <span className="font-mono">v0.0.1</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
