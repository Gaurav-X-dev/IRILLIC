"use client";
import { useState } from "react";
import { Mail } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await response.json();
    setMessage(result.message || result.error);
    setBusy(false);
  }
  return (
    <form className="mt-8" onSubmit={submit}>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-ad-muted">
          Administrator email
        </span>
        <span className="relative block">
          <Mail
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ad-faint"
            size={16}
            aria-hidden="true"
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            placeholder="admin@irillic.com"
            className="h-12 w-full pl-11 pr-4 text-sm"
          />
        </span>
      </label>
      {message ? (
        <p
          role="status"
          className="animate-rise mt-4 rounded-xl bg-ad-accent-soft p-3.5 text-xs leading-5 text-ad-accent"
        >
          {message}
        </p>
      ) : null}
      <button
        disabled={busy}
        className={`mt-5 h-12 w-full rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60 ${busy ? "is-busy bg-ad-accent" : "bg-ad-accent hover:brightness-110"}`}
      >
        {busy ? "Sending…" : "Send secure reset link"}
      </button>
    </form>
  );
}
