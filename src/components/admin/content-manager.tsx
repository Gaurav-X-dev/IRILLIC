"use client";

import { useState } from "react";
import { FileText, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { VisualEditor } from "@/components/admin/page-builder";
import { ExportButtons } from "@/components/admin/export-buttons";
import {
  TableFilter,
  TablePagination,
  TableSearch,
  useTableControls,
} from "@/components/admin/table-controls";

type Row = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  status: string;
  content?: Record<string, unknown>;
  seo?: Record<string, unknown>;
  sortOrder?: number;
  isFeatured?: boolean;
  updatedAt: string | Date;
};
type ContentType = "page" | "product" | "application" | "resource";

/**
 * The starting shape for a new entry, so the visual editor shows the fields the
 * public page actually reads rather than an empty object.
 */
const NEW_CONTENT: Record<ContentType, Record<string, unknown>> = {
  page: { heading: "", description: "", image: "" },
  product: { heading: "", description: "", image: "", highlights: [] },
  application: {
    icon: "target",
    heading: "",
    description: "",
    image: "",
    benefits: [],
    steps: [],
    references: [],
  },
  resource: { heading: "", description: "", type: "ifu", file: "" },
};

export function ContentManager({
  type,
  initialRows,
  readOnly = false,
}: {
  type: ContentType;
  initialRows: Row[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [contentDraft, setContentDraft] = useState<unknown>(NEW_CONTENT[type]);
  const table = useTableControls<Row>({
    rows: initialRows,
    searchFields: (row) => [row.title, row.slug, row.summary],
    filters: { status: (row, value) => row.status === value },
    sorters: {
      updatedAt: (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      title: (a, b) => a.title.localeCompare(b.title),
      status: (a, b) => a.status.localeCompare(b.status),
    },
    initialSort: "updatedAt",
    pageSize: 12,
  });
  const rows = table.rows;
  const statuses = Array.from(
    new Set(initialRows.map((row) => row.status)),
  ).sort();
  function edit(row: Row | null) {
    if (readOnly) return;
    setSelected(row);
    setContentDraft(row?.content ?? NEW_CONTENT[type]);
    setError("");
    setOpen(true);
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (readOnly) return;
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const content = contentDraft as Record<string, unknown>;
    const payload = {
      type,
      title: form.get("title"),
      slug: form.get("slug"),
      summary: form.get("summary"),
      status: form.get("status"),
      content,
      seo: {
        title: String(form.get("seoTitle") || "").trim(),
        description: String(form.get("seoDescription") || "").trim(),
      },
      sortOrder: Number(form.get("sortOrder") || 0),
      isFeatured: form.get("isFeatured") === "on",
    };
    try {
      const response = await fetch(
        selected ? `/api/admin/content/${selected.id}` : "/api/admin/content",
        {
          method: selected ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok)
        return setError(result.error || "Unable to save content");
      setOpen(false);
      setSelected(null);
      router.refresh();
    } catch {
      setError("Unable to reach the content service.");
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
    if (readOnly) return;
    if (!confirm("Delete this content permanently?")) return;
    const response = await fetch(`/api/admin/content/${id}`, {
      method: "DELETE",
    });
    const result = await response.json();
    if (!response.ok) return alert(result.error || "Unable to delete content.");
    router.refresh();
  }
  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-ad-surface shadow-ad-sm ring-1 ring-ad-line">
        <div className="flex flex-col gap-4 border-b border-ad-hairline bg-ad-sunken p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <TableSearch
              value={table.search}
              onChange={table.setSearch}
              placeholder="Search title, slug or summary…"
            />
            {statuses.length > 1 ? (
              <TableFilter
                label="Status"
                value={table.filterValues.status ?? "all"}
                onChange={(value) => table.setFilter("status", value)}
                options={[
                  { value: "all", label: "All statuses" },
                  ...statuses.map((status) => ({
                    value: status,
                    label: status,
                  })),
                ]}
              />
            ) : null}
            <TableFilter
              label="Sort"
              value={`${table.sort}:${table.direction}`}
              onChange={(value) => {
                const [field, dir] = value.split(":");
                if (field !== table.sort) table.toggleSort(field);
                if (dir === "asc" && table.direction !== "asc")
                  table.toggleSort(field);
              }}
              options={[
                { value: "updatedAt:desc", label: "Recently updated" },
                { value: "updatedAt:asc", label: "Oldest first" },
                { value: "title:asc", label: "Title A–Z" },
                { value: "title:desc", label: "Title Z–A" },
                { value: "status:asc", label: "Status" },
              ]}
            />
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <ExportButtons dataset="content" type={type} />
            {readOnly ? (
              <span className="inline-flex h-11 items-center justify-center rounded-xl bg-ad-accent-soft px-4 text-xs font-bold text-ad-accent">
                Content Reader · View only
              </span>
            ) : (
              <button
                onClick={() => edit(null)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ad-accent px-5 text-xs font-bold text-white transition-colors hover:brightness-110"
              >
                <Plus size={15} /> Add new
              </button>
            )}
          </div>
        </div>
        <div className="stagger divide-y divide-ad-hairline">
          {rows.length ? (
            rows.map((row) => (
              <div
                key={row.id}
                className="group flex items-center gap-4 px-6 py-5 transition hover:bg-ad-sunken"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ad-accent-soft text-ad-accent">
                  <FileText size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-semibold text-ad-ink">
                    {row.title}
                  </strong>
                  <span className="mt-1 block truncate text-[11px] text-ad-faint">
                    {row.slug}
                  </span>
                </div>
                <span
                  className={`hidden rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize md:inline-flex ${row.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                >
                  {row.status}
                </span>
                <span className="hidden text-[11px] text-ad-faint sm:block">
                  {new Date(row.updatedAt).toLocaleDateString()}
                </span>
                {!readOnly ? (
                  <>
                    <button
                      onClick={() => edit(row)}
                      className="rounded-lg p-2 text-ad-faint hover:bg-ad-accent-soft hover:text-ad-accent"
                      aria-label={`Edit ${row.title}`}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => remove(row.id)}
                      className="rounded-lg p-2 text-ad-faint hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${row.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : null}
              </div>
            ))
          ) : (
            <div className="px-6 py-16 text-center">
              <FileText className="mx-auto text-ad-faint" size={32} />
              <p className="mt-3 text-sm font-semibold text-ad-muted">
                No content found
              </p>
              <p className="mt-1 text-xs text-ad-faint">
                {table.unfilteredTotal
                  ? "Try a different search term or status filter."
                  : "Use “Add new” to create the first record."}
              </p>
            </div>
          )}
        </div>
        <TablePagination
          page={table.page}
          pageCount={table.pageCount}
          total={table.total}
          pageSize={table.pageSize}
          onPage={table.setPage}
        />
      </div>
      {open ? (
        <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-slate-950/60 p-2.5 backdrop-blur-sm sm:p-4">
          <form
            onSubmit={save}
            className="animate-rise my-3 w-full max-w-2xl rounded-2xl bg-ad-raised p-4 shadow-ad-lg ring-1 ring-ad-line sm:my-6 sm:p-6"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-ad-accent">
                  {selected ? "Edit" : "New"} {type}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-ad-ink">
                  {selected ? "Update content" : "Create content"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 text-ad-faint"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <Field
                name="title"
                label="Title"
                required
                defaultValue={selected?.title}
              />
              <Field
                name="slug"
                label="Slug"
                required
                defaultValue={selected?.slug}
              />
              <Area
                name="summary"
                label="Summary"
                defaultValue={selected?.summary ?? ""}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  name="seoTitle"
                  label="SEO title"
                  defaultValue={String(selected?.seo?.title ?? "")}
                />
                <Field
                  name="sortOrder"
                  label="Sort order"
                  type="number"
                  defaultValue={String(selected?.sortOrder ?? 0)}
                />
              </div>
              <Area
                name="seoDescription"
                label="SEO description"
                defaultValue={String(selected?.seo?.description ?? "")}
              />
              <section className="min-w-0 rounded-xl bg-ad-sunken p-3 ring-1 ring-ad-line sm:p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-ad-ink">
                    Content fields
                  </h3>
                  <p className="mt-1 text-xs text-ad-muted">
                    Edit the visible fields below. No code or JSON is required.
                  </p>
                </div>
                <VisualEditor value={contentDraft} onChange={setContentDraft} />
              </section>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block text-xs font-semibold text-ad-muted">
                    Status
                  </span>
                  <select
                    name="status"
                    defaultValue={selected?.status ?? "draft"}
                    className="h-11 w-full rounded-lg ring-1 ring-ad-line px-3 text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 pt-7 text-xs font-semibold text-ad-muted">
                  <input
                    name="isFeatured"
                    type="checkbox"
                    defaultChecked={selected?.isFeatured}
                    className="accent-sky-500"
                  />{" "}
                  Featured content
                </label>
              </div>
              {error ? (
                <p role="alert" className="text-xs text-red-600">
                  {error}
                </p>
              ) : null}
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-10 rounded-lg ring-1 ring-ad-line px-4 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={busy}
                className="h-10 rounded-lg bg-ad-accent px-5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save content"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

function Field({
  name,
  label,
  required,
  defaultValue,
  type = "text",
}: {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-ad-muted">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="h-11 w-full rounded-lg ring-1 ring-ad-line px-3 text-sm outline-none focus:ring-ad-accent"
      />
    </label>
  );
}
function Area({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-ad-muted">
        {label}
      </span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        className="min-h-20 w-full rounded-lg ring-1 ring-ad-line p-3 text-sm outline-none focus:ring-ad-accent"
      />
    </label>
  );
}
