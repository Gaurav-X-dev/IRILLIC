"use client";

import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
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
    <div className="animate-rise">
      <p className="text-[11px] font-bold uppercase tracking-[.2em] text-ad-accent">
        Secure administration
      </p>
      <h1 className="mt-2.5 text-[30px] font-bold leading-tight tracking-[-.025em] text-ad-ink">
        Welcome back
      </h1>
      <p className="mt-2.5 text-sm leading-6 text-ad-muted">
        Sign in with your administrator credentials to continue.
      </p>

      <form className="mt-8 space-y-4" onSubmit={submit}>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-ad-muted">
            Email address
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
              autoComplete="username"
              placeholder="you@irillic.com"
              className="h-12 w-full pl-11 pr-4 text-sm"
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-ad-muted">
              Password
            </span>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-ad-accent hover:underline"
            >
              Forgot password?
            </Link>
          </span>
          <span className="relative block">
            <LockKeyhole
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ad-faint"
              size={16}
              aria-hidden="true"
            />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className="h-12 w-full pl-11 pr-12 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="tap-target absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ad-faint transition-colors hover:bg-ad-sunken hover:text-ad-muted"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </label>

        <label className="flex cursor-pointer items-center gap-2.5 py-1 text-xs text-ad-muted">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-4 w-4 accent-sky-500"
          />
          Keep me signed in on this device
        </label>

        {error ? (
          <p
            role="alert"
            className="animate-pop rounded-xl bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-500 ring-1 ring-rose-500/25"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition-colors disabled:cursor-wait disabled:opacity-70 ${loading ? "is-busy bg-ad-accent" : "bg-ad-accent hover:brightness-110"}`}
        >
          {loading ? "Signing in…" : "Sign in securely"}
          {loading ? null : <ArrowRight size={16} aria-hidden="true" />}
        </button>
      </form>

      <div className="mt-7 flex items-start gap-3 rounded-xl bg-ad-sunken p-4 ring-1 ring-ad-line">
        <ShieldCheck
          size={16}
          className="mt-0.5 shrink-0 text-emerald-500"
          aria-hidden="true"
        />
        <p className="text-[11px] leading-5 text-ad-muted">
          Sessions are encrypted, repeated failures are rate limited, and every
          sign-in is recorded with its device. Never share your credentials.
        </p>
      </div>

      <p className="mt-8 text-center text-[11px] text-ad-faint">
        Having trouble? Contact your technical administrator.
      </p>
    </div>
  );
}
