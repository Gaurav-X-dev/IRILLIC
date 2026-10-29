"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

type Tone = "success" | "error";
type Toast = { id: number; tone: Tone; message: string };

/**
 * Confirmations and failures used to print under whichever control caused
 * them, where a long page could scroll them out of sight entirely. They now
 * surface in one place the eye already watches after an action.
 */
const ToastContext = createContext<(tone: Tone, message: string) => void>(
  () => {},
);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback(
    (id: number) => setToasts((list) => list.filter((t) => t.id !== id)),
    [],
  );

  const push = useCallback((tone: Tone, message: string) => {
    const text = message.trim();
    if (!text) return;
    // Three at once is all that stays readable; older ones give way.
    setToasts((list) => [
      ...list.slice(-2),
      { id: Date.now() + Math.random(), tone, message: text },
    ]);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  const failed = toast.tone === "error";
  const Icon = failed ? AlertTriangle : CheckCircle2;

  useEffect(() => {
    // A failure is worth reading twice, so it lingers.
    const timer = window.setTimeout(
      () => onDismiss(toast.id),
      failed ? 8000 : 4000,
    );
    return () => window.clearTimeout(timer);
  }, [toast.id, failed, onDismiss]);

  return (
    <div
      className={`animate-rise pointer-events-auto flex w-full max-w-[380px] items-start gap-3 rounded-xl bg-ad-raised p-3.5 shadow-ad-lg ring-1 ${
        failed ? "ring-red-300" : "ring-ad-line"
      }`}
    >
      <Icon
        size={18}
        aria-hidden="true"
        className={`mt-px shrink-0 ${failed ? "text-red-600" : "text-emerald-600"}`}
      />
      <p className="min-w-0 flex-1 text-[13px] leading-5 text-ad-ink">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-md p-0.5 text-ad-faint transition-colors hover:text-ad-ink"
        aria-label="Dismiss"
      >
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
