"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AlertTriangle, Info } from "lucide-react";

type ConfirmRequest = {
  title: string;
  /** What will happen, in the editor's terms, not the database's. */
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive actions are styled as such and need a deliberate click. */
  tone?: "danger" | "default";
};

type Pending = ConfirmRequest & { resolve: (ok: boolean) => void };

/**
 * The browser's own confirm() shows the hostname, cannot be styled, and
 * blocks the page while it is open. A panel that is otherwise themed should
 * not hand its most consequential moments to it.
 */
const ConfirmContext = createContext<
  (request: ConfirmRequest) => Promise<boolean>
>(async () => false);

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);

  const confirm = useCallback(
    (request: ConfirmRequest) =>
      new Promise<boolean>((resolve) => setPending({ ...request, resolve })),
    [],
  );

  const settle = useCallback(
    (ok: boolean) => {
      pending?.resolve(ok);
      setPending(null);
    },
    [pending],
  );

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending ? <ConfirmDialog pending={pending} onSettle={settle} /> : null}
    </ConfirmContext.Provider>
  );
}

function ConfirmDialog({
  pending,
  onSettle,
}: {
  pending: Pending;
  onSettle: (ok: boolean) => void;
}) {
  const danger = pending.tone === "danger";
  const Icon = danger ? AlertTriangle : Info;
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Escape is the expected way out of a dialog, and the cautious one.
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onSettle(false);
    };
    window.addEventListener("keydown", onKey);
    // Focus the action, so a keyboard user is not hunting for it. Cancel keeps
    // Escape and Shift+Tab, so nothing is one stray keypress from happening.
    confirmRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onSettle]);

  return (
    <div
      className="fixed inset-0 z-[150] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby={pending.message ? "confirm-message" : undefined}
      onMouseDown={(event) => {
        // Only a click on the backdrop itself dismisses; a drag that ends
        // there does not.
        if (event.target === event.currentTarget) onSettle(false);
      }}
    >
      <div className="animate-rise w-full max-w-[420px] overflow-hidden rounded-2xl bg-ad-raised shadow-ad-lg ring-1 ring-ad-line">
        <div className="flex gap-4 p-5 sm:p-6">
          <span
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
              danger
                ? "bg-red-500/12 text-red-600"
                : "bg-ad-accent-soft text-ad-accent"
            }`}
          >
            <Icon size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="confirm-title"
              className="text-base font-bold leading-6 text-ad-ink"
            >
              {pending.title}
            </h2>
            {pending.message ? (
              <p
                id="confirm-message"
                className="mt-1.5 text-[13px] leading-6 text-ad-muted"
              >
                {pending.message}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-ad-hairline bg-ad-sunken px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={() => onSettle(false)}
            className="tap-target h-10 rounded-xl px-4 text-xs font-semibold text-ad-muted ring-1 ring-ad-line transition-colors hover:bg-ad-surface hover:text-ad-ink"
          >
            {pending.cancelLabel ?? "Cancel"}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => onSettle(true)}
            className={`tap-target h-10 rounded-xl px-4 text-xs font-bold text-white transition-colors ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-ad-accent hover:brightness-110"
            }`}
          >
            {pending.confirmLabel ?? "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
