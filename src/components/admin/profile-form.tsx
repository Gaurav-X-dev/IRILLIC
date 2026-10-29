"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export function ProfileForm({
  profile,
}: {
  profile: { name: string; email: string; avatar: string | null; role: string };
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(profile.avatar);
  // A stored avatar path can outlive its file on disk; fall back to the icon.
  const [imageFailed, setImageFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        body: new FormData(event.currentTarget),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "Profile update failed");
      setPreview(payload.data.avatar);
      setImageFailed(false);
      setSaved(true);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Profile update failed",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <section className="ad-card overflow-hidden rounded-2xl bg-ad-surface shadow-ad-sm ring-1 ring-ad-line">
        <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-emerald-500 px-6 py-8 text-center text-white">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="group relative mx-auto block h-32 w-32 overflow-hidden rounded-[32px] bg-white/15 shadow-2xl ring-4 ring-white/25"
            aria-label="Choose a profile image"
          >
            {preview && !imageFailed ? (
              <Image
                src={preview}
                alt=""
                fill
                sizes="128px"
                // A freshly chosen file is a blob: URL, which the optimiser
                // cannot process; a saved one is already 512x512 WebP, so it
                // has nothing to gain from it either.
                unoptimized
                onError={() => setImageFailed(true)}
                className="object-cover"
              />
            ) : (
              <UserRound className="m-auto h-full w-12" aria-hidden="true" />
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-slate-950/65 py-2 text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100">
              <Camera size={13} /> Change photo
            </span>
          </button>
          <h2 className="mt-4 text-lg font-bold">{profile.name}</h2>
          <p className="mt-1 text-xs text-cyan-50">{profile.email}</p>
        </div>
        <div className="space-y-3 p-5 text-xs text-ad-muted">
          <p className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-emerald-500" /> Single
            administrator account
          </p>
          <p>
            Uploaded photographs are resized to 512 × 512 and stored as
            compressed WebP.
          </p>
        </div>
      </section>

      <section className="ad-card rounded-2xl bg-ad-surface p-6 shadow-ad-sm ring-1 ring-ad-line sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-ad-accent">
          Account details
        </p>
        <h2 className="mt-1.5 text-xl font-bold text-ad-ink">
          Edit administrator profile
        </h2>
        <p className="mt-2 text-xs leading-5 text-ad-muted">
          Your updated name and photograph appear across the administration
          panel.
        </p>
        <input
          ref={inputRef}
          name="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }}
        />
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-ad-muted">
              Full name
            </span>
            <input
              name="name"
              required
              minLength={2}
              maxLength={255}
              defaultValue={profile.name}
              className="h-11 w-full px-3.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-ad-muted">
              Email address
            </span>
            <input
              name="email"
              type="email"
              required
              maxLength={255}
              defaultValue={profile.email}
              className="h-11 w-full px-3.5 text-sm"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-xs font-semibold text-ad-muted">
              Account role
            </span>
            <input
              value={profile.role}
              disabled
              className="h-11 w-full px-3.5 text-sm capitalize opacity-65"
            />
          </label>
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-ad-hairline pt-5">
          <div>
            {error ? (
              <p className="text-xs font-medium text-rose-500" role="alert">
                {error}
              </p>
            ) : null}
            {saved ? (
              <p
                className="flex items-center gap-1.5 text-xs font-medium text-emerald-600"
                role="status"
              >
                <CheckCircle2 size={14} /> Profile saved successfully.
              </p>
            ) : null}
          </div>
          <button
            disabled={busy}
            className={`inline-flex h-11 items-center gap-2 rounded-xl bg-ad-accent px-5 text-xs font-bold text-white disabled:opacity-50 ${busy ? "is-busy" : "hover:brightness-110"}`}
          >
            <Save size={15} /> {busy ? "Saving…" : "Save profile"}
          </button>
        </div>
      </section>
    </form>
  );
}
