"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Search, ShieldAlert } from "lucide-react";
import { EmptyState, buttonClass } from "@/components/admin/ui";
import {
  ServerPagination,
  type Pagination,
} from "@/components/admin/audit-log-viewer";

interface Device {
  browser: string;
  os: string;
  type: string;
  summary: string;
}

interface EventRow {
  id: string;
  event: string;
  email: string | null;
  ipAddress: string | null;
  success: boolean;
  createdAt: string;
  device: Device;
}

const RANGES = [
  { value: "0", label: "All time" },
  { value: "1", label: "Last 24 hours" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
];

function prettyEvent(event: string) {
  return event.replace(/_/g, " ");
}

/**
 * Sign-in attempts, lockouts and other security events. Failed attempts are
 * what an administrator comes here to find, so the outcome leads the row.
 */
export function SecurityEventViewer() {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState("");
  const [event, setEvent] = useState("all");
  const [days, setDays] = useState("7");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      if (event !== "all") query.set("event", event);
      const response = await fetch(`/api/admin/security-events?${query}`);
      const payload = await response.json();
      if (!response.ok || payload.success === false)
        throw new Error(payload.error ?? "Unable to load security events.");
      setRows(payload.data);
      setEvents(payload.events ?? []);
      setPagination(payload.pagination);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load security events.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, event, days]);

  useEffect(() => {
    const timer = window.setTimeout(load, search ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [load, search]);

  useEffect(() => {
    setPage(1);
  }, [search, event, days, limit]);

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
            onChange={(value) => setSearch(value.target.value)}
            placeholder="Search by email, IP or event…"
            aria-label="Search security events"
            className="h-10 w-full rounded-xl bg-ad-sunken pl-9 pr-3 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-xs">
          <span className="sr-only">Filter by event</span>
          <select
            value={event}
            onChange={(value) => setEvent(value.target.value)}
            className="h-10 rounded-xl px-3 text-sm"
          >
            <option value="all">All events</option>
            {events.map((name) => (
              <option key={name} value={name}>
                {prettyEvent(name)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs">
          <span className="sr-only">Filter by period</span>
          <select
            value={days}
            onChange={(value) => setDays(value.target.value)}
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
          aria-label="Reload security events"
        >
          <RefreshCw
            size={14}
            aria-hidden="true"
            className={loading ? "animate-spin" : undefined}
          />
          Refresh
        </button>

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
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-ad-hairline bg-ad-sunken text-[10px] uppercase tracking-[.12em] text-ad-faint">
                <th className="px-5 py-2.5 font-semibold">When</th>
                <th className="px-4 py-2.5 font-semibold">Event</th>
                <th className="px-4 py-2.5 font-semibold">Outcome</th>
                <th className="px-4 py-2.5 font-semibold">Account</th>
                <th className="px-4 py-2.5 font-semibold">Device</th>
                <th className="px-5 py-2.5 font-semibold">IP address</th>
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
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 capitalize text-ad-ink">
                    {prettyEvent(row.event)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${row.success ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-500"}`}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-current"
                        aria-hidden="true"
                      />
                      {row.success ? "Success" : "Failed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ad-muted">
                    {row.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ad-muted">
                    {row.device.summary}
                  </td>
                  <td className="tabular px-5 py-3 font-mono text-[11px] text-ad-faint">
                    {row.ipAddress ?? "—"}
                  </td>
                </tr>
              ))}
              {!rows.length && !loading ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={ShieldAlert}
                      title="No security events in this period"
                      description="Sign-in attempts and lockouts appear here."
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
                      Loading security events…
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
    </div>
  );
}
