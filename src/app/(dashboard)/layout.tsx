import { cookies, headers } from "next/headers";
import { AdminShell } from "@/components/layout/admin-shell";
import {
  ADMIN_THEME_COOKIE,
  isAdminTheme,
  type AdminTheme,
} from "@/lib/admin-theme";
import { PasswordForm } from "@/components/admin/password-form";
import { ToastProvider } from "@/components/admin/toast";
import { requireAdmin } from "@/lib/auth";
import { cmsService } from "@/services/cms.service";
import { getBranding } from "@/lib/branding";
import "@/app/admin.css";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (admin.mustChangePassword) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f3f6f8] p-4">
        <div className="w-full max-w-xl rounded-2xl border border-amber-200 bg-white p-6 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-amber-700">
            Security action required
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            Set a secure password
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The temporary password can only be used to sign in. Choose a unique
            password before accessing the administration panel.
          </p>
          <PasswordForm />
        </div>
      </div>
    );
  }
  const [topbar, branding] = await Promise.all([
    cmsService.adminTopbar(),
    getBranding(),
  ]);
  const cookieStore = await cookies();
  const stored = cookieStore.get(ADMIN_THEME_COOKIE)?.value;
  const themePreference: AdminTheme = isAdminTheme(stored) ? stored : "light";
  // "system" cannot be resolved on the server; the client hint is used when the
  // browser sends it, and the toggle corrects the value on mount otherwise.
  const prefersDark =
    (await headers()).get("sec-ch-prefers-color-scheme") === "dark";
  const resolvedTheme =
    themePreference === "system"
      ? prefersDark
        ? "dark"
        : "light"
      : themePreference;
  return (
    <ToastProvider>
      <AdminShell
        admin={{
          name: admin.name,
          email: admin.email,
          role: admin.role,
          avatar: admin.avatar,
        }}
        topbar={topbar}
        branding={branding}
        themePreference={themePreference}
        resolvedTheme={resolvedTheme}
      >
        {children}
      </AdminShell>
    </ToastProvider>
  );
}
