"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-900">Something went wrong!</h1>
      <p className="mt-4 text-lg text-gray-600">{error.message}</p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
      >
        Try Again
      </button>
    </main>
  );
}
