"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: params.get("token"), password }),
    });
    const result = await response.json();
    setDone(response.ok);
    setMessage(
      response.ok ? "Password updated. You can now sign in." : result.error,
    );
  }
  return (
    <div className="animate-rise">
      <p className="text-[11px] font-bold uppercase tracking-[.2em] text-ad-accent">
        Account recovery
      </p>
      <h1 className="mt-2.5 text-[30px] font-bold leading-tight tracking-[-.025em] text-ad-ink">
        Choose a new password
      </h1>
      <p className="mt-2.5 text-sm leading-6 text-ad-muted">
        Use at least 12 characters and avoid passwords used elsewhere.
      </p>
      {done ? (
        <div
          role="status"
          className="mt-8 rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-600 ring-1 ring-emerald-500/25"
        >
          {message}
          <Link
            href="/login"
            className="mt-4 block font-semibold text-ad-accent underline"
          >
            Return to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={12}
            autoComplete="new-password"
            className="h-12 w-full px-4 text-sm"
            placeholder="New password"
          />
          {message ? (
            <p
              role="alert"
              className="animate-pop mt-3 rounded-xl bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-500 ring-1 ring-rose-500/25"
            >
              {message}
            </p>
          ) : null}
          <button className="mt-5 h-12 w-full rounded-xl bg-ad-accent text-sm font-bold text-white transition-colors hover:brightness-110">
            Update password
          </button>
        </form>
      )}
    </div>
  );
}
