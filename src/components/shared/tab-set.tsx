"use client";

import { useRef, useState } from "react";
import { useHashChange } from "@/hooks/use-hash-change";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  panel: React.ReactNode;
  /** Deep-link hash (without "#") that selects this tab */
  hash?: string;
}

interface TabSetProps {
  items: TabItem[];
  label: string;
  className?: string;
  /** Keep the URL hash in sync and react to #hash deep links */
  hashSync?: boolean;
}

/** Accessible tabs (Theme 1 .tabs) with roving tabindex and arrow-key navigation. */
export function TabSet({ items, label, className = "tabs", hashSync = false }: TabSetProps) {
  const [selected, setSelected] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useHashChange((hash) => {
    if (!hashSync || !hash) return;
    const index = items.findIndex((item) => item.hash === hash);
    if (index === -1) return;
    setSelected(index);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rootRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  });

  const select = (index: number, focus = false) => {
    setSelected(index);
    if (focus) tabRefs.current[index]?.focus();
    const hash = items[index].hash;
    if (hashSync && hash) {
      window.history.replaceState(window.history.state, "", `#${hash}`);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = items.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = index === last ? 0 : index + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = index === 0 ? last : index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next !== null) {
      e.preventDefault();
      select(next, true);
    }
  };

  return (
    <div className={className} ref={rootRef}>
      <div className="tabs__list" role="tablist" aria-label={label}>
        {items.map((item, i) => (
          <button
            key={item.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            id={`tab-${item.id}`}
            aria-controls={`panel-${item.id}`}
            aria-selected={i === selected}
            tabIndex={i === selected ? 0 : -1}
            type="button"
            onClick={() => select(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, i) => (
        <div
          key={item.id}
          className="tabs__panel"
          role="tabpanel"
          id={`panel-${item.id}`}
          aria-labelledby={`tab-${item.id}`}
          tabIndex={0}
          hidden={i !== selected}
        >
          {item.panel}
        </div>
      ))}
    </div>
  );
}
