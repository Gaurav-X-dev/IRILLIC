"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Theme 1 scroll reveal: elements with `.reveal` fade/rise in when they enter
 * the viewport, with a gentle stagger between siblings. Re-runs per route.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)"),
    );

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
