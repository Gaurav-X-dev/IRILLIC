import Link from "next/link";
import { ArrowUpRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * The panel's shared surfaces. Everything is built from three elevations
 * (canvas → surface → raised) plus a single hairline ring, so screens look
 * like one product instead of a pile of individually styled cards.
 */
export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`ad-card overflow-hidden rounded-2xl bg-ad-surface shadow-ad-sm ring-1 ring-ad-line ${className}`}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-ad-hairline px-5 py-4">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-ad-faint">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-0.5 text-[15px] font-semibold text-ad-ink">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs text-ad-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}

/** The page title block every admin screen opens with. */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-ad-accent">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 text-[26px] font-bold leading-tight tracking-[-.025em] text-ad-ink">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ad-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50";

export const buttonClass = {
  primary: `${BUTTON_BASE} h-10 bg-ad-accent px-4 text-white hover:brightness-110`,
  ghost: `${BUTTON_BASE} h-10 px-4 text-ad-muted ring-1 ring-ad-line hover:text-ad-accent hover:ring-ad-accent/60`,
  subtle: `${BUTTON_BASE} h-8 px-3 text-ad-muted ring-1 ring-ad-line hover:text-ad-accent hover:ring-ad-accent/60`,
};

/**
 * A metric with its week-over-week movement. The trend is omitted rather than
 * invented when there is nothing to compare against.
 */
export function StatTile({
  label,
  value,
  icon: Icon,
  caption,
  trend,
  href,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  caption?: string;
  trend?: { current: number; previous: number; noun: string };
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold text-ad-muted">{label}</span>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ad-accent-soft text-ad-accent">
          <Icon size={15} aria-hidden="true" />
        </span>
      </div>
      <strong className="tabular mt-4 block text-[34px] font-bold leading-none tracking-[-.03em] text-ad-ink">
        {value.toLocaleString("en-IN")}
      </strong>
      <div className="mt-3 flex items-center gap-2">
        {trend ? <TrendBadge {...trend} /> : null}
        {caption ? (
          <span className="truncate text-[11px] text-ad-faint">{caption}</span>
        ) : null}
      </div>
    </>
  );

  if (href)
    return (
      <Link
        href={href}
        className="ad-card group relative block rounded-2xl bg-ad-surface p-5 shadow-ad-sm ring-1 ring-ad-line transition-shadow hover:shadow-ad-md hover:ring-ad-accent/40"
      >
        {body}
        <ArrowUpRight
          size={14}
          className="absolute bottom-5 right-5 text-ad-faint opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </Link>
    );

  return (
    <div className="ad-card rounded-2xl bg-ad-surface p-5 shadow-ad-sm ring-1 ring-ad-line">
      {body}
    </div>
  );
}

function TrendBadge({
  current,
  previous,
  noun,
}: {
  current: number;
  previous: number;
  noun: string;
}) {
  const delta = current - previous;
  // With no prior activity a percentage would be meaningless, so the badge
  // reports the raw count instead.
  const percent = previous ? Math.round((delta / previous) * 100) : null;
  const tone =
    delta > 0
      ? "bg-emerald-500/10 text-emerald-600"
      : delta < 0
        ? "bg-rose-500/10 text-rose-500"
        : "bg-ad-sunken text-ad-faint";
  const Icon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;

  return (
    <span
      className={`tabular inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${tone}`}
      title={`${current} ${noun} in the last 7 days, ${previous} in the 7 days before`}
    >
      <Icon size={11} aria-hidden="true" />
      {percent === null
        ? `${delta >= 0 ? "+" : ""}${delta}`
        : `${percent >= 0 ? "+" : ""}${percent}%`}
    </span>
  );
}

/** Status pill with a consistent vocabulary across every screen. */
export function StatusPill({ status }: { status: string }) {
  const tone: Record<string, string> = {
    published: "bg-emerald-500/10 text-emerald-600",
    draft: "bg-amber-500/10 text-amber-600",
    archived: "bg-ad-sunken text-ad-faint",
    new: "bg-sky-500/10 text-sky-600",
    "in-progress": "bg-amber-500/10 text-amber-600",
    responded: "bg-emerald-500/10 text-emerald-600",
    closed: "bg-ad-sunken text-ad-faint",
    spam: "bg-rose-500/10 text-rose-500",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${tone[status] ?? "bg-ad-sunken text-ad-muted"}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {status.replace("-", " ")}
    </span>
  );
}

/** Shared empty state, so no screen invents its own. */
export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="px-6 py-16 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ad-sunken text-ad-faint">
        <Icon size={20} aria-hidden="true" />
      </span>
      <p className="mt-4 text-sm font-semibold text-ad-ink">{title}</p>
      {description ? (
        <p className="mt-1 text-xs text-ad-faint">{description}</p>
      ) : null}
    </div>
  );
}
