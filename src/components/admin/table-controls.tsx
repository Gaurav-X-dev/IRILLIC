"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

export type SortDirection = "asc" | "desc";

interface TableControlsOptions<Row> {
  rows: Row[];
  /** Fields concatenated and matched against the search term. */
  searchFields: (row: Row) => (string | null | undefined)[];
  /** Sortable columns, keyed by the id used in the header buttons. */
  sorters: Record<string, (a: Row, b: Row) => number>;
  initialSort: string;
  initialDirection?: SortDirection;
  pageSize?: number;
  /** Optional named filters, each narrowing the rows further. */
  filters?: Record<string, (row: Row, value: string) => boolean>;
}

/**
 * Client-side search, filtering, sorting and pagination shared by the admin
 * tables. Row counts here are in the hundreds, so sorting in the browser keeps
 * the panel responsive without extra round trips.
 */
export function useTableControls<Row>({
  rows,
  searchFields,
  sorters,
  initialSort,
  initialDirection = "desc",
  pageSize = 10,
  filters = {},
}: TableControlsOptions<Row>) {
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sort, setSort] = useState(initialSort);
  const [direction, setDirection] = useState<SortDirection>(initialDirection);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (
        term &&
        !searchFields(row)
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term)
      )
        return false;
      return Object.entries(filterValues).every(([key, value]) => {
        if (!value || value === "all") return true;
        const predicate = filters[key];
        return predicate ? predicate(row, value) : true;
      });
    });
    // `searchFields` and `filters` are inline literals in callers; the row data
    // and the user's choices are what should drive recomputation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search, filterValues]);

  const sorted = useMemo(() => {
    const compare = sorters[sort];
    if (!compare) return filtered;
    const next = [...filtered].sort(compare);
    return direction === "asc" ? next : next.reverse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sort, direction]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  // Keep the current page inside range as filters narrow the result set.
  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);
  useEffect(() => {
    setPage(1);
  }, [search, filterValues]);

  const safePage = Math.min(page, pageCount);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  function toggleSort(id: string) {
    if (id === sort) {
      setDirection((value) => (value === "asc" ? "desc" : "asc"));
      return;
    }
    setSort(id);
    setDirection("desc");
  }

  function setFilter(key: string, value: string) {
    setFilterValues((current) => ({ ...current, [key]: value }));
  }

  return {
    search,
    setSearch,
    filterValues,
    setFilter,
    sort,
    direction,
    toggleSort,
    rows: pageRows,
    total: sorted.length,
    unfilteredTotal: rows.length,
    page: safePage,
    pageCount,
    pageSize,
    setPage,
  };
}

export function TableSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-xs">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-ad-faint"
        size={16}
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-xl bg-ad-sunken pl-9 pr-3 text-sm text-ad-ink outline-none ring-1 ring-ad-line transition-colors placeholder:text-ad-faint focus:ring-ad-accent"
      />
    </div>
  );
}

export function TableFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="whitespace-nowrap text-ad-faint">{label}</span>
      <select
        value={value || "all"}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl bg-ad-surface px-3 text-sm text-ad-ink outline-none ring-1 ring-ad-line transition-colors focus:ring-ad-accent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SortableHeader({
  id,
  label,
  sort,
  direction,
  onSort,
  className = "",
}: {
  id: string;
  label: string;
  sort: string;
  direction: SortDirection;
  onSort: (id: string) => void;
  className?: string;
}) {
  const active = sort === id;
  return (
    <th
      className={`px-4 py-3 font-semibold ${className}`}
      aria-sort={
        active ? (direction === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <button
        type="button"
        onClick={() => onSort(id)}
        className={`inline-flex items-center gap-1 transition-colors hover:text-ad-muted ${active ? "text-ad-ink" : ""}`}
      >
        {label}
        {active ? (
          direction === "asc" ? (
            <ArrowUp size={12} aria-hidden="true" />
          ) : (
            <ArrowDown size={12} aria-hidden="true" />
          )
        ) : null}
      </button>
    </th>
  );
}

export function TablePagination({
  page,
  pageCount,
  total,
  pageSize,
  onPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ad-hairline px-5 py-3 text-xs text-ad-muted">
      <span>
        Showing <strong className="tabular text-ad-ink">{from}</strong>–
        <strong className="tabular text-ad-ink">{to}</strong> of{" "}
        <strong className="tabular text-ad-ink">{total}</strong>
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="grid h-8 w-8 place-items-center rounded-lg text-ad-muted ring-1 ring-ad-line transition-colors hover:bg-ad-sunken disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="tabular px-2 font-semibold text-ad-muted">
          {page} / {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= pageCount}
          className="grid h-8 w-8 place-items-center rounded-lg text-ad-muted ring-1 ring-ad-line transition-colors hover:bg-ad-sunken disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
