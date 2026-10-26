import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BookOpenText,
  Boxes,
  CheckCircle2,
  DatabaseZap,
  FileEdit,
  FileText,
  Image as ImageIcon,
  Mail,
  MessageSquareText,
  PanelTop,
  Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DashboardVisualizations } from "@/components/admin/dashboard-visualizations";
import { DashboardClock } from "@/components/admin/dashboard-clock";
import { DashboardRecentContent } from "@/components/admin/dashboard-recent-content";
import { Card, CardHeader, buttonClass } from "@/components/admin/ui";
import { cmsService } from "@/services/cms.service";
import { requireAdmin } from "@/lib/auth";
import { getBranding } from "@/lib/branding";

/** Greeting based on the Indian business day the panel is operated in. */
function greeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(new Date()),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const QUICK_ACTIONS = [
  {
    icon: FileEdit,
    label: "Edit a page",
    hint: "Section by section",
    href: "/dashboard/pages",
  },
  {
    icon: Boxes,
    label: "Add a product",
    hint: "Imaging systems",
    href: "/dashboard/products",
  },
  {
    icon: ImageIcon,
    label: "Upload media",
    hint: "Images and documents",
    href: "/dashboard/media",
  },
  {
    icon: PanelTop,
    label: "Edit navigation",
    hint: "Navbar and mega menu",
    href: "/dashboard/navigation",
  },
  {
    icon: MessageSquareText,
    label: "Review enquiries",
    hint: "Customer requests",
    href: "/dashboard/enquiries",
  },
  {
    icon: Mail,
    label: "Email delivery",
    hint: "SMTP and alerts",
    href: "/dashboard/smtp",
  },
];

export const metadata = { title: "Admin Overview" };

