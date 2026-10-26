"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bell,
  BookMarked,
  BookOpenText,
  Building2,
  FileClock,
  MonitorSmartphone,
  ShieldAlert,
  Boxes,
  ChevronDown,
  FileText,
  Gauge,
  Home,
  Images,
  LogOut,
  Layers,
  Mail,
  MapPin,
  Menu,
  MessageSquareText,
  PackageSearch,
  PanelLeftClose,
  PanelLeftOpen,
  PanelTop,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { AdminAvatar } from "@/components/admin/admin-avatar";
import {
  CommandPalette,
  type CommandItem,
} from "@/components/admin/command-palette";
import type { AdminTheme } from "@/lib/admin-theme";
import type { Branding } from "@/lib/branding";

interface AdminNavSection {
  label: string;
  items: {
    label: string;
    href: string;
    icon: LucideIcon;
    adminOnly?: boolean;
  }[];
}

const sections: AdminNavSection[] = [
  {
    label: "Website management",
    items: [
      { label: "Overview", href: "/dashboard", icon: Gauge },
      {
        label: "Home management",
        href: "/dashboard/page-home",
        icon: Home,
      },
      {
        label: "About us page",
        href: "/dashboard/page-about-us",
        icon: Building2,
      },
      {
        label: "Products page",
        href: "/dashboard/page-products",
        icon: PackageSearch,
      },
      {
        label: "Clinical page",
        href: "/dashboard/page-clinical-applications",
        icon: Stethoscope,
      },
      {
        label: "Resources page",
        href: "/dashboard/page-clinical-resources",
        icon: BookMarked,
      },
      {
        label: "Contact page",
        href: "/dashboard/page-contact",
        icon: MapPin,
      },
      {
        label: "Header navigation",
        href: "/dashboard/navigation",
        icon: PanelTop,
        adminOnly: true,
      },
      { label: "All website pages", href: "/dashboard/pages", icon: Layers },
    ],
  },
  {
    label: "Content library",
    items: [
      { label: "Product catalogue", href: "/dashboard/products", icon: Boxes },
      {
        label: "Clinical applications",
        href: "/dashboard/applications",
        icon: Stethoscope,
      },
      { label: "Resources", href: "/dashboard/resources", icon: BookOpenText },
    ],
  },
  {
    label: "Engagement",
    items: [
      {
        label: "Enquiries",
        href: "/dashboard/enquiries",
        icon: MessageSquareText,
        adminOnly: true,
      },
      { label: "Media library", href: "/dashboard/media", icon: Images },
    ],
  },
  {
    label: "System",
    items: [
      { label: "My profile", href: "/dashboard/profile", icon: UserRound },
      {
        label: "Users & roles",
        href: "/dashboard/users",
        icon: UsersRound,
        adminOnly: true,
      },
      {
        label: "SMTP configuration",
        href: "/dashboard/smtp",
        icon: Mail,
        adminOnly: true,
      },
      { label: "Security", href: "/dashboard/security", icon: ShieldCheck },
      {
        label: "General settings",
        href: "/dashboard/settings",
        icon: Settings,
        adminOnly: true,
      },
    ],
  },
  {
    label: "Monitoring",
    items: [
      {
        label: "Audit trail",
        href: "/dashboard/audit",
        icon: FileClock,
        adminOnly: true,
      },
      {
        label: "Login sessions",
        href: "/dashboard/sessions",
        icon: MonitorSmartphone,
        adminOnly: true,
      },
      {
        label: "Security events",
        href: "/dashboard/security-events",
        icon: ShieldAlert,
        adminOnly: true,
      },
    ],
  },
];

