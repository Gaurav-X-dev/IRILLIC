"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileEdit,
  FileText,
  LoaderCircle,
} from "lucide-react";
import { StatusPill, buttonClass } from "@/components/admin/ui";

export interface RecentContentRow {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const PAGE_SIZE = 6;

function editHref(row: RecentContentRow) {
  return row.type === "page"
    ? `/dashboard/page-${row.slug}`
    : `/dashboard/${row.type}s`;
}

function publicHref(row: RecentContentRow) {
  return row.slug === "home" ? "/" : `/${row.slug}`;
}

export function DashboardRecentContent({
  initialRows,
}: {
  initialRows: RecentContentRow[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: initialRows.length,
    pageCount: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          sort: "updated",
          summary: "true",
        });
        const response = await fetch(`/api/admin/content?${params}`, {
          signal: controller.signal,
          headers: { accept: "application/json" },
        });
        const payload = await response.json();
        if (!response.ok)
          throw new Error(payload.error || "Unable to load recent content");
        setRows(payload.data);
        setPagination(payload.pagination);
      } catch (cause) {
        if (controller.signal.aborted) return;
        setError(
          cause instanceof Error ? cause.message : "Unable to load content",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [page]);

  const pages = useMemo(() => {
    const start = Math.max(1, page - 2);
    const end = Math.min(pagination.pageCount, start + 4);
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) =>
      Number(start + index),
    );
  }, [page, pagination.pageCount]);

  return (
    <div className="relative">
      {loading ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-ad-surface/70 backdrop-blur-[2px]">
          <span className="inline-flex items-center gap-2 rounded-full bg-ad-raised px-3 py-2 text-xs font-semibold text-ad-muted shadow-ad-md ring-1 ring-ad-line">
            <LoaderCircle size={15} className="animate-spin" /> Loading content
          </span>
        </div>
      ) : null}

      {error ? (
        <p className="border-b border-ad-hairline bg-rose-500/10 px-5 py-3 text-xs font-medium text-rose-500">
          {error}
        </p>
      ) : null}

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-ad-hairline bg-ad-sunken text-[10px] uppercase tracking-[.12em] text-ad-faint">
              <th className="px-5 py-3 font-semibold">Content</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Last updated</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ad-hairline">
            {rows.map((row) => (
              <RecentDesktopRow key={row.id} row={row} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-ad-hairline md:hidden">
        {rows.map((row) => (
          <RecentMobileRow key={row.id} row={row} />
        ))}
      </div>

      <nav
        className="flex flex-col gap-3 border-t border-ad-hairline bg-ad-sunken/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        aria-label="Recent content pagination"
      >
        <p className="text-[11px] text-ad-muted">
          Showing{" "}
          <strong className="tabular text-ad-ink">
            {pagination.total ? (page - 1) * PAGE_SIZE + 1 : 0}
          </strong>
          –
          <strong className="tabular text-ad-ink">
            {Math.min(page * PAGE_SIZE, pagination.total)}
          </strong>{" "}
          of <strong className="tabular text-ad-ink">{pagination.total}</strong>
        </p>
        <div className="flex items-center justify-between gap-1 sm:justify-end">
          <PageButton
            label="Previous page"
            disabled={!pagination.hasPrevious || loading}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            <ChevronLeft size={15} />
          </PageButton>
          <span className="flex items-center gap-1">
            {pages.map((number) => (
              <button
                key={number}
                type="button"
                onClick={() => setPage(number)}
                aria-current={number === page ? "page" : undefined}
                className={`grid h-8 min-w-8 place-items-center rounded-lg px-2 text-[11px] font-bold transition-colors ${number === page ? "bg-ad-accent text-white" : "text-ad-muted hover:bg-ad-surface hover:text-ad-ink"}`}
              >
                {number}
              </button>
            ))}
          </span>
          <PageButton
            label="Next page"
            disabled={!pagination.hasNext || loading}
            onClick={() => setPage((value) => value + 1)}
          >
            <ChevronRight size={15} />
          </PageButton>
        </div>
      </nav>
    </div>
  );
}

function RecentDesktopRow({ row }: { row: RecentContentRow }) {
  return (
    <tr className="group text-xs transition-colors hover:bg-ad-sunken">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ad-accent-soft text-ad-accent transition-transform group-hover:scale-105">
            <FileText size={16} />
          </span>
          <span className="min-w-0">
            <strong className="block truncate font-semibold text-ad-ink">
              {row.title}
            </strong>
            <span className="mt-0.5 block text-[10px] text-ad-faint">
              {row.type} · /{row.slug}
            </span>
          </span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <StatusPill status={row.status} />
      </td>
      <td className="tabular px-4 py-3.5 text-ad-muted">
        {formatUpdated(row.updatedAt)}
      </td>
      <td className="px-5 py-3.5">
        <RowActions row={row} />
      </td>
    </tr>
  );
}

function RecentMobileRow({ row }: { row: RecentContentRow }) {
  return (
    <article className="p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ad-accent-soft text-ad-accent">
          <FileText size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <strong className="block truncate text-xs font-semibold text-ad-ink">
            {row.title}
          </strong>
          <span className="mt-1 block truncate text-[10px] text-ad-faint">
            {row.type} · /{row.slug}
          </span>
        </div>
        <StatusPill status={row.status} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-ad-hairline pt-3">
        <time className="tabular text-[10px] text-ad-faint">
          {formatUpdated(row.updatedAt)}
        </time>
        <RowActions row={row} />
      </div>
    </article>
  );
}

function RowActions({ row }: { row: RecentContentRow }) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link href={editHref(row)} className={buttonClass.subtle}>
        <FileEdit size={12} /> Edit
      </Link>
      {row.type === "page" && row.status === "published" ? (
        <Link
          href={publicHref(row)}
          target="_blank"
          aria-label={`Open ${row.title} on the website`}
          className="grid h-8 w-8 place-items-center rounded-xl text-ad-faint ring-1 ring-ad-line transition-colors hover:bg-ad-accent-soft hover:text-ad-accent"
        >
          <Eye size={14} />
        </Link>
      ) : null}
    </div>
  );
}

function PageButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-lg bg-ad-surface text-ad-muted ring-1 ring-ad-line transition-colors hover:text-ad-accent disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function formatUpdated(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
