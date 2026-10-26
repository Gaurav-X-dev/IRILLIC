"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { ROLE_DETAILS } from "@/lib/rbac";
import {
  TableFilter,
  TablePagination,
  useTableControls,
} from "@/components/admin/table-controls";
import { ExportButtons } from "@/components/admin/export-buttons";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar: string | null;
  mustChangePassword: boolean;
  createdAt: Date | string;
}

export function UserRoleManager({
  users,
  currentUserId,
}: {
  users: ManagedUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [editor, setEditor] = useState<ManagedUser | "new" | null>(null);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const table = useTableControls<ManagedUser>({
    rows: users,
    searchFields: (user) => [user.name, user.email, user.role],
    filters: {
      role: (user, value) => user.role === value,
      status: (user, value) =>
        value === "active" ? user.isActive : !user.isActive,
    },
    sorters: {
      name: (a, b) => a.name.localeCompare(b.name),
      createdAt: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    initialSort: "createdAt",
    pageSize: 8,
  });
  const readerCount = users.filter(
    (user) => user.role === "content_reader",
  ).length;
  const activeReaders = users.filter(
    (user) => user.role === "content_reader" && user.isActive,
  ).length;

  async function request(
    url: string,
    init: RequestInit,
    successMessage: string,
  ) {
    setBusyId(url);
    setError("");
    setMessage("");
    try {
      const response = await fetch(url, {
        ...init,
        headers: { "content-type": "application/json", ...init.headers },
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "The change could not be saved");
      setMessage(successMessage);
      router.refresh();
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Request failed");
      return false;
    } finally {
      setBusyId("");
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    const form = new FormData(event.currentTarget);
    const creating = editor === "new";
    const payload = creating
      ? {
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("temporaryPassword"),
        }
      : {
          name: form.get("name"),
          email: form.get("email"),
          ...(form.get("temporaryPassword")
            ? { temporaryPassword: form.get("temporaryPassword") }
            : {}),
        };
    const saved = await request(
      creating ? "/api/v1/users" : `/api/v1/users/${editor.id}`,
      { method: creating ? "POST" : "PATCH", body: JSON.stringify(payload) },
      creating ? "Content Reader created." : "Content Reader updated.",
    );
    if (saved) setEditor(null);
  }

  async function toggle(user: ManagedUser) {
    await request(
      `/api/v1/users/${user.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ isActive: !user.isActive }),
      },
      user.isActive ? "Content Reader disabled." : "Content Reader enabled.",
    );
  }

  async function remove(user: ManagedUser) {
    if (!confirm(`Delete the Content Reader account for ${user.name}?`)) return;
    await request(
      `/api/v1/users/${user.id}`,
      { method: "DELETE" },
      "Content Reader deleted.",
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-3">
        <RoleCard
          icon={ShieldCheck}
          tone="blue"
          title={ROLE_DETAILS.admin.label}
          description={ROLE_DETAILS.admin.description}
          value={users.filter((user) => user.role === "admin").length}
          footer="Protected owner account"
        />
        <RoleCard
          icon={UserRound}
          tone="violet"
          title={ROLE_DETAILS.content_reader.label}
          description={ROLE_DETAILS.content_reader.description}
          value={readerCount}
          footer={`${activeReaders} active`}
        />
        <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#087fb5] to-[#5140d8] p-5 text-white shadow-ad-md">
          <span className="absolute -right-8 -top-10 h-32 w-32 rounded-full border-[22px] border-white/5" />
          <UsersRound size={22} className="text-cyan-200" />
          <h2 className="mt-4 text-base font-bold">Invite a reader</h2>
          <p className="mt-1 max-w-xs text-xs leading-5 text-blue-100">
            Create a read-only login without exposing publishing or settings.
          </p>
          <button
            type="button"
            onClick={() => {
              setError("");
              setEditor("new");
            }}
            className="relative mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-blue-700 transition hover:-translate-y-0.5"
          >
            <Plus size={14} /> Add Content Reader
          </button>
        </article>
      </section>

      {error || message ? (
        <div
          role={error ? "alert" : "status"}
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold ${error ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-600"}`}
        >
          {error ? <X size={15} /> : <CheckCircle2 size={15} />}
          {error || message}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl bg-ad-surface shadow-ad-sm ring-1 ring-ad-line">
        <header className="flex flex-col gap-3 border-b border-ad-hairline p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-ad-faint">
              Access directory
            </p>
            <h2 className="mt-1 text-sm font-semibold text-ad-ink">
              Users and assigned roles
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <label className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
              <Search
                size={14}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ad-faint"
              />
              <input
                type="search"
                value={table.search}
                onChange={(event) => table.setSearch(event.target.value)}
                placeholder="Search users…"
                aria-label="Search users"
                className="h-10 w-full rounded-xl bg-ad-sunken pl-9 pr-3 text-sm outline-none ring-1 ring-ad-line focus:ring-ad-accent"
              />
            </label>
            <TableFilter
              label="Role"
              value={table.filterValues.role ?? "all"}
              onChange={(value) => table.setFilter("role", value)}
              options={[
                { value: "all", label: "All roles" },
                { value: "admin", label: "Administrator" },
                { value: "content_reader", label: "Content Reader" },
              ]}
            />
            <TableFilter
              label="Status"
              value={table.filterValues.status ?? "all"}
              onChange={(value) => table.setFilter("status", value)}
              options={[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "disabled", label: "Disabled" },
              ]}
            />
            <ExportButtons dataset="users" />
          </div>
        </header>

        <div className="divide-y divide-ad-hairline">
          {table.rows.map((user) => {
            const reader = user.role === "content_reader";
            return (
              <article
                key={user.id}
                className="flex flex-col gap-4 p-4 transition-colors hover:bg-ad-sunken sm:flex-row sm:items-center sm:px-5"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ad-accent-soft text-sm font-bold text-ad-accent">
                  {user.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="truncate text-sm font-semibold text-ad-ink">
                      {user.name}
                    </strong>
                    {user.id === currentUserId ? (
                      <span className="rounded-full bg-ad-accent-soft px-2 py-0.5 text-[9px] font-bold uppercase text-ad-accent">
                        You
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-ad-faint">
                    {user.email}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${reader ? "bg-violet-500/10 text-violet-500" : "bg-blue-500/10 text-blue-500"}`}
                  >
                    {reader ? "Content Reader" : "Administrator"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${user.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-500"}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {user.isActive ? "Active" : "Disabled"}
                  </span>
                  {reader ? (
                    <>
                      <button
                        type="button"
                        onClick={() => toggle(user)}
                        disabled={busyId.includes(user.id)}
                        className="h-8 rounded-lg px-3 text-[10px] font-bold text-ad-muted ring-1 ring-ad-line hover:text-ad-accent disabled:opacity-40"
                      >
                        {user.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setEditor(user);
                        }}
                        className="grid h-8 w-8 place-items-center rounded-lg text-ad-muted ring-1 ring-ad-line hover:text-ad-accent"
                        aria-label={`Edit ${user.name}`}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(user)}
                        disabled={busyId.includes(user.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-rose-500 ring-1 ring-rose-500/20 hover:bg-rose-500/10 disabled:opacity-40"
                        aria-label={`Delete ${user.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-ad-faint">
                      <LockKeyhole size={12} /> Protected
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        <TablePagination
          page={table.page}
          pageCount={table.pageCount}
          total={table.total}
          pageSize={table.pageSize}
          onPage={table.setPage}
        />
      </section>

      {editor ? (
        <UserEditor
          key={editor === "new" ? "new" : editor.id}
          user={editor === "new" ? null : editor}
          busy={Boolean(busyId)}
          error={error}
          onClose={() => setEditor(null)}
          onSubmit={save}
        />
      ) : null}
    </div>
  );
}

function RoleCard({
  icon: Icon,
  tone,
  title,
  description,
  value,
  footer,
}: {
  icon: typeof ShieldCheck;
  tone: "blue" | "violet";
  title: string;
  description: string;
  value: number;
  footer: string;
}) {
  const classes =
    tone === "blue"
      ? "from-blue-500 to-cyan-400 bg-blue-500/10 text-blue-500"
      : "from-violet-500 to-fuchsia-400 bg-violet-500/10 text-violet-500";
  const [edge, , iconBg, iconText] = classes.split(" ");
  return (
    <article className="relative overflow-hidden rounded-2xl bg-ad-surface p-5 shadow-ad-sm ring-1 ring-ad-line">
      <span
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${edge} ${classes.split(" ")[1]}`}
      />
      <div className="flex items-start justify-between gap-4">
        <span
          className={`grid h-10 w-10 place-items-center rounded-xl ${iconBg} ${iconText}`}
        >
          <Icon size={18} />
        </span>
        <strong className="tabular text-3xl font-bold text-ad-ink">
          {value}
        </strong>
      </div>
      <h2 className="mt-4 text-sm font-semibold text-ad-ink">{title}</h2>
      <p className="mt-1 min-h-10 text-xs leading-5 text-ad-muted">
        {description}
      </p>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-ad-faint">
        {footer}
      </p>
    </article>
  );
}

function UserEditor({
  user,
  busy,
  error,
  onClose,
  onSubmit,
}: {
  user: ManagedUser | null;
  busy: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="animate-rise w-full max-w-lg rounded-2xl bg-ad-raised p-5 shadow-ad-lg ring-1 ring-ad-line sm:p-6"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-violet-500">
              Content Reader
            </p>
            <h2 className="mt-1 text-xl font-bold text-ad-ink">
              {user ? "Edit reader account" : "Create reader account"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-ad-faint hover:bg-ad-sunken"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>
        <div className="mt-5 space-y-4">
          <FormField label="Full name">
            <input
              name="name"
              required
              defaultValue={user?.name}
              className="h-11 w-full rounded-xl bg-ad-surface px-3.5 text-sm outline-none ring-1 ring-ad-line focus:ring-ad-accent"
            />
          </FormField>
          <FormField label="Email address">
            <input
              name="email"
              type="email"
              required
              defaultValue={user?.email}
              className="h-11 w-full rounded-xl bg-ad-surface px-3.5 text-sm outline-none ring-1 ring-ad-line focus:ring-ad-accent"
            />
          </FormField>
          <FormField
            label={
              user ? "New temporary password (optional)" : "Temporary password"
            }
          >
            <div className="relative">
              <KeyRound
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ad-faint"
              />
              <input
                name="temporaryPassword"
                type="password"
                required={!user}
                minLength={12}
                autoComplete="new-password"
                className="h-11 w-full rounded-xl bg-ad-surface pl-9 pr-3.5 text-sm outline-none ring-1 ring-ad-line focus:ring-ad-accent"
              />
            </div>
          </FormField>
          <p className="rounded-xl bg-ad-sunken px-3 py-2.5 text-[10px] leading-5 text-ad-faint">
            Minimum 12 characters with uppercase, lowercase, number and symbol.
            The reader must replace a temporary password after signing in.
          </p>
          {error ? <p className="text-xs text-rose-500">{error}</p> : null}
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl px-4 text-xs font-semibold text-ad-muted ring-1 ring-ad-line"
          >
            Cancel
          </button>
          <button
            disabled={busy}
            className="h-10 rounded-xl bg-ad-accent px-5 text-xs font-bold text-white disabled:opacity-50"
          >
            {busy ? "Saving…" : user ? "Save reader" : "Create reader"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ad-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
