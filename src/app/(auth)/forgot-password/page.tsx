import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ForgotPasswordForm } from "@/components/admin/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="animate-rise">
      <Link
        href="/login"
        className="mb-9 inline-flex items-center gap-2 text-xs font-semibold text-ad-muted transition-colors hover:text-ad-accent"
      >
        <ArrowLeft size={15} aria-hidden="true" /> Back to sign in
      </Link>
      <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-ad-accent-soft text-ad-accent">
        <ShieldCheck size={22} aria-hidden="true" />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[.2em] text-ad-accent">
        Account recovery
      </p>
      <h1 className="mt-2.5 text-[30px] font-bold leading-tight tracking-[-.025em] text-ad-ink">
        Reset your password
      </h1>
      <p className="mt-2.5 text-sm leading-6 text-ad-muted">
        Enter the administrator email address. We&apos;ll send a time-limited
        secure reset link if it matches the account.
      </p>
      <ForgotPasswordForm />
      <p className="mt-6 text-[11px] leading-5 text-ad-faint">
        For security, this screen always shows the same response and does not
        reveal whether an email address exists.
      </p>
    </div>
  );
}
