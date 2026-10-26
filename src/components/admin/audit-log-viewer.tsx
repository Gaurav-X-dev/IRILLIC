"use client";

import { useCallback, useEffect, useState } from "react";
import { FileClock, Filter, Loader2, RefreshCw, Search, X } from "lucide-react";
import { EmptyState, StatusPill, buttonClass } from "@/components/admin/ui";
import { ExportButtons } from "@/components/admin/export-buttons";

interface AuditRow {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  changes: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

const ACTION_TONE: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-600",
  update: "bg-sky-500/10 text-sky-600",
  delete: "bg-rose-500/10 text-rose-500",
  upload: "bg-violet-500/10 text-violet-600",
  revoke: "bg-amber-500/10 text-amber-600",
};

const RANGES = [
  { value: "0", label: "All time" },
  { value: "1", label: "Last 24 hours" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

/**
 * The audit trail, paged from the server. Every administrator action the API
 * records lands here, so the list is expected to grow without bound.
 */
export function AuditLogViewer() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [days, setDays] = useState("0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<AuditRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        days,
      });
      if (search.trim()) query.set("search", search.trim());
      if (action !== "all") query.set("action", action);
      const response = await fetch(`/api/admin/audit?${query}`);
      const payload = await response.json();
      if (!response.ok || payload.success === false)
        throw new Error(payload.error ?? "Unable to load the audit trail.");
      setRows(payload.data);
      setActions(payload.actions ?? []);
      setPagination(payload.pagination);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load the audit trail.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, action, days]);

  // Debounced so typing in the search box does not fire a request per keypress.
  useEffect(() => {
    const timer = window.setTimeout(load, search ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [load, search]);

  // Any change to the filters returns to the first page.
  useEffect(() => {
    setPage(1);
  }, [search, action, days, limit]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            size={15}
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ad-faint"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by administrator, record or action…"
            aria-label="Search the audit trail"
            className="h-10 w-full rounded-xl bg-ad-sunken pl-9 pr-3 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-xs">
          <Filter size={13} className="text-ad-faint" aria-hidden="true" />
          <span className="sr-only">Filter by action</span>
          <select
            value={action}
            onChange={(event) => setAction(event.target.value)}
            className="h-10 rounded-xl px-3 text-sm"
          >
            <option value="all">All actions</option>
            {actions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs">
          <span className="sr-only">Filter by period</span>
          <select
            value={days}
            onChange={(event) => setDays(event.target.value)}
            className="h-10 rounded-xl px-3 text-sm"
          >
            {RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={load}
          className={buttonClass.ghost}
          aria-label="Reload the audit trail"
        >
          <RefreshCw
            size={14}
            aria-hidden="true"
            className={loading ? "animate-spin" : undefined}
          />
          Refresh
        </button>

        <ExportButtons dataset="audit" />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-500"
        >
          {error}
        </p>
      ) : null}

      <div className="ad-card overflow-hidden rounded-2xl bg-ad-surface shadow-ad-sm ring-1 ring-ad-line">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left">
            <thead>
              <tr className="border-b border-ad-hairline bg-ad-sunken text-[10px] uppercase tracking-[.12em] text-ad-faint">
                <th className="px-5 py-2.5 font-semibold">When</th>
                <th className="px-4 py-2.5 font-semibold">Administrator</th>
                <th className="px-4 py-2.5 font-semibold">Action</th>
                <th className="px-4 py-2.5 font-semibold">Record</th>
                <th className="px-4 py-2.5 font-semibold">IP address</th>
                <th className="px-5 py-2.5 text-right font-semibold">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ad-hairline">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="text-xs transition-colors hover:bg-ad-sunken"
                >
                  <td className="tabular whitespace-nowrap px-5 py-3 text-ad-muted">
                    {new Date(row.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <strong className="block font-semibold text-ad-ink">
                      {row.userName ?? "Deleted account"}
                    </strong>
                    <span className="block text-[11px] text-ad-faint">
                      {row.userEmail ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${ACTION_TONE[row.action] ?? "bg-ad-sunken text-ad-muted"}`}
                    >
                      {row.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block capitalize text-ad-muted">
                      {row.entityType}
                    </span>
                    <span className="block truncate font-mono text-[10px] text-ad-faint">
                      {row.entityId ?? "—"}
                    </span>
                  </td>
                  <td className="tabular px-4 py-3 font-mono text-[11px] text-ad-faint">
                    {row.ipAddress ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setDetail(row)}
                      className={buttonClass.subtle}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {!rows.length && !loading ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={FileClock}
                      title="No activity recorded"
                      description="Administrator actions appear here as they happen."
                    />
                  </td>
                </tr>
              ) : null}
              {loading && !rows.length ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Loader2
                      size={20}
                      className="mx-auto animate-spin text-ad-faint"
                      aria-hidden="true"
                    />
                    <p className="mt-3 text-xs text-ad-faint">
                      Loading the audit trail…
                    </p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <ServerPagination
          pagination={pagination}
          limit={limit}
          onLimit={setLimit}
          onPage={setPage}
          busy={loading}
        />
      </div>

      {detail ? (
        <AuditDetail entry={detail} onClose={() => setDetail(null)} />
      ) : null}
    </div>
  );
}

function AuditDetail({
  entry,
  onClose,
}: {
  entry: AuditRow;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Audit entry"
        className="animate-slide-in relative flex h-full w-[min(32rem,100vw)] flex-col overflow-y-auto border-l border-ad-line bg-ad-raised shadow-ad-lg"
      >
        <header className="flex items-start justify-between gap-4 border-b border-ad-hairline px-6 py-5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-ad-faint">
              {entry.entityType} · {entry.action}
            </p>
            <h2 className="mt-1 text-lg font-bold text-ad-ink">
              {entry.userName ?? "Deleted account"}
            </h2>
            <time className="text-[11px] text-ad-faint">
              {new Date(entry.createdAt).toLocaleString("en-IN")}
            </time>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="tap-target rounded-lg p-2 text-ad-faint transition-colors hover:bg-ad-sunken hover:text-ad-muted"
          >
            <X size={18} />
          </button>
        </header>

        <dl className="space-y-3 border-b border-ad-hairline px-6 py-5 text-xs">
          <Row label="Email">{entry.userEmail ?? "—"}</Row>
          <Row label="Record">
            <span className="font-mono text-[11px]">
              {entry.entityId ?? "—"}
            </span>
          </Row>
          <Row label="IP address">
            <span className="font-mono text-[11px]">
              {entry.ipAddress ?? "—"}
            </span>
          </Row>
        </dl>

        <div className="px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-ad-faint">
            What changed
          </p>
          <pre className="mt-2 max-h-[50vh] overflow-auto rounded-xl bg-ad-sunken p-4 font-mono text-[11px] leading-5 text-ad-muted">
            {JSON.stringify(entry.changes, null, 2)}
          </pre>
        </div>
      </aside>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <dt className="w-28 shrink-0 text-ad-faint">{label}</dt>
      <dd className="min-w-0 flex-1 break-words text-ad-muted">{children}</dd>
    </div>
  );
}

/** Shared server-side pagination control for the security screens. */
export function ServerPagination({
  pagination,
  limit,
  onLimit,
  onPage,
  busy,
}: {
  pagination: Pagination | null;
  limit: number;
  onLimit: (limit: number) => void;
  onPage: (updater: (page: number) => number) => void;
  busy: boolean;
}) {
  const page = pagination?.page ?? 1;
  const total = pagination?.total ?? 0;
  const pageCount = pagination?.pageCount ?? 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ad-hairline px-5 py-3 text-xs text-ad-muted">
      <span>
        Showing <strong className="tabular text-ad-ink">{from}</strong>–
        <strong className="tabular text-ad-ink">{to}</strong> of{" "}
        <strong className="tabular text-ad-ink">{total}</strong>
      </span>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          <span className="text-ad-faint">Rows</span>
          <select
            value={limit}
            onChange={(event) => onLimit(Number(event.target.value))}
            className="h-8 rounded-lg px-2 text-xs"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPage((value) => Math.max(1, value - 1))}
            disabled={busy || !pagination?.hasPrevious}
            className="h-8 rounded-lg px-3 text-ad-muted ring-1 ring-ad-line transition-colors hover:bg-ad-sunken disabled:opacity-40"
          >
            Previous
          </button>
          <span className="tabular px-2 font-semibold">
            {page} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => onPage((value) => value + 1)}
            disabled={busy || !pagination?.hasNext}
            className="h-8 rounded-lg px-3 text-ad-muted ring-1 ring-ad-line transition-colors hover:bg-ad-sunken disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export type { Pagination };
export { StatusPill };
