"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <html lang="en">
      <body>
        <main className="grid min-h-screen place-items-center bg-[#f5f8fa] p-6">
          <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#0091d0]">
              IRILLIC
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-[#120304]">
              The service is temporarily unavailable
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The request could not be completed safely. Please try again; if
              the problem continues, contact the technical administrator.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-lg bg-[#0091d0] px-6 py-3 text-sm font-semibold text-white"
            >
              Try again
            </button>
            {error.digest ? (
              <p className="mt-5 text-xs text-slate-400">
                Reference: {error.digest}
              </p>
            ) : null}
          </section>
        </main>
      </body>
    </html>
  );
}
