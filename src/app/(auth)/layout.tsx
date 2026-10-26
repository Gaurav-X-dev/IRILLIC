import Image from "next/image";
import { getBranding } from "@/lib/branding";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branding = await getBranding();
  return (
    <div className="grid min-h-screen bg-[#f5f8fa] lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-slate-950 lg:block">
        <div className="absolute inset-0 bg-[url('/images/admin-login-surgical-imaging.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001421] via-[#00253a]/55 to-[#001421]/10" />
        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <Image
              src={branding.logoWhite}
              alt={branding.siteName}
              width={128}
              height={40}
              className="h-auto w-32"
            />
            <span className="rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-cyan-100 backdrop-blur">
              Admin portal
            </span>
          </div>
          <div className="max-w-xl pb-6 text-white">
            <p className="mb-5 text-xs font-bold uppercase tracking-[.22em] text-cyan-300">
              Precision in every decision
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              Manage {branding.siteName}&apos;s digital experience with
              confidence.
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-7 text-slate-300">
              A secure, central workspace for website content, products,
              clinical resources and customer enquiries.
            </p>
            <div className="mt-8 flex gap-6 text-[11px] font-medium text-slate-300">
              <span>Encrypted access</span>
              <span>•</span>
              <span>Activity monitored</span>
              <span>•</span>
              <span>Single administrator</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500">
            For authorised {branding.siteName} personnel only.
          </p>
        </div>
      </section>
      <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[430px]">
          {/* The wide screens show the logo in the left panel, so this copy
              only appears once that panel is hidden. */}
          <div className="mb-10 lg:hidden">
            <Image
              src={branding.logo}
              alt={branding.siteName}
              width={120}
              height={36}
              className="h-auto w-[120px]"
            />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
