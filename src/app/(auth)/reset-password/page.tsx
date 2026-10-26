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
    <div>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[.2em] text-[#0087bd]">
        Account recovery
      </p>
      <h1 className="text-3xl font-bold text-slate-950">
        Choose a new password
      </h1>
      <p className="mt-3 text-sm text-slate-500">
        Use at least 12 characters and avoid passwords used elsewhere.
      </p>
      {done ? (
        <div className="mt-8 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          {message}
          <Link href="/login" className="mt-4 block font-semibold underline">
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
            className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-cyan-500"
            placeholder="New password"
          />
          {message ? (
            <p className="mt-3 text-xs text-red-600">{message}</p>
          ) : null}
          <button className="mt-5 h-12 w-full rounded-xl bg-[#0091d0] text-sm font-semibold text-white">
            Update password
          </button>
        </form>
      )}
    </div>
  );
}
