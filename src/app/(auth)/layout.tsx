import Image from "next/image";
import { cookies, headers } from "next/headers";
import { Activity, ScanLine, ShieldCheck } from "lucide-react";
import { getBranding } from "@/lib/branding";
import {
  ADMIN_THEME_COOKIE,
  isAdminTheme,
  type AdminTheme,
} from "@/lib/admin-theme";
import "@/app/admin.css";

/**
 * What the panel actually gives an administrator, in the order they will
 * meet it after signing in.
 */
const ASSURANCES = [
  {
    icon: ScanLine,
    title: "One place for the whole website",
    text: "Pages, products, clinical applications and resources, edited section by section.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    text: "Administrators manage everything; content readers can look without changing anything.",
  },
  {
    icon: Activity,
    title: "Every change accounted for",
    text: "An audit trail, sign-in sessions and security events, all visible in the panel.",
  },
];

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [branding, cookieStore, requestHeaders] = await Promise.all([
    getBranding(),
    cookies(),
    headers(),
  ]);

  // The sign-in screen follows the same theme the panel was last left in.
  const stored = cookieStore.get(ADMIN_THEME_COOKIE)?.value;
  const preference: AdminTheme = isAdminTheme(stored) ? stored : "light";
  const prefersDark =
    requestHeaders.get("sec-ch-prefers-color-scheme") === "dark";
  const theme =
    preference === "system" ? (prefersDark ? "dark" : "light") : preference;

  return (
    <div
      className="admin-ui grid min-h-screen bg-ad-canvas lg:grid-cols-[1.05fr_.95fr]"
      data-admin-theme={theme}
    >
      {/* Brand panel — hidden once there is no room for it to say anything. */}
      <section className="relative hidden min-h-screen overflow-hidden bg-[#03121e] lg:block">
        <Image
          src="/images/admin-login-surgical-imaging.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 0px"
          className="object-cover"
        />
        {/* Two washes: one to sink the photograph, one to carry the brand. */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#01161f] via-[#032a3e]/70 to-[#03121e]/35" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_15%_100%,rgba(0,145,208,.42),transparent_62%)]" />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <Image
              src={branding.logoWhite}
              alt={branding.siteName}
              width={128}
              height={40}
              className="h-8 w-auto object-contain"
            />
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-sky-100 backdrop-blur">
              Admin portal
            </span>
          </div>

          <div className="max-w-xl text-white">
            <p className="text-[11px] font-bold uppercase tracking-[.24em] text-sky-300">
              {branding.tagline}
            </p>
            <h1 className="mt-5 text-[40px] font-semibold leading-[1.12] tracking-[-.02em] xl:text-[46px]">
              Run the {branding.siteName} website from one place.
            </h1>

            <ul className="mt-10 space-y-5">
              {ASSURANCES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-sky-200 backdrop-blur">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <strong className="block text-sm font-semibold">
                      {title}
                    </strong>
                    <span className="mt-1 block text-[13px] leading-6 text-slate-300">
                      {text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-slate-400">
            For authorised {branding.siteName} personnel only. Sign-in activity
            is recorded.
          </p>
        </div>
      </section>

      <main className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[420px]">
          {/* The brand panel carries the logo on wide screens; this is its
              stand-in once that panel is gone. */}
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <Image
              src={branding.logo}
              alt={branding.siteName}
              width={120}
              height={36}
              className="h-7 w-auto object-contain"
            />
            <span className="rounded-full bg-ad-accent-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-ad-accent">
              Admin
            </span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
