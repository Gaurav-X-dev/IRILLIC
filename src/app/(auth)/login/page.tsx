"use client";

import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to sign in");
      router.replace("/dashboard");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[.2em] text-[#0087bd]">
        Secure administration
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">
        Welcome back
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Sign in with your administrator credentials to continue.
      </p>
      <form className="mt-9 space-y-5" onSubmit={submit}>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-slate-700">
            Email address
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
              autoComplete="username"
              placeholder="admin@irillic.com"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
            />
          </span>
        </label>
        <label className="block">
          <span className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Password
            </span>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[#0087bd] hover:underline"
            >
              Forgot password?
            </Link>
          </span>
          <span className="relative block">
            <LockKeyhole
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
            />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={1}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        <label className="flex items-center gap-2.5 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-[#0091d0]"
          />{" "}
          Keep me signed in on this device
        </label>
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
          >
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0091d0] text-sm font-semibold text-white shadow-lg shadow-cyan-600/15 transition hover:bg-[#007ab0] focus:outline-none focus:ring-4 focus:ring-cyan-500/20 disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in securely"}
        </button>
      </form>
      <div className="mt-7 flex items-start gap-3 rounded-xl border border-slate-200 bg-white/70 p-4">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" />
        <p className="text-[11px] leading-5 text-slate-500">
          Protected with secure sessions, rate limiting and monitored login
          activity. Never share your credentials.
        </p>
      </div>
      <p className="mt-8 text-center text-[11px] text-slate-400">
        Having trouble? Contact your technical administrator.
      </p>
    </div>
  );
}
