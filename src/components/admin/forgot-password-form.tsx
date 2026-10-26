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
    <form className="mt-9" onSubmit={submit}>
      <label className="block">
        <span className="mb-2 block text-xs font-semibold text-ad-muted">
          Administrator email
        </span>
        <span className="relative block">
          <Mail
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            placeholder="admin@irillic.com"
            className="h-12 w-full rounded-xl bg-ad-sunken pl-11 pr-4 text-sm outline-none "
          />
        </span>
      </label>
      {message ? (
        <p className="mt-4 rounded-xl bg-ad-accent-soft p-3 text-xs text-ad-accent">
          {message}
        </p>
      ) : null}
      <button
        disabled={busy}
        className="mt-5 h-12 w-full rounded-xl bg-[#0091d0] text-sm font-semibold text-white shadow-lg shadow-cyan-600/15 hover:bg-[#007ab0] disabled:opacity-50"
      >
        {busy ? "Sending…" : "Send secure reset link"}
      </button>
    </form>
  );
}
