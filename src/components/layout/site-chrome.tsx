"use client";

import { usePathname } from "next/navigation";
import { APP_ROUTE_PREFIXES } from "@/config/navigation";
import { RevealObserver } from "@/components/shared/reveal-observer";

interface SiteChromeProps {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Wraps marketing routes in the Theme 1 shell (skip link, header, footer,
 * scroll reveals). Application routes (dashboard, auth) render untouched.
 */
export function SiteChrome({ header, footer, children }: SiteChromeProps) {
  const pathname = usePathname();
  const isAppRoute = APP_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isAppRoute) return <>{children}</>;

  return (
    <div className="site">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      {header}
      {children}
      {footer}
      <RevealObserver />
    </div>
  );
}
