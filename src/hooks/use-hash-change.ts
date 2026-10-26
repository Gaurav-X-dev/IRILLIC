"use client";

import { useEffect, useRef } from "react";

/**
 * Calls `onHash` with the current location hash (without "#") on mount,
 * on native `hashchange`/`popstate`, and after in-app link clicks.
 * Next.js navigates hash links with `history.pushState`, which never fires
 * `hashchange`, so same-page deep links (e.g. /clinical-applications#gastro)
 * are picked up from the click instead.
 */
export function useHashChange(
  onHash: (hash: string, initial: boolean) => void,
) {
  const handler = useRef(onHash);
  handler.current = onHash;

  useEffect(() => {
    let last = window.location.hash;
    const emit = (initial: boolean) => {
      last = window.location.hash;
      handler.current(last.slice(1), initial);
    };
    const check = () => {
      if (window.location.hash !== last) emit(false);
    };
    // Next.js updates the URL inside a React transition, so it can land a few frames after the click
    const timers: number[] = [];
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href*='#']");
      if (a)
        [0, 50, 150, 400].forEach((ms) =>
          timers.push(window.setTimeout(check, ms)),
        );
    };

    emit(true);
    window.addEventListener("hashchange", check);
    window.addEventListener("popstate", check);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", check);
      window.removeEventListener("popstate", check);
      document.removeEventListener("click", onClick);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);
}
