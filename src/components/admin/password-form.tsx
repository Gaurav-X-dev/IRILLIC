"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, KeyRound, X } from "lucide-react";

export function PasswordForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const rules = [
    ["At least 12 characters", newPassword.length >= 12],
    ["One uppercase letter", /[A-Z]/.test(newPassword)],
    ["One lowercase letter", /[a-z]/.test(newPassword)],
    ["One number", /[0-9]/.test(newPassword)],
    ["One symbol", /[^A-Za-z0-9]/.test(newPassword)],
  ] as const;
  const validNewPassword = rules.every(([, valid]) => valid);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const form = event.currentTarget;
    if (!validNewPassword) {
      setBusy(false);
      return setError("New password does not meet all security requirements.");
    }
    if (newPassword !== confirmPassword) {
      setBusy(false);
      return setError("New password and confirmation do not match.");
    }
    const data = new FormData(form);
    const response = await fetch("/api/admin/password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        currentPassword: data.get("currentPassword"),
        newPassword: data.get("newPassword"),
      }),
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok)
      return setError(result.error || "Password could not be changed.");
    form.reset();
    setNewPassword("");
    setConfirmPassword("");
    setMessage("Password changed. Other sessions have been revoked.");
    router.refresh();
  }
  return (
    <form
      onSubmit={submit}
      className="mt-6 max-w-5xl space-y-5 rounded-2xl bg-ad-surface p-7 shadow-ad-sm ring-1 ring-ad-line"
    >
      <div className="flex items-start gap-4 border-b border-ad-hairline pb-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ad-accent text-white">
          <KeyRound size={20} />
        </span>
        <div>
          <h2 className="text-base font-bold text-ad-ink">
            Change administrator password
          </h2>
          <p className="mt-1 text-sm leading-6 text-ad-muted">
            Current password mein wahi temporary password enter karein jisse
            aapne login kiya tha.
          </p>
        </div>
      </div>
      <label className="block text-xs font-semibold text-ad-muted">
        Current password
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Temporary/current password"
          className="mt-2 h-12 w-full rounded-xl ring-1 ring-ad-line px-4 text-sm font-normal outline-none focus:ring-ad-accent"
        />
      </label>
      <label className="block text-xs font-semibold text-ad-muted">
        New password
        <input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="New secure password"
          className="mt-2 h-12 w-full rounded-xl ring-1 ring-ad-line px-4 text-sm font-normal outline-none focus:ring-ad-accent"
        />
      </label>
      <label className="block text-xs font-semibold text-ad-muted">
        Confirm new password
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Enter new password again"
          className="mt-2 h-12 w-full rounded-xl ring-1 ring-ad-line px-4 text-sm font-normal outline-none focus:ring-ad-accent"
        />
      </label>
      <ul
        className="grid gap-3 rounded-xl bg-ad-sunken ring-1 ring-ad-line p-4 text-xs sm:grid-cols-2"
        aria-label="Password requirements"
      >
        {rules.map(([label, valid]) => (
          <li
            key={label}
            className={`flex items-center gap-2 ${valid ? "text-emerald-600" : "text-ad-muted"}`}
          >
            {valid ? <Check size={14} /> : <X size={14} />}
            {label}
          </li>
        ))}
        <li
          className={`flex items-center gap-2 ${confirmPassword && newPassword === confirmPassword ? "text-emerald-600" : "text-ad-muted"}`}
        >
          {confirmPassword && newPassword === confirmPassword ? (
            <Check size={14} />
          ) : (
            <X size={14} />
          )}
          Passwords match
        </li>
      </ul>
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="text-xs text-emerald-600">
          {message}
        </p>
      ) : null}
      <button
        disabled={busy}
        className="h-11 rounded-xl px-6 text-xs font-bold bg-ad-accent text-white transition-colors hover:brightness-110 disabled:opacity-50"
      >
        {busy ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