interface TopbarData {
  enquiryCount: number;
  recentEnquiries: {
    id: string;
    name: string;
    subject: string;
    createdAt: Date;
  }[];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AdminShell({
  children,
  admin,
  topbar,
  branding,
  themePreference,
  resolvedTheme,
}: {
  children: React.ReactNode;
  admin: { name: string; email: string; role: string; avatar: string | null };
  topbar: TopbarData;
  branding: Branding;
  themePreference: AdminTheme;
  resolvedTheme: "light" | "dark";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menu, setMenu] = useState<"none" | "notifications" | "profile">(
    "none",
  );
  const [collapsed, setCollapsed] = useState(false);

  const visibleSections = useMemo(
    () =>
      sections
        .map((section) => ({
          ...section,
          items: section.items.filter(
            (item) => !item.adminOnly || admin.role === "admin",
          ),
        }))
        .filter((section) => section.items.length > 0),
    [admin.role],
  );

  const searchableItems = useMemo<CommandItem[]>(
    () =>
      visibleSections.flatMap((section) =>
        section.items.map((item) => ({ ...item, group: section.label })),
      ),
    [visibleSections],
  );
  const currentItem = searchableItems
    .filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);

  // Any navigation closes the transient layers.
  useEffect(() => {
    setMenu("none");
    setMobileOpen(false);
  }, [pathname]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  const sidebar = (
    <aside
      className={`flex h-full w-[min(262px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl bg-rail text-rail-ink shadow-ad-sm ring-1 ring-rail-line transition-[width] duration-300 ${collapsed ? "lg:w-[76px]" : "lg:w-[262px]"}`}
    >
      <div
        className={`flex h-[68px] shrink-0 items-center border-b border-rail-line ${collapsed ? "justify-center px-2" : "px-4"}`}
      >
        <Link
          href="/dashboard"
          className="flex items-center justify-start"
          aria-label={`${branding.siteName} admin overview`}
        >
          <Image
            src={branding.logo}
            alt={branding.siteName}
            width={180}
            height={56}
            priority
            className={`object-contain object-left ${collapsed ? "h-7 w-9" : "h-8 w-[120px]"}`}
          />
        </Link>
      </div>

      <nav
        className="flex-1 space-y-5 overflow-y-auto px-2.5 py-4"
        aria-label="Admin navigation"
      >
        {visibleSections.map((section) => (
          <div key={section.label}>
            {collapsed ? (
              <div className="mx-auto mb-2 h-px w-7 bg-rail-line" />
            ) : (
              <p className="mb-1.5 px-2.5 text-[10px] font-bold uppercase tracking-[.16em] text-rail-faint">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(`${item.href}/`));
                const Icon = item.icon;
                const badge =
                  item.href === "/dashboard/enquiries" &&
                  topbar.enquiryCount > 0
                    ? topbar.enquiryCount
                    : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex items-center rounded-xl text-[13px] transition-colors ${collapsed ? "h-10 justify-center" : "gap-3 px-2.5 py-2"} ${
                      active
                        ? "bg-rail-active font-semibold text-ad-accent"
                        : "font-medium text-rail-muted hover:bg-rail-hover hover:text-rail-ink"
                    }`}
                  >
                    {active ? (
                      <span
                        className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-ad-accent"
                        aria-hidden="true"
                      />
                    ) : null}
                    <Icon
                      size={17}
                      strokeWidth={active ? 2.2 : 1.75}
                      className={active ? "text-ad-accent" : undefined}
                      aria-hidden="true"
                    />
                    {collapsed ? null : (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {badge ? (
                      <span
                        className={`grid place-items-center rounded-full bg-ad-accent text-[10px] font-bold text-white ${collapsed ? "absolute right-1 top-1 h-4 min-w-4 px-1" : "h-5 min-w-5 px-1.5"}`}
                      >
                        {badge > 99 ? "99+" : badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-rail-line p-2.5">
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="hidden h-9 w-full items-center justify-center gap-2 rounded-xl text-[11px] font-semibold text-rail-muted transition-colors hover:bg-rail-hover hover:text-rail-ink lg:flex"
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? (
            <PanelLeftOpen size={16} aria-hidden="true" />
          ) : (
            <>
              <PanelLeftClose size={16} aria-hidden="true" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );

  return (
    <div
      className="admin-ui min-h-screen overflow-x-hidden bg-ad-canvas p-2.5 sm:p-3 lg:p-3.5"
      data-admin-theme={resolvedTheme}
    >
      <div className="fixed inset-y-3.5 left-3.5 z-40 hidden lg:block">
        {sidebar}
      </div>

      {mobileOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-3 left-3 z-50 lg:hidden">
            {sidebar}
            <button
              type="button"
              className="tap-target absolute right-2.5 top-2.5 rounded-lg p-2 text-rail-muted transition-colors hover:text-rail-ink"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
        </>
      ) : null}

      <div
        className={`transition-[padding] duration-300 ${collapsed ? "lg:pl-[92px]" : "lg:pl-[278px]"}`}
      >
        <header className="sticky top-3 z-30 mb-4 flex min-h-[60px] items-center justify-between gap-3 rounded-2xl bg-ad-surface/85 px-3 shadow-ad-md ring-1 ring-ad-line backdrop-blur-xl sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="tap-target rounded-xl p-2 text-ad-muted transition-colors hover:bg-ad-sunken lg:hidden"
              onClick={() => {
                setCollapsed(false);
                setMobileOpen(true);
              }}
              aria-label="Open menu"
            >
              <Menu size={19} />
            </button>
            <div className="min-w-0 max-[480px]:hidden">
              <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-ad-faint">
                {currentItem?.group ?? "Administration"}
              </p>
              <h2 className="truncate text-sm font-semibold text-ad-ink">
                {currentItem?.label ?? "Admin panel"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="ml-2 hidden h-9 items-center gap-2.5 rounded-xl bg-ad-sunken pl-3 pr-2 text-xs text-ad-faint ring-1 ring-ad-line transition-colors hover:text-ad-muted hover:ring-ad-accent/60 xl:flex"
            >
              <Search size={14} aria-hidden="true" />
              <span className="w-40 text-left">Search the panel…</span>
              <kbd className="rounded-md bg-ad-surface px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-ad-line">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Search the panel"
              className="tap-target rounded-xl p-2 text-ad-muted transition-colors hover:bg-ad-sunken xl:hidden"
            >
              <Search size={17} />
            </button>

            <ThemeToggle initial={themePreference} />

            <Link
              href="/"
              target="_blank"
              className="hidden h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-ad-muted ring-1 ring-ad-line transition-colors hover:text-ad-accent hover:ring-ad-accent/60 sm:flex"
            >
              View site
              <ArrowUpRight size={13} aria-hidden="true" />
            </Link>

            <div className="relative">
              <button
                type="button"
                className="tap-target relative rounded-xl p-2 text-ad-muted transition-colors hover:bg-ad-sunken"
                onClick={() =>
                  setMenu((open) =>
                    open === "notifications" ? "none" : "notifications",
                  )
                }
                aria-label={`${topbar.enquiryCount} new enquiries`}
                aria-expanded={menu === "notifications"}
              >
                <Bell size={17} />
                {topbar.enquiryCount > 0 ? (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-ad-surface" />
                ) : null}
              </button>
              {menu === "notifications" ? (
                <Dropdown label="New enquiries">
                  <div className="flex items-center justify-between border-b border-ad-hairline px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-ad-ink">
                        New enquiries
                      </p>
                      <p className="text-[10px] text-ad-faint">
                        Live data from the website
                      </p>
                    </div>
                    <span className="rounded-full bg-rose-500/10 px-2 py-1 text-[10px] font-bold text-rose-500">
                      {topbar.enquiryCount} new
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {topbar.recentEnquiries.length ? (
                      topbar.recentEnquiries.map((item) => (
                        <Link
                          key={item.id}
                          href="/dashboard/enquiries"
                          className="block border-b border-ad-hairline px-4 py-3 transition-colors last:border-0 hover:bg-ad-sunken"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <strong className="truncate text-xs font-semibold text-ad-ink">
                              {item.name}
                            </strong>
                            <time className="tabular shrink-0 text-[10px] text-ad-faint">
                              {new Date(item.createdAt).toLocaleDateString(
                                "en-IN",
                                { day: "2-digit", month: "short" },
                              )}
                            </time>
                          </div>
                          <p className="mt-1 truncate text-[11px] text-ad-muted">
                            {item.subject}
                          </p>
                        </Link>
                      ))
                    ) : (
                      <p className="px-4 py-10 text-center text-xs text-ad-faint">
                        No new enquiries
                      </p>
                    )}
                  </div>
                  <Link
                    href="/dashboard/enquiries"
                    className="block bg-ad-sunken px-4 py-3 text-center text-xs font-semibold text-ad-accent"
                  >
                    View all enquiries
                  </Link>
                </Dropdown>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl p-1 pr-1.5 transition-colors hover:bg-ad-sunken"
                onClick={() =>
                  setMenu((open) => (open === "profile" ? "none" : "profile"))
                }
                aria-expanded={menu === "profile"}
                aria-label="Account menu"
              >
                <AdminAvatar name={admin.name} avatar={admin.avatar} />
                <span className="hidden text-left lg:block">
                  <span className="block text-xs font-semibold leading-tight text-ad-ink">
                    {admin.name}
                  </span>
                  <span className="block text-[10px] capitalize text-ad-faint">
                    {admin.role === "content_reader"
                      ? "Content Reader"
                      : "Administrator"}
                  </span>
                </span>
                <ChevronDown
                  size={13}
                  className="hidden text-ad-faint lg:block"
                  aria-hidden="true"
                />
              </button>
              {menu === "profile" ? (
                <Dropdown label="Account" width="w-64">
                  <div className="border-b border-ad-hairline px-4 py-3.5">
                    <p className="text-xs font-semibold text-ad-ink">
                      {admin.name}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-ad-faint">
                      {admin.email}
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-ad-accent-soft px-2 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-ad-accent">
                      {admin.role === "content_reader"
                        ? "Content Reader"
                        : "Administrator"}
                    </span>
                  </div>
                  <div className="p-1.5">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-ad-muted transition-colors hover:bg-ad-sunken hover:text-ad-ink"
                    >
                      <UserRound size={15} aria-hidden="true" /> Edit profile
                    </Link>
                    <Link
                      href="/dashboard/security"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-ad-muted transition-colors hover:bg-ad-sunken hover:text-ad-ink"
                    >
                      <ShieldCheck size={15} aria-hidden="true" /> Security
                      settings
                    </Link>
                    <button
                      type="button"
                      onClick={signOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-rose-500 transition-colors hover:bg-rose-500/10"
                    >
                      <LogOut size={15} aria-hidden="true" /> Sign out
                    </button>
                  </div>
                </Dropdown>
              ) : null}
            </div>
          </div>
        </header>

        <main
          id="main-content"
          className="min-h-[calc(100vh-128px)] min-w-0 px-3 sm:px-5 lg:px-6"
        >
          {children}
        </main>

        <CommandPalette
          items={searchableItems}
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
        />

        <footer className="flex flex-col gap-1.5 px-3 py-6 sm:px-5 lg:px-6 text-[11px] text-ad-faint sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {branding.siteName}. Secure
            administration portal.
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={12} aria-hidden="true" /> Signed in as{" "}
            {admin.email}
          </span>
        </footer>
      </div>
    </div>
  );
}

function Dropdown({
  label,
  width = "w-[min(21rem,calc(100vw-2rem))]",
  children,
}: {
  label: string;
  width?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="menu"
      aria-label={label}
      className={`absolute right-0 top-11 z-50 ${width} overflow-hidden rounded-2xl bg-ad-raised shadow-ad-lg ring-1 ring-ad-line`}
    >
      {children}
    </div>
  );
}
