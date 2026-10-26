"use client";

import { useCallback, useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { ADMIN_THEME_COOKIE, type AdminTheme } from "@/lib/admin-theme";

function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Writes the resolved theme onto the admin shell root. */
function applyAdminTheme(theme: AdminTheme) {
  const root = document.querySelector<HTMLElement>(".admin-ui");
  if (!root) return;
  root.dataset.adminTheme =
    theme === "system" ? (systemPrefersDark() ? "dark" : "light") : theme;
}

const OPTIONS: { value: AdminTheme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle({ initial }: { initial: AdminTheme }) {
  const [theme, setTheme] = useState<AdminTheme>(initial);

  // Enable colour transitions only after mount, so the first paint is instant.
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".admin-ui");
    if (root) root.dataset.adminThemeReady = "true";
  }, []);

  // Follow the operating system while the preference is "system".
  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => applyAdminTheme("system");
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [theme]);

  const choose = useCallback((next: AdminTheme) => {
    setTheme(next);
    document.cookie = `${ADMIN_THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    applyAdminTheme(next);
  }, []);

  return (
    <div
      className="flex items-center gap-0.5 rounded-xl bg-ad-sunken p-1 ring-1 ring-ad-line"
      role="group"
      aria-label="Panel appearance"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => choose(value)}
          title={`${label} theme`}
          aria-pressed={theme === value}
          className={`grid h-8 w-8 place-items-center rounded-lg transition ${
            theme === value
              ? "bg-ad-surface text-ad-accent shadow-ad-sm"
              : "text-ad-faint hover:text-ad-muted"
          }`}
        >
          <Icon size={15} aria-hidden="true" />
          <span className="sr-only">{label} theme</span>
        </button>
      ))}
    </div>
  );
}
