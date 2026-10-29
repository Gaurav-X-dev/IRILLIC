"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import type { MegaSection, NavLink } from "@/types/site.types";


export function NavigationManager({
  sectionId,
  initialMenus,
}: {
  sectionId: string;
  initialMenus: MegaSection[];
}) {
  const [menus, setMenus] = useState(initialMenus),
    [selected, setSelected] = useState(0),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const menu = menus[selected];
  const update = (patch: Partial<MegaSection>) =>
    setMenus((all) =>
      all.map((item, i) => (i === selected ? { ...item, ...patch } : item)),
    );
  const column = (i: 0 | 1, patch: Partial<MegaSection["columns"][number]>) => {
    const columns = [...menu.columns] as MegaSection["columns"];
    columns[i] = { ...columns[i], ...patch };
    update({ columns });
  };
  const link = (c: 0 | 1, i: number, patch: Partial<NavLink>) =>
    column(c, {
      links: menu.columns[c].links.map((item, x) =>
        x === i ? { ...item, ...patch } : item,
      ),
    });
  function move(direction: -1 | 1) {
    const target = selected + direction;
    if (target < 0 || target >= menus.length) return;
    const copy = [...menus];
    [copy[selected], copy[target]] = [copy[target], copy[selected]];
    setMenus(copy);
    setSelected(target);
  }
  async function save() {
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: menus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Save failed");
      setNotice("Navigation saved. Frontend navbar is updated.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="overflow-hidden rounded-2xl bg-ad-surface shadow-ad-sm ring-1 ring-ad-line">
      <header className="flex flex-col gap-4 border-b border-ad-hairline bg-ad-sunken px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-300">
            Live website header
          </p>
          <h2 className="mt-1 text-[15px] font-semibold text-ad-ink">
            Navbar &amp; mega-menu builder
          </h2>
          <p className="mt-1 text-xs text-ad-faint">
            Same order and content as the frontend.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-semibold text-ad-muted ring-1 ring-ad-line transition-colors hover:text-ad-accent hover:ring-ad-accent/60"
          >
            Preview <ExternalLink size={13} aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className={`inline-flex h-10 items-center gap-2 rounded-xl px-5 text-xs font-bold text-white transition-colors disabled:opacity-50 ${busy ? "is-busy bg-ad-accent" : "bg-ad-accent hover:brightness-110"}`}
          >
            <Save size={14} aria-hidden="true" />
            {busy ? "Saving…" : "Save navigation"}
          </button>
        </div>
      </header>
      <div className="grid min-h-0 lg:min-h-[650px] lg:grid-cols-[270px_1fr]">
        <aside className="border-b border-ad-line bg-ad-sunken p-4 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ad-accent">
                Navbar tabs
              </p>
              <p className="text-[10px] text-ad-faint">{menus.length} tabs</p>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
            {menus.map((item, i) => (
              <button
                key={`${item.key}-${i}`}
                onClick={() => setSelected(i)}
                className={`w-44 shrink-0 rounded-xl border p-3 text-left lg:w-full ${i === selected ? "border-ad-accent bg-ad-surface shadow-ad-sm" : "border-transparent hover:bg-ad-surface"}`}
              >
                <b className="block text-xs text-slate-800">
                  {item.label || "Untitled"}
                </b>
                <small className="text-[9px] text-ad-faint">{item.key}</small>
              </button>
            ))}
          </div>
          <p className="mt-5 rounded-xl bg-blue-50 p-3 text-[10px] leading-5 text-blue-800">
            First create its destination under <b>Website pages</b>, then use
            that page URL here.
          </p>
        </aside>
        <main className="p-4 sm:p-6">
          {menu ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                    Editing tab {selected + 1}
                  </p>
                  <h3 className="text-xl font-semibold">{menu.label}</h3>
                </div>
                <div className="flex gap-2">
                  <Btn disabled={selected === 0} onClick={() => move(-1)}>
                    <ArrowUp size={15} />
                  </Btn>
                  <Btn
                    disabled={selected === menus.length - 1}
                    onClick={() => move(1)}
                  >
                    <ArrowDown size={15} />
                  </Btn>
                </div>
              </div>
              <Box
                title="Navbar tab"
                help="Name and destination shown in the top header."
              >
                <Grid>
                  <Field
                    label="Tab label"
                    value={menu.label}
                    set={(label) => update({ label })}
                  />
                  <Field
                    label="Unique key"
                    value={menu.key}
                    set={(key) => update({ key: slug(key) })}
                  />
                  <Field
                    label="Active page route"
                    value={menu.match[0] ?? ""}
                    set={(v) => update({ match: v ? [v] : [] })}
                    placeholder="/technologies"
                  />
                  <Field
                    label="Download strip label"
                    value={menu.downloadsLabel}
                    set={(downloadsLabel) => update({ downloadsLabel })}
                  />
                </Grid>
              </Box>
              <Box
                title="Dropdown introduction"
                help="Large left block visible when the tab opens."
              >
                <Field
                  label="Heading"
                  value={menu.heading}
                  set={(heading) => update({ heading })}
                />
                <Area
                  label="Description"
                  value={menu.intro}
                  set={(intro) => update({ intro })}
                />
                <Grid>
                  <Field
                    label="Button label"
                    value={menu.cta.label}
                    set={(label) => update({ cta: { ...menu.cta, label } })}
                  />
                  <Field
                    label="Button URL"
                    value={menu.cta.href}
                    set={(href) => update({ cta: { ...menu.cta, href } })}
                  />
                </Grid>
              </Box>
              <div className="grid gap-5 xl:grid-cols-2">
                {menu.columns.map((col, c) => (
                  <Box
                    key={c}
                    title={`Dropdown column ${c + 1}`}
                    help="Links shown in this column."
                  >
                    <Field
                      label="Column heading"
                      value={col.title}
                      set={(title) => column(c as 0 | 1, { title })}
                    />
                    {col.links.map((ln, i) => (
                      <div
                        key={i}
                        className="grid gap-2 rounded-xl bg-ad-sunken p-3 sm:grid-cols-[1fr_1fr_auto]"
                      >
                        <Field
                          label="Label"
                          value={ln.label}
                          set={(label) => link(c as 0 | 1, i, { label })}
                        />
                        <Field
                          label="URL"
                          value={ln.href}
                          set={(href) => link(c as 0 | 1, i, { href })}
                        />
                        <button
                          onClick={() =>
                            column(c as 0 | 1, {
                              links: col.links.filter((_, x) => x !== i),
                            })
                          }
                          className="mt-5 h-10 rounded-lg border border-red-200 px-3 text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        column(c as 0 | 1, {
                          links: [
                            ...col.links,
                            { label: "New link", href: "/" },
                          ],
                        })
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-dashed border-cyan-300 px-3 py-2 text-xs font-semibold text-ad-accent"
                    >
                      <Plus size={14} />
                      Add link
                    </button>
                  </Box>
                ))}
              </div>
              <Box
                title="Featured card"
                help="Image card on the right side of the mega menu."
              >
                <Grid>
                  <Field
                    label="Small label"
                    value={menu.feature.label}
                    set={(label) =>
                      update({ feature: { ...menu.feature, label } })
                    }
                  />
                  <Field
                    label="Title"
                    value={menu.feature.title}
                    set={(title) =>
                      update({ feature: { ...menu.feature, title } })
                    }
                  />
                  <Field
                    label="Image path"
                    value={menu.feature.image}
                    set={(image) =>
                      update({ feature: { ...menu.feature, image } })
                    }
                  />
                  <Field
                    label="Destination URL"
                    value={menu.feature.href}
                    set={(href) =>
                      update({ feature: { ...menu.feature, href } })
                    }
                  />
                  <Field
                    label="Link text"
                    value={menu.feature.cta}
                    set={(cta) => update({ feature: { ...menu.feature, cta } })}
                  />
                </Grid>
              </Box>
              <div className="flex items-center justify-between border-t pt-5">
                <p className="text-xs text-ad-muted">
                  {notice || "Fill valid URLs, then save."}
                </p>
                <button
                  onClick={save}
                  disabled={busy}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-ad-accent px-5 text-xs font-bold text-white transition-colors hover:brightness-110 disabled:opacity-50"
                >
                  <Save size={14} aria-hidden="true" />
                  Save navigation
                </button>
              </div>
            </div>
          ) : (
            <p className="py-20 text-center text-sm text-ad-faint">
              Add your first navbar tab.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
function Box({
  title,
  help,
  children,
}: {
  title: string;
  help: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl ring-1 ring-ad-line p-5">
      <div>
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="text-[10px] text-ad-faint">{help}</p>
      </div>
      {children}
    </section>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
function Field({
  label,
  value,
  set,
  placeholder,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-[11px] font-semibold text-ad-muted">
        {label}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => set(e.target.value)}
        className="h-10 w-full rounded-lg ring-1 ring-ad-line px-3 text-xs outline-none focus:border-ad-accent"
      />
    </label>
  );
}
function Area({
  label,
  value,
  set,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-[11px] font-semibold text-ad-muted">
        {label}
      </span>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => set(e.target.value)}
        className="w-full rounded-lg ring-1 ring-ad-line p-3 text-xs outline-none focus:border-ad-accent"
      />
    </label>
  );
}
function Btn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="grid h-9 w-9 place-items-center rounded-lg text-ad-muted ring-1 ring-ad-line transition-colors hover:bg-ad-sunken disabled:opacity-30"
    >
      {children}
    </button>
  );
}
function slug(v: string) {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
