"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CommandItem {
  label: string;
  href: string;
  icon: LucideIcon;
  group: string;
}

/**
 * Ctrl/Cmd+K navigation for the panel. A dialog rather than an inline dropdown,
 * so the result list has room and keyboard selection is unambiguous.
 */
export function CommandPalette({
  items,
  open,
  onClose,
}: {
  items: CommandItem[];
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      `${item.label} ${item.group}`.toLowerCase().includes(term),
    );
  }, [items, query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setCursor(0);
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  if (!open) return null;

  function go(item: CommandItem | undefined) {
    if (!item) return;
    router.push(item.href);
    onClose();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") return onClose();
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((value) => Math.min(value + 1, matches.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((value) => Math.max(value - 1, 0));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      go(matches[cursor]);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the admin panel"
        onKeyDown={onKeyDown}
        className="animate-rise relative w-full max-w-xl overflow-hidden rounded-2xl bg-ad-raised shadow-ad-lg ring-1 ring-ad-line"
      >
        <div className="flex items-center gap-3 border-b border-ad-hairline px-4">
          <Search size={17} className="text-ad-faint" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Jump to a section…"
            aria-label="Search the admin panel"
            autoComplete="off"
            className="h-14 flex-1 border-0 bg-transparent text-sm text-ad-ink outline-none placeholder:text-ad-faint focus:ring-0"
          />
          <kbd className="rounded ring-1 ring-ad-line px-1.5 py-0.5 text-[10px] text-ad-faint">
            Esc
          </kbd>
        </div>

        <ul className="max-h-80 overflow-y-auto p-2">
          {matches.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <button
                  type="button"
                  onMouseEnter={() => setCursor(index)}
                  onClick={() => go(item)}
                  aria-current={index === cursor ? "true" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    index === cursor
                      ? "bg-ad-accent-soft text-ad-accent"
                      : "text-ad-muted"
                  }`}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span className="flex-1 font-medium">{item.label}</span>
                  <span className="text-[10px] uppercase tracking-wider text-ad-faint">
                    {item.group}
                  </span>
                  {index === cursor ? (
                    <CornerDownLeft
                      size={13}
                      className="text-ad-faint"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
          {matches.length === 0 ? (
            <li className="px-3 py-10 text-center text-xs text-ad-faint">
              Nothing matches “{query}”.
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
