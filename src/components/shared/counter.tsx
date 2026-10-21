"use client";

import { useEffect, useRef, useState } from "react";

interface CounterProps {
  target: number;
  /** Render without thousands separators (e.g. ISO 13485) */
  plain?: boolean;
  duration?: number;
}

/** Counts up (easeOutQuart) the first time it scrolls into view. */
export function Counter({ target, plain = false, duration = 2200 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const format = (n: number) => (plain ? String(n) : n.toLocaleString("en-IN"));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setValue(target);
      return;
    }
    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          setValue(Math.round(target * (1 - Math.pow(1 - p, 4))));
          if (p < 1) frame = window.requestAnimationFrame(step);
        };
        frame = window.requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  return (
    <span ref={ref} className="counter">
      {format(value)}
    </span>
  );
}
