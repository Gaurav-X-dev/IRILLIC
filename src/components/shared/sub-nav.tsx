"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SubNavProps {
  items: { id: string; label: string }[];
  label?: string;
}

/** Sticky "On this page" navigation that highlights the section in view. */
export function SubNav({ items, label = "On this page" }: SubNavProps) {
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    items.forEach(({ id }) => {
      const target = document.getElementById(id);
      if (target) observer.observe(target);
    });
    return () => observer.disconnect();
  }, [items]);

  /* keep the active link visible in the horizontally scrolling list */
  useEffect(() => {
    const list = listRef.current;
    const link = active ? linkRefs.current[active] : null;
    if (list && link)
      list.scrollLeft =
        link.offsetLeft - list.clientWidth / 2 + link.clientWidth / 2;
  }, [active]);

  return (
    <nav className="subnav" aria-label={label}>
      <div className="wrap subnav__inner">
        <p className="subnav__label">{label}</p>
        <ul ref={listRef}>
          {items.map((item) => (
            <li key={item.id}>
              <a
                ref={(el) => {
                  linkRefs.current[item.id] = el;
                }}
                href={`#${item.id}`}
                className={cn(active === item.id && "is-active")}
                aria-current={active === item.id ? "true" : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
