"use client";

import { useId, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Database,
  FileClock,
  Inbox,
  Radio,
} from "lucide-react";

export type DashboardDataPoint = { label: string; value: number };

const SERIES = ["#55a2ff", "#34d399", "#fbbf24", "#fb7185", "#a78bfa"];

function percentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function total(items: DashboardDataPoint[]) {
  return items.reduce((sum, item) => sum + item.value, 0);
}

export function DashboardVisualizations({
  activity,
  contentStatus,
  enquiryStatus,
  contentMix,
  auditActions,
}: {
  activity: DashboardDataPoint[];
  contentStatus: DashboardDataPoint[];
  enquiryStatus: DashboardDataPoint[];
  contentMix: DashboardDataPoint[];
  auditActions: DashboardDataPoint[];
}) {
  const activityTotal = total(activity);
  const contentTotal = total(contentMix);
  const enquiryTotal = total(enquiryStatus);
  const auditTotal = total(auditActions);

  return (
    <section className="dashboard-analytics overflow-hidden rounded-[28px] bg-[#07132f] text-white shadow-[0_24px_70px_-34px_rgba(7,19,47,.78)] ring-1 ring-[#172d5d]">
      <header className="relative overflow-hidden border-b border-white/10 px-5 py-5 sm:px-7">
        <div className="absolute -right-20 -top-28 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-48 top-0 h-28 w-28 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-sky-300">
              <Radio
                size={13}
                className="dashboard-live-dot"
                aria-hidden="true"
              />
              Live website intelligence
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
              Content operations overview
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-slate-400">
              Database-backed publishing, engagement and administrator activity.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Summary icon={FileClock} label="Changes" value={activityTotal} />
            <Summary icon={Database} label="Content" value={contentTotal} />
            <Summary icon={Inbox} label="Enquiries" value={enquiryTotal} />
            <Summary icon={Activity} label="Actions" value={auditTotal} />
          </div>
        </div>
      </header>

      <div className="grid gap-px bg-white/10 xl:grid-cols-12">
        <ActivityChart items={activity} />
        <StatusDonut items={contentStatus} />
        <EnquiryColumns items={enquiryStatus} />
        <RankedBars items={contentMix} />
      </div>

      <AuditStrip items={auditActions} />
    </section>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: number;
}) {
  return (
    <div className="flex min-w-28 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[.055] px-3 py-2.5 backdrop-blur-sm">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-400/10 text-sky-300">
        <Icon size={15} aria-hidden="true" />
      </span>
      <span>
        <strong className="tabular block text-sm leading-none text-white">
          {value.toLocaleString("en-IN")}
        </strong>
        <span className="mt-1 block text-[9px] uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </span>
    </div>
  );
}

function PanelHeader({
  eyebrow,
  title,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  icon: typeof Activity;
}) {
  return (
    <header className="flex items-start justify-between gap-4 px-5 pb-2 pt-5 sm:px-6">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[.2em] text-sky-300">
          {eyebrow}
        </p>
        <h3 className="mt-1.5 text-[15px] font-semibold text-white">{title}</h3>
      </div>
      <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-400">
        <Icon size={16} aria-hidden="true" />
      </span>
    </header>
  );
}

