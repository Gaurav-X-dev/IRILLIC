import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ForgotPasswordForm } from "@/components/admin/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div>
      <Link
        href="/login"
        className="mb-10 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#0087bd]"
      >
        <ArrowLeft size={15} /> Back to sign in
      </Link>
      <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-[#0087bd]">
        <ShieldCheck size={23} />
      </div>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[.2em] text-[#0087bd]">
        Account recovery
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">
        Reset your password
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Enter the administrator email address. We&apos;ll send a time-limited
        secure reset link if it matches the account.
      </p>
      <ForgotPasswordForm />
      <p className="mt-6 text-[11px] leading-5 text-slate-400">
        For security, this screen always shows the same response and does not
        reveal whether an email address exists.
      </p>
    </div>
  );
}
