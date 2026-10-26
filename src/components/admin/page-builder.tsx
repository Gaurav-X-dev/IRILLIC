"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CONTENT_ICON_NAMES } from "@/lib/content-icons";
import { fieldMeta, isImageField, orderFields } from "@/lib/field-meta";
import { SECTION_GROUP_ORDER, sectionMeta } from "@/lib/section-meta";

type Page = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  status: string;
  seo: Record<string, unknown>;
};
type Section = {
  id: string;
  pageId: string;
  sectionKey: string;
  label: string;
  data: unknown;
  sortOrder: number;
  isEnabled: boolean;
};

export function PageBuilder({
  pages,
  initialSections,
  readOnly = false,
}: {
  pages: Page[];
  initialSections: Section[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [pageId, setPageId] = useState(pages[0]?.id ?? "");
  const sections = useMemo(
    () =>
      initialSections
        .filter((section) => section.pageId === pageId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [initialSections, pageId],
  );
  const [sectionId, setSectionId] = useState("");
  const selected =
    sections.find((section) => section.id === sectionId) ?? sections[0];
  const [draft, setDraft] = useState<unknown>(selected?.data);
  const [label, setLabel] = useState(selected?.label ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [savedAt, setSavedAt] = useState(0);

  // Comparing against the stored value is enough to know whether the editor
  // holds unsaved work; the shapes here are small, plain JSON.
  const dirty =
    selected !== undefined &&
    (JSON.stringify(draft) !== JSON.stringify(selected?.data) ||
      label !== selected?.label);

  const groupedSections = useMemo(() => {
    const term = filter.trim().toLowerCase();
    const matches = sections.filter((section) => {
      if (!term) return true;
      const meta = sectionMeta(section.sectionKey);
      return `${meta.label} ${section.label} ${meta.description} ${section.sectionKey}`
        .toLowerCase()
        .includes(term);
    });
    return SECTION_GROUP_ORDER.map((group) => ({
      group,
      items: matches.filter(
        (section) => sectionMeta(section.sectionKey).group === group,
      ),
    })).filter((entry) => entry.items.length > 0);
  }, [sections, filter]);

  function choosePage(id: string) {
    setPageId(id);
    setSectionId("");
    setMessage("");
    setError("");
    const first = initialSections
      .filter((item) => item.pageId === id)
      .sort((a, b) => a.sortOrder - b.sortOrder)[0];
    setDraft(first?.data);
    setLabel(first?.label ?? "");
  }
  function chooseSection(section: Section) {
    setSectionId(section.id);
    setDraft(section.data);
    setLabel(section.label);
    setMessage("");
    setError("");
  }
  async function request(url: string, method: string, body?: unknown) {
    const response = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Request failed");
    return result;
  }
  async function save() {
    if (!selected || readOnly) return;
    setBusy(true);
    setError("");
    try {
      await request(`/api/admin/sections/${selected.id}`, "PATCH", {
        label,
        data: draft,
      });
      setMessage("Saved. The public page is updated.");
      setSavedAt(Date.now());
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save section",
      );
    } finally {
      setBusy(false);
    }
  }
  async function toggle() {
    if (!selected || readOnly) return;
    setBusy(true);
    setError("");
    try {
      await request(`/api/admin/sections/${selected.id}`, "PATCH", {
        isEnabled: !selected.isEnabled,
      });
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to change visibility",
      );
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (
      !selected ||
      readOnly ||
      !confirm(`Delete the “${selected.label}” section?`)
    )
      return;
    setBusy(true);
    setError("");
    try {
      await request(`/api/admin/sections/${selected.id}`, "DELETE");
      setSectionId("");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to delete section",
      );
    } finally {
      setBusy(false);
    }
  }
  async function move(direction: -1 | 1) {
    if (!selected || readOnly) return;
    const index = sections.findIndex((section) => section.id === selected.id);
    const other = sections[index + direction];
    if (!other) return;
    setBusy(true);
    try {
      await Promise.all([
        request(`/api/admin/sections/${selected.id}`, "PATCH", {
          sortOrder: other.sortOrder,
        }),
        request(`/api/admin/sections/${other.id}`, "PATCH", {
          sortOrder: selected.sortOrder,
        }),
      ]);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to reorder sections",
      );
    } finally {
      setBusy(false);
    }
  }
  async function addSection() {
    if (readOnly) return;
    const sectionKey = prompt(
      "Section key (lowercase, for example testimonials)",
    );
    if (!sectionKey) return;
    const sectionLabel =
      prompt("Section name", sectionKey.replace(/-/g, " ")) || sectionKey;
    setBusy(true);
    try {
      await request(`/api/admin/pages/${pageId}/sections`, "POST", {
        sectionKey,
        label: sectionLabel,
        data: { heading: sectionLabel, body: "" },
        isEnabled: true,
      });
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to add section",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!pages.length)
    return (
      <p className="rounded-2xl bg-ad-surface p-8 text-sm text-ad-muted ring-1 ring-ad-line">
        No website pages are available.
      </p>
    );
  const activePage = pages.find((page) => page.id === pageId) ?? pages[0];
  return (
    <div className="space-y-4">
      {pages.length > 1 ? (
        <div
          className="flex gap-1.5 overflow-x-auto rounded-2xl bg-ad-surface p-1.5 ring-1 ring-ad-line"
          role="tablist"
          aria-label="Website pages"
        >
          {pages.map((page) => (
            <button
              key={page.id}
              type="button"
              role="tab"
              aria-selected={page.id === pageId}
              onClick={() => choosePage(page.id)}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-left text-xs transition-colors ${
                page.id === pageId
                  ? "bg-ad-accent font-semibold text-white"
                  : "font-medium text-ad-muted hover:bg-ad-sunken"
              }`}
            >
              <span className="block">{page.title}</span>
              <span
                className={`mt-0.5 block font-mono text-[10px] ${page.id === pageId ? "text-white/70" : "text-ad-faint"}`}
              >
                /{page.slug}
              </span>
            </button>
          ))}
        </div>
      ) : null}
      <PageSettings
        key={activePage.id}
        page={activePage}
        readOnly={readOnly}
        onSaved={() => router.refresh()}
      />
      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-5">
        <div className="min-w-0 xl:sticky xl:top-[88px]">
          <aside className="ad-card overflow-hidden rounded-2xl bg-ad-surface shadow-ad-sm ring-1 ring-ad-line">
            <div className="flex items-start justify-between gap-3 border-b border-ad-hairline px-4 py-3.5">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-ad-faint">
                  Page sections
                </p>
                <p className="mt-0.5 text-xs text-ad-muted">
                  {sections.length} editable block
                  {sections.length === 1 ? "" : "s"}
                </p>
              </div>
              {readOnly ? (
                <span className="rounded-full bg-ad-accent-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ad-accent">
                  Read only
                </span>
              ) : (
                <button
                  type="button"
                  onClick={addSection}
                  disabled={busy}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ad-accent text-white transition-transform hover:scale-105 disabled:opacity-50"
                  aria-label="Add a section"
                  title="Add a section"
                >
                  <Plus size={15} />
                </button>
              )}
            </div>

            <div className="border-b border-ad-hairline p-3 xl:hidden">
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.14em] text-ad-faint">
                  Select a section to edit
                </span>
                <select
                  value={selected?.id ?? ""}
                  onChange={(event) => {
                    const section = sections.find(
                      (item) => item.id === event.target.value,
                    );
                    if (section) chooseSection(section);
                  }}
                  className="h-11 w-full rounded-xl bg-ad-sunken px-3 text-sm font-semibold text-ad-ink outline-none ring-1 ring-ad-line focus:ring-ad-accent"
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {sectionMeta(section.sectionKey).label}
                      {section.isEnabled ? "" : " (Hidden)"}
                    </option>
                  ))}
                </select>
              </label>
              {selected ? (
                <p className="mt-2 truncate text-[11px] text-ad-faint">
                  {sectionMeta(selected.sectionKey).description}
                </p>
              ) : null}
            </div>

            <div className="hidden border-b border-ad-hairline p-2.5 xl:block">
              <div className="relative">
                <Search
                  size={14}
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ad-faint"
                />
                <input
                  type="search"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  placeholder="Find a section…"
                  aria-label="Find a section"
                  className="h-9 w-full rounded-lg bg-ad-sunken pl-8 pr-3 text-xs outline-none ring-1 ring-ad-line placeholder:text-ad-faint focus:ring-ad-accent"
                />
              </div>
            </div>

            <div className="hidden max-h-[calc(100vh-19rem)] overflow-y-auto p-2 xl:block">
              {groupedSections.map(({ group, items }) => (
                <div key={group} className="mb-3 last:mb-0">
                  <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-ad-faint">
                    {group}
                  </p>
                  <div className="stagger space-y-0.5">
                    {items.map((section) => {
                      const meta = sectionMeta(section.sectionKey);
                      const active = selected?.id === section.id;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => chooseSection(section)}
                          aria-current={active ? "true" : undefined}
                          className={`flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
                            active
                              ? "bg-ad-accent-soft text-ad-accent"
                              : "text-ad-muted hover:bg-ad-sunken"
                          }`}
                        >
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${section.isEnabled ? "bg-emerald-500" : "bg-ad-faint"}`}
                            title={section.isEnabled ? "Visible" : "Hidden"}
                          />
                          <span className="min-w-0 flex-1">
                            <span
                              className={`block truncate text-xs ${active ? "font-semibold" : "font-medium"}`}
                            >
                              {meta.label}
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] text-ad-faint">
                              {meta.description}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {groupedSections.length === 0 ? (
                <p className="px-3 py-10 text-center text-xs text-ad-faint">
                  No section matches “{filter}”.
                </p>
              ) : null}
            </div>
          </aside>
        </div>
        {selected ? (
          <section
            key={selected.id}
            className="ad-card min-w-0 animate-slide-in overflow-hidden rounded-2xl bg-ad-surface shadow-ad-sm ring-1 ring-ad-line"
          >
            <header className="border-b border-ad-hairline px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-semibold text-ad-ink">
                      {sectionMeta(selected.sectionKey).label}
                    </h2>
                    {dirty ? (
                      <span className="animate-pop rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                        Unsaved
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 max-w-xl text-xs leading-5 text-ad-muted">
                    {sectionMeta(selected.sectionKey).description}
                  </p>
                </div>
                {readOnly ? (
                  <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-ad-accent-soft px-3 text-[11px] font-bold text-ad-accent">
                    <Eye size={14} /> View only
                  </span>
                ) : (
                  <div className="flex w-full flex-wrap items-center gap-1.5 sm:w-auto sm:shrink-0 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => move(-1)}
                      disabled={busy || sections[0]?.id === selected.id}
                      className="tap-target grid h-8 w-8 place-items-center rounded-lg text-ad-muted ring-1 ring-ad-line transition-colors hover:bg-ad-sunken disabled:opacity-30"
                      aria-label="Move this section up the page"
                    >
                      <ChevronUp size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(1)}
                      disabled={busy || sections.at(-1)?.id === selected.id}
                      className="tap-target grid h-8 w-8 place-items-center rounded-lg text-ad-muted ring-1 ring-ad-line transition-colors hover:bg-ad-sunken disabled:opacity-30"
                      aria-label="Move this section down the page"
                    >
                      <ChevronDown size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={toggle}
                      disabled={busy}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold text-ad-muted ring-1 ring-ad-line transition-colors hover:bg-ad-sunken"
                    >
                      {selected.isEnabled ? (
                        <Eye size={14} />
                      ) : (
                        <EyeOff size={14} />
                      )}
                      {selected.isEnabled ? "Visible" : "Hidden"}
                    </button>
                    <button
                      type="button"
                      onClick={remove}
                      disabled={busy}
                      className="tap-target grid h-8 w-8 place-items-center rounded-lg text-rose-500 ring-1 ring-ad-line transition-colors hover:bg-rose-500/10"
                      aria-label="Delete this section"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              <details className="group/adv mt-3 text-xs">
                <summary className="inline-flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold text-ad-faint ring-1 ring-ad-line transition-colors hover:text-ad-muted">
                  <ChevronDown
                    size={12}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-open/adv:rotate-180"
                  />
                  Advanced
                </summary>
                <div className="mt-2.5 grid gap-2.5 sm:grid-cols-[1fr_auto]">
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold text-ad-muted">
                      Name shown in this list
                    </span>
                    <input
                      value={label}
                      onChange={(event) => setLabel(event.target.value)}
                      disabled={readOnly}
                      className="h-9 w-full rounded-lg bg-ad-surface px-3 text-sm outline-none ring-1 ring-ad-line focus:ring-ad-accent"
                    />
                  </label>
                  <span className="self-end pb-2 font-mono text-[11px] text-ad-faint">
                    {selected.sectionKey}
                  </span>
                </div>
              </details>
            </header>

            <fieldset
              disabled={readOnly}
              className="min-w-0 p-3 disabled:opacity-80 sm:p-5"
            >
              <VisualEditor
                value={draft}
                onChange={setDraft}
                lockGlobalContact={["contact", "headquarters"].includes(
                  selected.sectionKey,
                )}
              />
            </fieldset>

            <footer className="sticky bottom-0 z-10 flex flex-col items-stretch gap-3 border-t border-ad-hairline bg-ad-surface/92 px-4 py-3.5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="min-w-0">
                {error ? (
                  <p className="text-xs font-medium text-rose-500" role="alert">
                    {error}
                  </p>
                ) : message ? (
                  <p
                    key={savedAt}
                    className="animate-rise text-xs font-medium text-emerald-600"
                    role="status"
                  >
                    {message}
                  </p>
                ) : (
                  <p className="text-xs text-ad-faint">
                    {dirty
                      ? "You have unsaved changes on this section."
                      : "Changes appear on the public page after saving."}
                  </p>
                )}
              </div>
              {readOnly ? (
                <span className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ad-sunken px-5 text-xs font-bold text-ad-muted ring-1 ring-ad-line">
                  <Eye size={15} aria-hidden="true" /> Content Reader access
                </span>
              ) : (
                <button
                  type="button"
                  onClick={save}
                  disabled={busy || !dirty}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold text-white transition-colors disabled:opacity-40 ${busy ? "is-busy bg-ad-accent" : "bg-ad-accent hover:brightness-110"}`}
                >
                  <Save size={15} aria-hidden="true" />
                  {busy ? "Saving…" : dirty ? "Save section" : "Saved"}
                </button>
              )}
            </footer>
          </section>
        ) : (
          <div className="rounded-2xl bg-ad-surface p-12 text-center text-sm text-ad-faint ring-1 ring-ad-line">
            Pick a section on the left, or add one to begin.
          </div>
        )}
      </div>
    </div>
  );
}

function PageSettings({
  page,
  readOnly,
  onSaved,
}: {
  page: Page;
  readOnly: boolean;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (readOnly) return;
    setBusy(true);
    setFeedback("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/content/${page.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        summary: form.get("summary"),
        seo: {
          title: form.get("seoTitle"),
          description: form.get("seoDescription"),
        },
      }),
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok)
      return setFeedback(result.error || "Unable to save page settings");
    setFeedback("Page settings saved.");
    onSaved();
  }
  return (
    <section className="overflow-hidden rounded-2xl bg-ad-surface ring-1 ring-ad-line">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-ad-sunken"
      >
        <span>
          <strong className="block text-sm font-semibold text-ad-ink">
            Page settings &amp; SEO
          </strong>
          <span className="mt-0.5 block text-[11px] text-ad-faint">
            Title, summary and how this page appears in search results
          </span>
        </span>
        <ChevronDown
          size={17}
          className={`shrink-0 text-ad-faint transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <form
          onSubmit={save}
          className="animate-rise grid gap-4 border-t border-ad-hairline p-5 sm:grid-cols-2"
        >
          <FieldLabel label="Page title">
            <input
              name="title"
              required
              disabled={readOnly}
              defaultValue={page.title}
              className="h-10 w-full rounded-lg bg-ad-surface px-3 text-sm outline-none ring-1 ring-ad-line focus:ring-ad-accent"
            />
          </FieldLabel>
          <FieldLabel label="SEO title">
            <input
              name="seoTitle"
              disabled={readOnly}
              defaultValue={String(page.seo?.title ?? "")}
              className="h-10 w-full rounded-lg ring-1 ring-ad-line px-3 text-sm"
            />
          </FieldLabel>
          <div className="sm:col-span-2">
            <FieldLabel label="Page summary">
              <textarea
                name="summary"
                disabled={readOnly}
                defaultValue={page.summary ?? ""}
                className="min-h-20 w-full rounded-lg ring-1 ring-ad-line p-3 text-sm"
              />
            </FieldLabel>
          </div>
          <div className="sm:col-span-2">
            <FieldLabel label="SEO description">
              <textarea
                name="seoDescription"
                disabled={readOnly}
                defaultValue={String(page.seo?.description ?? "")}
                className="min-h-20 w-full rounded-lg ring-1 ring-ad-line p-3 text-sm"
              />
            </FieldLabel>
          </div>
          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <span
              className={`text-xs ${feedback.includes("saved") ? "text-emerald-600" : "text-red-600"}`}
            >
              {feedback}
            </span>
            {readOnly ? (
              <span className="rounded-xl bg-ad-sunken px-4 py-2.5 text-xs font-bold text-ad-muted ring-1 ring-ad-line">
                Read-only access
              </span>
            ) : (
              <button
                disabled={busy}
                className={`w-full rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-colors disabled:opacity-50 sm:w-auto ${busy ? "is-busy bg-ad-accent" : "bg-ad-accent hover:brightness-110"}`}
              >
                {busy ? "Saving…" : "Save page settings"}
              </button>
            )}
          </div>
        </form>
      ) : null}
    </section>
  );
}

export function VisualEditor({
  value,
  onChange,
  label = "Content",
  depth = 0,
  lockGlobalContact = false,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
  label?: string;
  depth?: number;
  lockGlobalContact?: boolean;
}) {
  if (Array.isArray(value))
    return (
      <fieldset className="min-w-0 overflow-hidden rounded-xl bg-ad-sunken/60 p-2 sm:p-2.5">
        <legend className="px-1 pb-1 text-xs font-bold text-ad-muted">
          {fieldMeta(label).label}{" "}
          <span className="font-medium text-ad-faint">({value.length})</span>
        </legend>
        {value.map((item, index) => (
          <details
            key={index}
            open={value.length <= 2}
            className="group mb-1.5 overflow-hidden rounded-lg bg-ad-surface ring-1 ring-ad-line last:mb-0"
          >
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 px-2.5 py-2.5 sm:flex-nowrap sm:px-3">
              <ChevronDown
                size={14}
                aria-hidden="true"
                className="shrink-0 text-ad-faint transition-transform duration-200 group-open:rotate-180"
              />
              <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ad-ink">
                {itemTitle(item, index)}
              </span>
              <span className="flex w-full shrink-0 justify-end gap-1 border-t border-ad-hairline pt-2 sm:w-auto sm:border-0 sm:pt-0">
                <SmallButton
                  label="Up"
                  disabled={index === 0}
                  onClick={() => onChange(swap(value, index, index - 1))}
                />
                <SmallButton
                  label="Down"
                  disabled={index === value.length - 1}
                  onClick={() => onChange(swap(value, index, index + 1))}
                />
                <SmallButton
                  label="Delete"
                  danger
                  onClick={() =>
                    onChange(
                      value.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                />
              </span>
            </summary>
            <div className="min-w-0 border-t border-ad-hairline p-2.5 sm:p-3.5">
              <VisualEditor
                value={item}
                onChange={(next) =>
                  onChange(
                    value.map((entry, itemIndex) =>
                      itemIndex === index ? next : entry,
                    ),
                  )
                }
                label={`${label} ${index + 1}`}
                depth={depth + 1}
                lockGlobalContact={lockGlobalContact}
              />
            </div>
          </details>
        ))}
        <button
          type="button"
          onClick={() => onChange([...value, blankArrayItem(label, value[0])])}
          className="mt-1.5 inline-flex items-center gap-2 rounded-lg border border-dashed border-ad-line bg-ad-surface px-3 py-2 text-xs font-semibold text-ad-accent transition-colors hover:border-ad-accent hover:bg-ad-accent-soft"
        >
          <Plus size={14} aria-hidden="true" /> Add item
        </button>
      </fieldset>
    );
  if (value && typeof value === "object")
    return (
      <div
        className={`min-w-0 grid gap-4 ${depth === 0 ? "" : "rounded-xl border-l-2 border-ad-line pl-2 sm:pl-4"}`}
      >
        {orderFields(Object.keys(value as Record<string, unknown>)).map(
          (key) => (
            <VisualEditor
              key={key}
              value={(value as Record<string, unknown>)[key]}
              onChange={(next) =>
                onChange({ ...(value as Record<string, unknown>), [key]: next })
              }
              label={key}
              depth={depth + 1}
              lockGlobalContact={lockGlobalContact}
            />
          ),
        )}
      </div>
    );
  if (typeof value === "boolean")
    return (
      <label className="flex items-center gap-3 text-xs font-semibold capitalize text-ad-muted">
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 accent-cyan-600"
        />
        {pretty(label)}
      </label>
    );
  if (typeof value === "number")
    return (
      <FieldLabel label={label}>
        <input
          type="number"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-10 w-full rounded-lg ring-1 ring-ad-line px-3 text-sm outline-none focus:border-ad-accent"
        />
      </FieldLabel>
    );
  const text = value == null ? "" : String(value);
  if (
    lockGlobalContact &&
    ["email", "phone", "phonehref"].includes(label.toLowerCase())
  )
    return (
      <div className="rounded-xl bg-ad-accent-soft px-4 py-3 ring-1 ring-ad-accent/20">
        <p className="text-[11px] font-bold capitalize text-ad-ink">
          {pretty(label)}
        </p>
        <p className="mt-1 text-[11px] leading-5 text-ad-muted">
          This is a global contact value. Update it once in{" "}
          <Link
            href="/dashboard/settings"
            className="font-semibold text-ad-accent underline underline-offset-2"
          >
            General settings
          </Link>
          ; the homepage, contact page and footer will update together.
        </p>
      </div>
    );
  if (isImageField(label, value))
    return <ImageField label={label} value={text} onChange={onChange} />;
  // Icons are a closed set, so offer the registry rather than a free-text box
  // an editor could misspell.
  if (label.toLowerCase() === "icon")
    return (
      <FieldLabel label={label}>
        <select
          value={text}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full rounded-lg ring-1 ring-ad-line px-3 text-sm outline-none focus:border-ad-accent"
        >
          <option value="">Default for this entry</option>
          {CONTENT_ICON_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </FieldLabel>
    );
  const meta = fieldMeta(label);
  const multiline = meta.long === true || text.length > 90;
  return (
    <FieldLabel label={label}>
      {multiline ? (
        <textarea
          value={text}
          onChange={(event) => onChange(event.target.value)}
          rows={Math.min(8, Math.max(3, Math.ceil(text.length / 90)))}
          className="w-full rounded-lg ring-1 ring-ad-line p-3 text-sm leading-6 outline-none focus:border-ad-accent"
        />
      ) : (
        <input
          value={text}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full rounded-lg ring-1 ring-ad-line px-3 text-sm outline-none focus:border-ad-accent"
        />
      )}
    </FieldLabel>
  );
}

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const meta = fieldMeta(label);
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold text-ad-muted">
        {meta.label}
      </span>
      {children}
      {meta.hint ? (
        <span className="mt-1.5 block text-[11px] leading-5 text-ad-faint">
          {meta.hint}
        </span>
      ) : null}
    </label>
  );
}

/** An image path with a live thumbnail, so an editor sees what they picked. */
function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const meta = fieldMeta(label);
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold text-ad-muted">
        {meta.label}
      </span>
      <span className="flex items-start gap-3">
        <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-ad-sunken ring-1 ring-ad-line">
          {value ? (
            // Served from the CMS at its original path.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <ImageIcon size={16} className="text-ad-faint" aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/images/theme/hero-1-operating-room.svg"
            className="h-10 w-full rounded-lg bg-ad-surface px-3 text-sm outline-none ring-1 ring-ad-line focus:ring-ad-accent"
          />
          <span className="mt-1.5 block text-[11px] text-ad-faint">
            Paste a path, or copy one from the{" "}
            <Link href="/dashboard/media" className="text-ad-accent underline">
              media library
            </Link>
            .
          </span>
        </span>
      </span>
    </label>
  );
}
function SmallButton({
  label,
  onClick,
  disabled,
  danger,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-2 py-1 text-[10px] font-semibold ring-1 transition-colors disabled:opacity-30 ${danger ? "text-rose-500 ring-rose-500/30 hover:bg-rose-500/10" : "text-ad-muted ring-ad-line hover:bg-ad-sunken"}`}
    >
      {label}
    </button>
  );
}
/** Names a list item by its own content, so the list reads like the page. */
function itemTitle(item: unknown, index: number): string {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const record = item as Record<string, unknown>;
    for (const key of [
      "title",
      "label",
      "name",
      "heading",
      "tab",
      "question",
    ]) {
      const candidate = record[key];
      if (typeof candidate === "string" && candidate.trim())
        return candidate.trim();
    }
  }
  if (typeof item === "string" && item.trim()) return item.trim();
  return `Item ${index + 1}`;
}

function pretty(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ");
}
function swap<T>(items: T[], left: number, right: number) {
  const copy = [...items];
  [copy[left], copy[right]] = [copy[right], copy[left]];
  return copy;
}
function blankLike(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(blankLike);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        blankLike(item),
      ]),
    );
  if (typeof value === "boolean") return false;
  if (typeof value === "number") return 0;
  return "";
}

function blankArrayItem(label: string, example: unknown): unknown {
  const normalized = label.replace(/\s+\d+$/, "").toLowerCase();
  if (normalized === "mega menu" || normalized === "megamenu") {
    return {
      key: "new-tab",
      label: "New tab",
      heading: "New navigation section",
      intro: "Add a short introduction for this navigation section.",
      cta: { label: "Explore", href: "/" },
      columns: [
        { title: "Explore", links: [{ label: "Overview", href: "/" }] },
        { title: "Resources", links: [{ label: "Learn more", href: "/" }] },
      ],
      feature: {
        image: "/images/theme/panel-people.svg",
        href: "/",
        label: "Featured",
        title: "Featured content",
        cta: "Explore",
      },
      downloadsLabel: "Quick downloads",
      match: ["/"],
    };
  }
  if (
    [
      "links",
      "mega downloads",
      "megadownloads",
      "legal links",
      "legallinks",
    ].includes(normalized)
  )
    return { label: "New link", href: "/" };
  if (normalized === "columns")
    return { title: "New column", links: [{ label: "New link", href: "/" }] };
  return blankLike(example);
}