export default async function DashboardPage() {
  const [data, topbar, admin, branding] = await Promise.all([
    cmsService.dashboard(),
    cmsService.adminTopbar(),
    requireAdmin(),
    getBranding(),
  ]);
  const firstName = admin.name.split(" ")[0];
  const managedContent =
    data.counts.products + data.counts.applications + data.counts.resources;
  const inventoryTotal = data.counts.pages + managedContent + data.counts.media;

  const metrics = [
    {
      label: "Published pages",
      value: data.counts.pages,
      icon: FileText,
      caption: "Live on the website",
      href: "/dashboard/pages",
      tone: "blue",
      progress: inventoryTotal
        ? Math.round((data.counts.pages / inventoryTotal) * 100)
        : 0,
    },
    {
      label: "Product systems",
      value: data.counts.products,
      icon: Boxes,
      caption: "In the catalogue",
      href: "/dashboard/products",
      tone: "violet",
      progress: inventoryTotal
        ? Math.round((data.counts.products / inventoryTotal) * 100)
        : 0,
    },
    {
      label: "Resources",
      value: data.counts.resources,
      icon: BookOpenText,
      caption: "Published and draft",
      href: "/dashboard/resources",
      tone: "emerald",
      progress: inventoryTotal
        ? Math.round((data.counts.resources / inventoryTotal) * 100)
        : 0,
    },
    {
      label: "New enquiries",
      value: data.counts.enquiries,
      icon: MessageSquareText,
      caption: "vs previous 7 days",
      href: "/dashboard/enquiries",
      trend: { ...data.trends.enquiries, noun: "enquiries" },
      tone: "amber",
    },
  ];

  const activityByDay = new Map(
    data.activity.map((item) => [item.day, Number(item.value)]),
  );
  const chart = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.now() - (6 - index) * 86400000);
    const key = date.toISOString().slice(0, 10);
    return {
      label: date.toLocaleDateString("en", { weekday: "short" }),
      value: activityByDay.get(key) ?? 0,
    };
  });
  const contentMix = [
    { label: "Pages", value: data.counts.pages },
    { label: "Products", value: data.counts.products },
    { label: "Applications", value: data.counts.applications },
    { label: "Resources", value: data.counts.resources },
    { label: "Media", value: data.counts.media },
  ];
  const contentStatusByName = new Map(
    data.contentStatus.map((item) => [item.label, Number(item.value)]),
  );
  const contentStatus = ["published", "draft", "archived"].map((label) => ({
    label,
    value: contentStatusByName.get(label) ?? 0,
  }));
  const enquiryStatusByName = new Map(
    data.enquiryStatus.map((item) => [item.label, Number(item.value)]),
  );
  const enquiryStatus = ["new", "in-progress", "responded", "closed"].map(
    (label) => ({ label, value: enquiryStatusByName.get(label) ?? 0 }),
  );

  return (
    <div className="dashboard-home mx-auto max-w-[1600px] space-y-5">
      <header className="dashboard-hero relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#087fb5] via-[#1768d5] to-[#5738d8] px-6 py-6 text-white shadow-[0_22px_55px_-30px_rgba(37,99,235,.7)] sm:px-8 sm:py-7">
        <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full border-[36px] border-white/[.06]" />
        <div className="absolute bottom-0 right-1/3 h-24 w-44 rounded-full bg-cyan-300/10 blur-2xl" />
        <div className="relative grid gap-7 2xl:grid-cols-[minmax(0,1.25fr)_minmax(330px,.75fr)_auto] 2xl:items-center 2xl:gap-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-cyan-100">
              <Activity size={13} aria-hidden="true" /> Control centre
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-[30px]">
              {greeting()}, {firstName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              Live operations and publishing intelligence for the{" "}
              {branding.siteName} website.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold backdrop-blur-sm">
                <DatabaseZap
                  size={13}
                  className="text-emerald-300"
                  aria-hidden="true"
                />
                Database live
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold backdrop-blur-sm">
                <CheckCircle2
                  size={13}
                  className="text-cyan-200"
                  aria-hidden="true"
                />
                {data.counts.pages} published pages
              </span>
            </div>
          </div>
          <div className="w-full 2xl:justify-self-center">
            <DashboardClock />
          </div>
          <Link
            href="/dashboard/pages"
            className="inline-flex h-12 w-full items-center justify-center gap-2 self-center rounded-xl bg-white px-6 text-xs font-bold text-blue-700 shadow-lg shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-blue-50 sm:w-max 2xl:justify-self-end"
          >
            <Plus size={15} aria-hidden="true" /> Create content
          </Link>
        </div>
        <div className="relative mt-7 grid border-t border-white/15 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <HeroSignal
            label="Live pages"
            value={data.counts.pages}
            note="Published now"
          />
          <HeroSignal
            label="Managed content"
            value={managedContent}
            note="Products, applications & resources"
          />
          <HeroSignal
            label="Media assets"
            value={data.counts.media}
            note="Available in the library"
          />
          <HeroSignal
            label="Changes this week"
            value={data.trends.changes.current}
            note={`${data.trends.changes.previous} in the previous week`}
          />
        </div>
      </header>

      <section className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <OverviewMetric key={metric.label} {...metric} />
        ))}
      </section>

      <DashboardVisualizations
        activity={chart}
        contentStatus={contentStatus}
        enquiryStatus={enquiryStatus}
        contentMix={contentMix}
        auditActions={data.auditActions.map((item) => ({
          label: item.label,
          value: Number(item.value),
        }))}
      />

      <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="dashboard-action-panel">
          <CardHeader
            eyebrow="Actions"
            title="Quick access"
            description="The tasks opened most often from here."
          />
          <div className="grid gap-2.5 p-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_ACTIONS.map(({ icon: Icon, label, hint, href }) => (
              <Link
                key={label}
                href={href}
                className="group relative min-h-28 overflow-hidden rounded-xl bg-ad-sunken p-4 ring-1 ring-ad-line transition duration-200 hover:-translate-y-0.5 hover:bg-ad-raised hover:shadow-ad-md hover:ring-ad-accent/40"
              >
                <span className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-ad-accent/5 transition-transform duration-300 group-hover:scale-150" />
                <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-ad-accent-soft text-ad-accent transition-transform group-hover:scale-105">
                  <Icon size={17} aria-hidden="true" />
                </span>
                <span className="relative mt-3 block text-xs font-semibold text-ad-ink">
                  {label}
                </span>
                <span className="relative mt-0.5 flex items-center justify-between gap-2 text-[10px] text-ad-faint">
                  {hint}
                  <ArrowUpRight
                    size={13}
                    className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="dashboard-inbox-panel">
          <CardHeader
            eyebrow="Engagement"
            title="Latest enquiries"
            action={
              <Link href="/dashboard/enquiries" className={buttonClass.subtle}>
                Open inbox
              </Link>
            }
          />
          {topbar.recentEnquiries.length ? (
            <ul className="stagger divide-y divide-ad-hairline p-2">
              {topbar.recentEnquiries.map((enquiry) => (
                <li key={enquiry.id} className="overflow-hidden rounded-xl">
                  <Link
                    href="/dashboard/enquiries"
                    className="group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-ad-sunken"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-500">
                      <MessageSquareText size={15} />
                    </span>
                    <span className="min-w-0">
                      <strong className="block truncate text-xs font-semibold text-ad-ink">
                        {enquiry.name}
                      </strong>
                      <span className="mt-0.5 block truncate text-[11px] text-ad-faint">
                        {enquiry.subject}
                      </span>
                    </span>
                    <time className="tabular ml-auto shrink-0 text-[10px] text-ad-faint">
                      {enquiry.createdAt.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="relative grid min-h-[248px] place-items-center overflow-hidden px-6 py-10 text-center">
              <span className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-violet-500/10 blur-2xl" />
              <span className="absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-cyan-500/10 blur-2xl" />
              <div className="relative">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500/15 to-violet-500/15 text-ad-accent ring-1 ring-ad-line">
                  <MessageSquareText size={22} />
                </span>
                <p className="mt-4 text-sm font-semibold text-ad-ink">
                  Inbox is clear
                </p>
                <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-ad-faint">
                  New website enquiries will appear here automatically.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold text-emerald-600">
                  <span className="dashboard-live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Listening for submissions
                </span>
              </div>
            </div>
          )}
        </Card>
      </section>

      <Card>
        <CardHeader
          eyebrow="Content"
          title="Recently updated"
          description="Latest changes across the website."
          action={
            <Link href="/dashboard/pages" className={buttonClass.subtle}>
              View all
            </Link>
          }
        />
        <DashboardRecentContent
          initialRows={data.recent.map((page) => ({
            ...page,
            updatedAt: page.updatedAt.toISOString(),
          }))}
        />
      </Card>
    </div>
  );
}

function OverviewMetric({
  label,
  value,
  icon: Icon,
  caption,
  href,
  tone,
  trend,
  progress,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  caption: string;
  href: string;
  tone: string;
  trend?: { current: number; previous: number; noun: string };
  progress?: number;
}) {
  const colors = {
    blue: {
      edge: "from-blue-500 to-cyan-400",
      icon: "bg-blue-500/10 text-blue-600",
      glow: "bg-blue-500/10",
    },
    violet: {
      edge: "from-violet-500 to-fuchsia-400",
      icon: "bg-violet-500/10 text-violet-600",
      glow: "bg-violet-500/10",
    },
    emerald: {
      edge: "from-emerald-500 to-teal-400",
      icon: "bg-emerald-500/10 text-emerald-600",
      glow: "bg-emerald-500/10",
    },
    amber: {
      edge: "from-amber-500 to-orange-400",
      icon: "bg-amber-500/10 text-amber-600",
      glow: "bg-amber-500/10",
    },
  }[tone] ?? {
    edge: "from-blue-500 to-cyan-400",
    icon: "bg-blue-500/10 text-blue-600",
    glow: "bg-blue-500/10",
  };
  const trendDelta = trend ? trend.current - trend.previous : null;

  return (
    <Link
      href={href}
      className="dashboard-metric ad-card group relative overflow-hidden rounded-2xl bg-ad-surface p-5 shadow-ad-md ring-1 ring-ad-line transition duration-200 hover:-translate-y-0.5 hover:shadow-ad-lg"
    >
      <span
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${colors.edge}`}
      />
      <span
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl ${colors.glow}`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-ad-muted">{label}</span>
          <strong className="tabular mt-4 block text-[36px] font-bold leading-none tracking-[-.04em] text-ad-ink">
            {value.toLocaleString("en-IN")}
          </strong>
        </div>
        <span
          className={`grid h-10 w-10 place-items-center rounded-xl ${colors.icon}`}
        >
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <div className="relative mt-4 flex items-center justify-between gap-3">
        <span className="truncate text-[10px] font-medium text-ad-faint">
          {caption}
        </span>
        {trendDelta === null ? (
          <ArrowUpRight
            size={14}
            className="text-ad-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        ) : (
          <span
            className={`tabular rounded-full px-2 py-1 text-[9px] font-bold ${trendDelta > 0 ? "bg-emerald-500/10 text-emerald-600" : trendDelta < 0 ? "bg-rose-500/10 text-rose-500" : "bg-ad-sunken text-ad-faint"}`}
          >
            {trendDelta > 0 ? "+" : ""}
            {trendDelta} this week
          </span>
        )}
      </div>
      {progress !== undefined ? (
        <div className="relative mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[9px] font-semibold uppercase tracking-wider text-ad-faint">
            <span>Share of inventory</span>
            <span className="tabular">{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-ad-sunken">
            <span
              className={`dashboard-metric-progress block h-full rounded-full bg-gradient-to-r ${colors.edge}`}
              style={
                { "--metric-width": `${progress}%` } as React.CSSProperties
              }
            />
          </div>
        </div>
      ) : null}
    </Link>
  );
}

function HeroSignal({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div className="group flex items-center gap-3 py-3 sm:px-4 sm:first:pl-0 lg:border-l lg:border-white/10 lg:first:border-l-0 lg:first:pl-0">
      <strong className="tabular text-[28px] font-bold leading-none tracking-[-.04em] text-white">
        {value.toLocaleString("en-IN")}
      </strong>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-[.14em] text-cyan-100">
          {label}
        </span>
        <span className="mt-1 block truncate text-[10px] text-blue-100/75">
          {note}
        </span>
      </span>
    </div>
  );
}
