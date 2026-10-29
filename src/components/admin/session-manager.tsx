"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  LogOut,
  Monitor,
  RefreshCw,
  Search,
  Smartphone,
  Tablet,
  TerminalSquare,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { EmptyState, StatTile, buttonClass } from "@/components/admin/ui";
import {
  ServerPagination,
  type Pagination,
} from "@/components/admin/audit-log-viewer";
import { useConfirm } from "@/components/admin/confirm";
import { useToast } from "@/components/admin/toast";

interface Device {
  browser: string;
  os: string;
  type: "Desktop" | "Mobile" | "Tablet" | "Bot" | "Unknown";
  summary: string;
}

interface SessionRow {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastSeenAt: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
  userRole: string | null;
  device: Device;
}

interface Summary {
  active: number;
  total: number;
  signInsThisWeek: number;
}

const DEVICE_ICON: Record<Device["type"], LucideIcon> = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
  Bot: TerminalSquare,
  Unknown: Monitor,
};

function sessionState(row: SessionRow) {
  if (row.revokedAt)
    return { label: "Signed out", tone: "bg-ad-sunken text-ad-faint" };
  if (new Date(row.expiresAt) < new Date())
    return { label: "Expired", tone: "bg-ad-sunken text-ad-faint" };
  return { label: "Active", tone: "bg-emerald-500/10 text-emerald-600" };
}

function relative(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} d ago`;
}

/**
 * Sign-in sessions with the device each one came from, and the ability to end
 * any of them immediately.
 */
export function SessionManager() {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const confirm = useConfirm();
  const toast = useToast();
  useEffect(() => {
    if (error) toast("error", error);
  }, [error, toast]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        status,
      });
      if (search.trim()) query.set("search", search.trim());
      const response = await fetch(`/api/admin/sessions?${query}`);
      const payload = await response.json();
      if (!response.ok || payload.success === false)
        throw new Error(payload.error ?? "Unable to load sessions.");
      setRows(payload.data);
      setSummary(payload.summary);
      setPagination(payload.pagination);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to load sessions.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(load, search ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [load, search]);

  useEffect(() => {
    setPage(1);
  }, [search, status, limit]);

  async function revoke(row: SessionRow) {
    const ok = await confirm({
      title: `Sign out ${row.userName ?? "this account"}?`,
      message: `The session on ${row.device.summary} ends immediately and they will have to sign in again.`,
      confirmLabel: "End session",
      tone: "danger",
    });
    if (!ok) return;
    setBusyId(row.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/sessions/${row.id}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success === false)
        throw new Error(payload?.error ?? "Unable to end that session.");
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to end that session.",
      );
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="space-y-4">
      {summary ? (
        <section className="grid gap-4 sm:grid-cols-3">
          <StatTile
            label="Active sessions"
            value={summary.active}
            icon={Monitor}
            caption="Signed in right now"
          />
          <StatTile
            label="Sign-ins this week"
            value={summary.signInsThisWeek}
            icon={LogOut}
            caption="Successful sign-ins, last 7 days"
          />
          <StatTile
            label="Sessions on record"
            value={summary.total}
            icon={TerminalSquare}
            caption="Including ended sessions"
          />
        </section>
      ) : null}

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
            placeholder="Search by account, device or IP…"
            aria-label="Search sessions"
            className="h-10 w-full rounded-xl bg-ad-sunken pl-9 pr-3 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-xs">
          <span className="sr-only">Filter sessions</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-xl px-3 text-sm"
          >
            <option value="active">Active only</option>
            <option value="ended">Ended only</option>
            <option value="all">All sessions</option>
          </select>
        </label>

        <button
          type="button"
          onClick={load}
          className={buttonClass.ghost}
          aria-label="Reload sessions"
        >
          <RefreshCw
            size={14}
            aria-hidden="true"
            className={loading ? "animate-spin" : undefined}
          />
          Refresh
        </button>

      </div>

      <div className="ad-card overflow-hidden rounded-2xl bg-ad-surface shadow-ad-sm ring-1 ring-ad-line">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead>
              <tr className="border-b border-ad-hairline bg-ad-sunken text-[10px] uppercase tracking-[.12em] text-ad-faint">
                <th className="px-5 py-2.5 font-semibold">Account</th>
                <th className="px-4 py-2.5 font-semibold">Device</th>
                <th className="px-4 py-2.5 font-semibold">IP address</th>
                <th className="px-4 py-2.5 font-semibold">Signed in</th>
                <th className="px-4 py-2.5 font-semibold">Last seen</th>
                <th className="px-4 py-2.5 font-semibold">State</th>
                <th className="px-5 py-2.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ad-hairline">
              {rows.map((row) => {
                const state = sessionState(row);
                const Icon = DEVICE_ICON[row.device.type];
                const live = state.label === "Active";
                return (
                  <tr
                    key={row.id}
                    className="text-xs transition-colors hover:bg-ad-sunken"
                  >
                    <td className="px-5 py-3">
                      <strong className="block font-semibold text-ad-ink">
                        {row.userName ?? "Deleted account"}
                      </strong>
                      <span className="block text-[11px] text-ad-faint">
                        {row.userEmail ?? "—"}
                        {row.userRole ? ` · ${row.userRole}` : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <Icon
                          size={15}
                          className="shrink-0 text-ad-faint"
                          aria-hidden="true"
                        />
                        <span className="min-w-0">
                          <span className="block text-ad-muted">
                            {row.device.summary}
                          </span>
                          <span className="block text-[10px] text-ad-faint">
                            {row.device.type}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="tabular px-4 py-3 font-mono text-[11px] text-ad-faint">
                      {row.ipAddress ?? "—"}
                    </td>
                    <td className="tabular whitespace-nowrap px-4 py-3 text-ad-muted">
                      {new Date(row.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ad-muted">
                      {relative(row.lastSeenAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${state.tone}`}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-current"
                          aria-hidden="true"
                        />
                        {state.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {live ? (
                        <button
                          type="button"
                          onClick={() => revoke(row)}
                          disabled={busyId === row.id}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[11px] font-semibold text-rose-500 ring-1 ring-rose-500/30 transition-colors hover:bg-rose-500/10 disabled:opacity-40"
                        >
                          <LogOut size={12} aria-hidden="true" />
                          Sign out
                        </button>
                      ) : (
                        <span className="text-[11px] text-ad-faint">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!rows.length && !loading ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Monitor}
                      title="No sessions to show"
                      description="Sign-ins appear here with the device they came from."
                    />
                  </td>
                </tr>
              ) : null}
              {loading && !rows.length ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Loader2
                      size={20}
                      className="mx-auto animate-spin text-ad-faint"
                      aria-hidden="true"
                    />
                    <p className="mt-3 text-xs text-ad-faint">
                      Loading sessions…
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
