"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Takes the editor back to the sign-in screen when their session has gone.
 *
 * A panel left open past the session's eight hours still looks signed in:
 * the page was rendered while the cookie was valid, and nothing re-checks it.
 * The first clue was whatever the editor did next failing with a bare
 * "Unauthenticated" toast — a dead end, with the work still on screen and no
 * way to tell that signing in again was the answer.
 *
 * Rather than teach all twenty-odd request sites the same lesson, the answer
 * is read once, here: any 401 from the panel's own API means the session is
 * over, whichever screen asked. The response is passed through untouched, so
 * each screen's existing error handling still runs.
 */

const PATCHED = Symbol.for("irillic.session-guard");

type Guarded = typeof window.fetch & { [PATCHED]?: boolean };

/** Our own API, on this origin — not an upload to somewhere else. */
function isPanelRequest(input: RequestInfo | URL): boolean {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  try {
    const resolved = new URL(url, window.location.origin);
    return (
      resolved.origin === window.location.origin &&
      resolved.pathname.startsWith("/api/")
    );
  } catch {
    return false;
  }
}

export function SessionGuard() {
  const router = useRouter();

  useEffect(() => {
    const original = window.fetch as Guarded;
    if (original[PATCHED]) return;

    const guarded: Guarded = async (input, init) => {
      const response = await original(input, init);
      if (response.status === 401 && isPanelRequest(input)) {
        // The sign-in request itself answers 401 for a wrong password; that
        // is not an expired session and must not bounce the page.
        const url = new URL(
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.href
              : input.url,
          window.location.origin,
        );
        if (!url.pathname.startsWith("/api/auth/"))
          router.replace("/login?reason=session");
      }
      return response;
    };
    guarded[PATCHED] = true;
    window.fetch = guarded;

    return () => {
      window.fetch = original;
    };
  }, [router]);

  return null;
}
