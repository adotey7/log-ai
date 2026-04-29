import React from "react";

interface TocItem {
  id: string;
  title: string;
}

interface TableOfContentsProps {
  items: TocItem[];
  activeSection: string;
}

export default function TableOfContents({
  items,
  activeSection,
}: TableOfContentsProps) {
  return (
    <aside className="hidden xl:block w-[200px] shrink-0 sticky top-0 h-screen overflow-y-auto">
      <div className="px-4 py-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-dim mb-4 px-2">
          On this page
        </p>
        <nav className="space-y-0.5 border-l border-border">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`toc-link ${
                activeSection === item.id ? "toc-link-active" : ""
              }`}
            >
              {item.title}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
