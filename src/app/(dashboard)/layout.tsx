import { cookies, headers } from "next/headers";
import { AdminShell } from "@/components/layout/admin-shell";
import {
  ADMIN_THEME_COOKIE,
  isAdminTheme,
  type AdminTheme,
} from "@/lib/admin-theme";
import { ShieldAlert } from "lucide-react";
import { PasswordForm } from "@/components/admin/password-form";
import { ConfirmProvider } from "@/components/admin/confirm";
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

  if (admin.mustChangePassword)
    // Scoped to .admin-ui like every other panel screen: outside it none of
    // the --adc-* variables resolve, which left this form -- the submit
    // button included -- drawn in no colour at all.
    return (
      <div
        className="admin-ui grid min-h-screen place-items-center bg-ad-canvas p-4"
        data-admin-theme={resolvedTheme}
      >
        <div className="w-full max-w-xl">
          <div className="mb-5 flex items-start gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-500/12 text-amber-600">
              <ShieldAlert size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-amber-600">
                Security action required
              </p>
              <h1 className="mt-1 text-2xl font-bold leading-7 text-ad-ink">
                Set a secure password
              </h1>
              <p className="mt-1.5 text-sm leading-6 text-ad-muted">
                The temporary password can only be used to sign in. Choose a
                password of your own before opening the panel.
              </p>
            </div>
          </div>
          <PasswordForm />
        </div>
      </div>
    );

  const [topbar, branding] = await Promise.all([
    cmsService.adminTopbar(),
    getBranding(),
  ]);
  return (
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
      {/* Inside the shell, so the panel's theme variables reach the toasts;
          mounted outside them, the colours resolve to nothing. */}
      <ToastProvider>
        <ConfirmProvider>{children}</ConfirmProvider>
      </ToastProvider>
    </AdminShell>
  );
}
