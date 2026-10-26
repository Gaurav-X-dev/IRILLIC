"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Mail,
  MessageSquareText,
  Phone,
  Trash2,
  X,
} from "lucide-react";
import { ENQUIRY_STATUSES } from "@/validations/cms.validation";
import { ExportButtons } from "@/components/admin/export-buttons";
import {
  SortableHeader,
  TableFilter,
  TablePagination,
  TableSearch,
  useTableControls,
} from "@/components/admin/table-controls";

export interface EnquiryRow {
  id: string;
  kind: string;
  name: string;
  email: string;
  phone: string | null;
  organisation: string | null;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
}

const STATUS_TONE: Record<string, string> = {
  new: "bg-sky-500/10 text-sky-600",
  "in-progress": "bg-amber-50 text-amber-700",
  responded: "bg-emerald-50 text-emerald-700",
  closed: "bg-ad-sunken text-ad-faint",
  spam: "bg-red-50 text-red-600",
};

function statusLabel(status: string) {
  return status.replace("-", " ");
}

export function EnquiryManager({ rows }: { rows: EnquiryRow[] }) {
  const router = useRouter();
  const [active, setActive] = useState<EnquiryRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const kinds = Array.from(new Set(rows.map((row) => row.kind))).sort();
  const table = useTableControls<EnquiryRow>({
    rows,
    searchFields: (row) => [
      row.name,
      row.email,
      row.subject,
      row.organisation,
      row.message,
    ],
    filters: {
      status: (row, value) => row.status === value,
      kind: (row, value) => row.kind === value,
    },
    sorters: {
      createdAt: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      name: (a, b) => a.name.localeCompare(b.name),
      status: (a, b) => a.status.localeCompare(b.status),
    },
    initialSort: "createdAt",
    pageSize: 12,
  });

  async function request(id: string, init: RequestInit) {
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/enquiries/${id}`, {
        headers: { "Content-Type": "application/json" },
        ...init,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success === false) {
        setError(payload?.error ?? "The change could not be saved.");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Network error. Please try again.");
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function changeStatus(row: EnquiryRow, status: string) {
    const saved = await request(row.id, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (saved && active?.id === row.id) setActive({ ...active, status });
  }

  async function remove(row: EnquiryRow) {
    if (
      !window.confirm(
        `Delete the enquiry from ${row.name}? This cannot be undone.`,
      )
    )
      return;
    const deleted = await request(row.id, { method: "DELETE" });
    if (deleted && active?.id === row.id) setActive(null);
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600"
        >
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl bg-ad-surface shadow-ad-sm ring-1 ring-ad-line">
        <div className="flex flex-wrap items-center gap-3 border-b border-ad-hairline px-5 py-4">
          <TableSearch
            value={table.search}
            onChange={table.setSearch}
            placeholder="Search name, email, subject…"
          />
          <TableFilter
            label="Status"
            value={table.filterValues.status ?? "all"}
            onChange={(value) => table.setFilter("status", value)}
            options={[
              { value: "all", label: "All statuses" },
              ...ENQUIRY_STATUSES.map((status) => ({
                value: status,
                label: statusLabel(status),
              })),
            ]}
          />
          {kinds.length > 1 ? (
            <TableFilter
              label="Type"
              value={table.filterValues.kind ?? "all"}
              onChange={(value) => table.setFilter("kind", value)}
              options={[
                { value: "all", label: "All types" },
                ...kinds.map((kind) => ({ value: kind, label: kind })),
              ]}
            />
          ) : null}
          <div className="sm:ml-auto">
            <ExportButtons dataset="enquiries" />
          </div>
        </div>

        <div className="divide-y divide-ad-hairline md:hidden">
          {table.rows.map((row) => (
            <article key={row.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActive(row)}
                  className="min-w-0 text-left"
                >
                  <strong className="block truncate text-[13px] font-semibold text-ad-ink">
                    {row.name}
                  </strong>
                  <span className="mt-0.5 block truncate text-[11px] text-ad-faint">
                    {row.email}
                  </span>
                </button>
                <select
                  value={row.status}
                  disabled={busyId === row.id}
                  onChange={(event) => changeStatus(row, event.target.value)}
                  aria-label={`Status for the enquiry from ${row.name}`}
                  className={`max-w-32 rounded-full px-2.5 text-[10px] font-semibold capitalize outline-none ${STATUS_TONE[row.status] ?? "bg-ad-sunken text-ad-faint"}`}
                >
                  {ENQUIRY_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setActive(row)}
                className="mt-3 block w-full rounded-xl bg-ad-sunken p-3 text-left"
              >
                <span className="block truncate text-xs font-medium text-ad-muted">
                  {row.subject}
                </span>
                <span className="mt-1 block text-[9px] uppercase tracking-wider text-ad-faint">
                  {row.kind}
                </span>
              </button>
              <div className="mt-3 flex items-center justify-between gap-3">
                <time className="text-[10px] text-ad-faint">
                  {row.createdAt.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActive(row)}
                    className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-ad-muted ring-1 ring-ad-line"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(row)}
                    disabled={busyId === row.id}
                    aria-label={`Delete the enquiry from ${row.name}`}
                    className="rounded-lg p-2 text-ad-faint transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
          {table.rows.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <MessageSquareText
                className="mx-auto mb-3 text-ad-faint"
                size={28}
              />
              <p className="text-xs text-ad-faint">
                {table.unfilteredTotal
                  ? "No enquiries match the current filters."
                  : "No enquiries have been received yet."}
              </p>
            </div>
          ) : null}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="bg-ad-sunken text-[10px] uppercase tracking-[.12em] text-ad-faint">
                <SortableHeader
                  id="name"
                  label="From"
                  sort={table.sort}
                  direction={table.direction}
                  onSort={table.toggleSort}
                  className="pl-5"
                />
                <th className="px-4 py-3 font-semibold">Subject</th>
                <SortableHeader
                  id="status"
                  label="Status"
                  sort={table.sort}
                  direction={table.direction}
                  onSort={table.toggleSort}
                />
                <SortableHeader
                  id="createdAt"
                  label="Received"
                  sort={table.sort}
                  direction={table.direction}
                  onSort={table.toggleSort}
                />
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ad-hairline">
              {table.rows.map((row) => (
                <tr key={row.id} className="text-xs hover:bg-ad-sunken">
                  <td className="py-4 pl-5 pr-4">
                    <button
                      type="button"
                      onClick={() => setActive(row)}
                      className="text-left"
                    >
                      <strong className="block text-[13px] font-semibold text-ad-ink">
                        {row.name}
                      </strong>
                      <span className="mt-0.5 block text-[11px] text-ad-faint">
                        {row.email}
                      </span>
                    </button>
                  </td>
                  <td className="max-w-xs px-4 py-4">
                    <span className="block truncate text-ad-muted">
                      {row.subject}
                    </span>
                    <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-ad-faint">
                      {row.kind}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={row.status}
                      disabled={busyId === row.id}
                      onChange={(event) =>
                        changeStatus(row, event.target.value)
                      }
                      aria-label={`Status for the enquiry from ${row.name}`}
                      className={`rounded-full px-3 text-[11px] font-semibold capitalize outline-none ${STATUS_TONE[row.status] ?? "bg-ad-sunken text-ad-faint"}`}
                    >
                      {ENQUIRY_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-ad-faint">
                    {row.createdAt.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-4 pl-4 pr-5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setActive(row)}
                        className="rounded-lg ring-1 ring-ad-line px-3 py-1.5 text-[11px] font-semibold text-ad-muted transition hover:text-ad-accent hover:ring-ad-accent/60"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(row)}
                        disabled={busyId === row.id}
                        aria-label={`Delete the enquiry from ${row.name}`}
                        className="rounded-lg p-2 text-ad-faint transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {table.rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <MessageSquareText
                      className="mx-auto mb-3 text-ad-faint"
                      size={28}
                      aria-hidden="true"
                    />
                    <p className="text-xs text-ad-faint">
                      {table.unfilteredTotal
                        ? "No enquiries match the current filters."
                        : "No enquiries have been received yet."}
                    </p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <TablePagination
          page={table.page}
          pageCount={table.pageCount}
          total={table.total}
          pageSize={table.pageSize}
          onPage={table.setPage}
        />
      </div>

      {active ? (
        <EnquiryDetail
          enquiry={active}
          busy={busyId === active.id}
          onClose={() => setActive(null)}
          onStatus={(status) => changeStatus(active, status)}
        />
      ) : null}
    </div>
  );
}

function EnquiryDetail({
  enquiry,
  busy,
  onClose,
  onStatus,
}: {
  enquiry: EnquiryRow;
  busy: boolean;
  onClose: () => void;
  onStatus: (status: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close enquiry"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Enquiry from ${enquiry.name}`}
        className="animate-slide-in relative flex h-full w-[min(30rem,100vw)] flex-col overflow-y-auto border-l border-ad-line bg-ad-raised shadow-ad-lg"
      >
        <header className="flex items-start justify-between gap-4 border-b border-ad-hairline px-6 py-5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-ad-faint">
              {enquiry.kind} enquiry
            </p>
            <h2 className="mt-1 truncate text-lg font-bold text-ad-ink">
              {enquiry.name}
            </h2>
            <time className="text-[11px] text-ad-faint">
              {enquiry.createdAt.toLocaleString("en-IN")}
            </time>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-ad-faint transition hover:bg-ad-sunken hover:text-ad-muted"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-5 px-6 py-5">
          <dl className="space-y-3 text-xs">
            <ContactRow icon={Mail} label="Email">
              <a
                href={`mailto:${enquiry.email}`}
                className="text-ad-accent hover:underline"
              >
                {enquiry.email}
              </a>
            </ContactRow>
            {enquiry.phone ? (
              <ContactRow icon={Phone} label="Phone">
                <a
                  href={`tel:${enquiry.phone}`}
                  className="text-ad-accent hover:underline"
                >
                  {enquiry.phone}
                </a>
              </ContactRow>
            ) : null}
            {enquiry.organisation ? (
              <ContactRow icon={Building2} label="Organisation">
                {enquiry.organisation}
              </ContactRow>
            ) : null}
          </dl>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-ad-faint">
              Subject
            </p>
            <p className="mt-1 text-sm font-semibold text-ad-ink">
              {enquiry.subject}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-ad-faint">
              Message
            </p>
            <p className="mt-2 whitespace-pre-wrap rounded-xl bg-ad-sunken p-4 text-sm leading-6 text-ad-muted">
              {enquiry.message}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-ad-faint">
              Status
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ENQUIRY_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={busy}
                  onClick={() => onStatus(status)}
                  aria-pressed={enquiry.status === status}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize transition disabled:opacity-40 ${
                    enquiry.status === status
                      ? (STATUS_TONE[status] ?? "bg-ad-sunken text-ad-faint")
                      : "ring-1 ring-ad-line text-ad-muted hover:bg-ad-sunken"
                  }`}
                >
                  {statusLabel(status)}
                </button>
              ))}
            </div>
          </div>

          <a
            href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Re: ${enquiry.subject}`)}`}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold bg-ad-accent text-white transition-colors hover:brightness-110"
          >
            <Mail size={16} aria-hidden="true" /> Reply by email
          </a>
        </div>
      </aside>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={15} className="shrink-0 text-ad-faint" aria-hidden="true" />
      <dt className="sr-only">{label}</dt>
      <dd className="min-w-0 truncate text-ad-muted">{children}</dd>
    </div>
  );
}