function ActivityChart({ items }: { items: DashboardDataPoint[] }) {
  const gradientId = useId().replace(/:/g, "");
  const [hovered, setHovered] = useState<number | null>(null);
  const width = 760;
  const height = 250;
  const left = 42;
  const top = 22;
  const bottom = 30;
  const max = Math.max(1, ...items.map((item) => item.value));
  const step = (width - left * 2) / Math.max(items.length - 1, 1);
  const points = items.map((item, index) => ({
    ...item,
    x: left + index * step,
    y: top + (1 - item.value / max) * (height - top - bottom),
  }));
  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");
  const area = points.length
    ? `${line} L${points.at(-1)?.x},${height - bottom} L${left},${height - bottom} Z`
    : "";
  const active = hovered === null ? null : points[hovered];

  return (
    <article className="min-h-[390px] bg-gradient-to-br from-[#0b1b3f] to-[#102656] xl:col-span-8">
      <PanelHeader
        eyebrow="Last 7 days"
        title="CMS activity trend"
        icon={Activity}
      />
      <div className="relative px-4 pb-4 sm:px-6">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[255px] w-full overflow-visible"
          role="img"
          aria-label="Content changes recorded during the last seven days"
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#55a2ff" stopOpacity=".42" />
              <stop offset="1" stopColor="#55a2ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((row) => {
            const y = top + (row * (height - top - bottom)) / 4;
            const value = Math.round(max - (row * max) / 4);
            return (
              <g key={row}>
                <line
                  x1={left}
                  x2={width - left}
                  y1={y}
                  y2={y}
                  stroke="rgba(148,163,184,.16)"
                  strokeDasharray="4 5"
                />
                <text x="2" y={y + 4} fill="#7183a8" fontSize="10">
                  {value}
                </text>
              </g>
            );
          })}
          {area ? <path d={area} fill={`url(#${gradientId})`} /> : null}
          {line ? (
            <path
              d={line}
              className="dashboard-chart-line"
              fill="none"
              stroke="#64aaff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          {points.map((point, index) => (
            <g key={point.label}>
              <circle
                cx={point.x}
                cy={point.y}
                r={hovered === index ? 6 : 4}
                fill="#64aaff"
                stroke="#102656"
                strokeWidth="3"
              />
              <rect
                x={point.x - step / 2}
                y={top}
                width={Math.max(step, 30)}
                height={height - top - bottom}
                fill="transparent"
                onMouseEnter={() => setHovered(index)}
              />
            </g>
          ))}
        </svg>

        {active ? (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-white/10 bg-[#061029] px-3 py-2 shadow-xl"
            style={{
              left: `${(active.x / width) * 100}%`,
              top: `${Math.max(12, (active.y / height) * 75)}%`,
            }}
          >
            <strong className="tabular block text-sm text-white">
              {active.value}
            </strong>
            <span className="text-[9px] text-slate-400">
              {active.label} changes
            </span>
          </div>
        ) : null}

        <div className="grid grid-cols-7 pl-7 text-center text-[10px] text-slate-500">
          {items.map((item) => (
            <span key={item.label}>{item.label}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-white/10 px-6 py-3.5 text-[11px] text-slate-400">
        <CheckCircle2
          size={14}
          className="text-emerald-400"
          aria-hidden="true"
        />
        {total(items).toLocaleString("en-IN")} database changes recorded in this
        range.
      </div>
    </article>
  );
}

function StatusDonut({ items }: { items: DashboardDataPoint[] }) {
  const sum = total(items);
  let cursor = 0;
  const stops = items
    .map((item, index) => {
      const start = cursor;
      cursor += percentage(item.value, sum);
      return `${SERIES[index % SERIES.length]} ${start}% ${cursor}%`;
    })
    .join(",");

  return (
    <article className="min-h-[390px] bg-gradient-to-br from-[#0d1d43] to-[#152d63] xl:col-span-4">
      <PanelHeader
        eyebrow="Publishing health"
        title="Content status"
        icon={Database}
      />
      <div className="grid place-items-center px-6 py-3">
        <div
          className="grid h-40 w-40 place-items-center rounded-full shadow-[0_0_45px_rgba(85,162,255,.12)]"
          style={{
            background: sum
              ? `conic-gradient(${stops})`
              : "conic-gradient(#26395f 0 100%)",
          }}
        >
          <div className="grid h-[104px] w-[104px] place-items-center rounded-full bg-[#10234d] text-center shadow-inner">
            <div>
              <strong className="tabular block text-3xl leading-none text-white">
                {sum.toLocaleString("en-IN")}
              </strong>
              <span className="mt-1 block text-[9px] uppercase tracking-[.14em] text-slate-500">
                records
              </span>
            </div>
          </div>
        </div>
      </div>
      <ul className="space-y-2 px-6 pb-5">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-3 text-[11px]">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: SERIES[index % SERIES.length] }}
            />
            <span className="flex-1 capitalize text-slate-300">
              {item.label}
            </span>
            <strong className="tabular text-white">{item.value}</strong>
            <span className="tabular w-9 text-right text-slate-500">
              {percentage(item.value, sum)}%
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function EnquiryColumns({ items }: { items: DashboardDataPoint[] }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <article className="min-h-[335px] bg-gradient-to-br from-[#0a193a] to-[#102758] xl:col-span-7">
      <PanelHeader
        eyebrow="Customer requests"
        title="Enquiry pipeline"
        icon={Inbox}
      />
      <div className="flex h-[235px] items-end gap-4 px-6 pb-5 pt-7 sm:gap-7">
        {items.map((item, index) => (
          <div
            key={item.label}
            className="flex h-full flex-1 flex-col items-center justify-end"
          >
            <strong className="tabular mb-2 text-xs text-white">
              {item.value}
            </strong>
            <div className="flex h-[145px] w-full max-w-[76px] items-end rounded-t-lg bg-white/[.035]">
              <div
                className="w-full rounded-t-lg shadow-[0_0_24px_rgba(85,162,255,.18)] transition-[height]"
                style={{
                  height: `${item.value ? Math.max(7, (item.value / max) * 100) : 3}%`,
                  background: `linear-gradient(180deg, ${SERIES[index % SERIES.length]}, color-mix(in srgb, ${SERIES[index % SERIES.length]} 70%, #07132f))`,
                }}
              />
            </div>
            <span className="mt-3 max-w-20 truncate text-[9px] capitalize text-slate-500">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function RankedBars({ items }: { items: DashboardDataPoint[] }) {
  const sum = total(items);
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <article className="min-h-[335px] bg-gradient-to-br from-[#0d1d43] to-[#162d62] xl:col-span-5">
      <PanelHeader
        eyebrow="CMS inventory"
        title="Content distribution"
        icon={BarChart3}
      />
      <div className="space-y-4 px-6 py-5">
        {items.map((item, index) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between text-[11px]">
              <span className="font-medium text-slate-300">{item.label}</span>
              <span className="tabular text-slate-500">
                <strong className="mr-2 text-white">{item.value}</strong>
                {percentage(item.value, sum)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[.07]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${item.value ? Math.max(4, (item.value / max) * 100) : 0}%`,
                  background: `linear-gradient(90deg, ${SERIES[index % SERIES.length]}, ${SERIES[(index + 1) % SERIES.length]})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function AuditStrip({ items }: { items: DashboardDataPoint[] }) {
  const sum = total(items);
  return (
    <div className="border-t border-white/10 bg-[#081731] px-5 py-5 sm:px-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="shrink-0 xl:w-48">
          <p className="text-[9px] font-bold uppercase tracking-[.2em] text-violet-300">
            Audit trail
          </p>
          <h3 className="mt-1 text-sm font-semibold text-white">
            Administrator actions
          </h3>
        </div>
        <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((item, index) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-white/[.08] bg-white/[.035] px-3 py-2.5"
            >
              <span
                className="h-8 w-1 rounded-full"
                style={{ background: SERIES[index % SERIES.length] }}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10px] capitalize text-slate-300">
                  {item.label.replaceAll("_", " ")}
                </span>
                <span className="tabular mt-0.5 block text-[9px] text-slate-600">
                  {percentage(item.value, sum)}% of actions
                </span>
              </span>
              <strong className="tabular text-sm text-white">
                {item.value}
              </strong>
            </div>
          ))}
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 px-4 py-3 text-[11px] text-slate-500">
              No administrator actions have been recorded.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
