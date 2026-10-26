"use client";

import { useEffect } from "react";

export default function ErrorPage({
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
    <main
      id="main"
      className="grid min-h-[70vh] place-items-center bg-[#f5f8fa] p-6"
    >
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#0091d0]">
          Unable to load this section
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-[#120304]">
          Please try again
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          No partial or invalid content was displayed. The issue has been logged
          for diagnosis.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-[#0091d0] px-6 py-3 text-sm font-semibold text-white"
        >
          Reload section
        </button>
      </section>
    </main>
  );
}
