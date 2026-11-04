/* Uploaded assets use their original CMS URL and intentionally bypass Next image optimization. */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  FileImage,
  FileText,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  TableFilter,
  TablePagination,
  TableSearch,
  useTableControls,
} from "@/components/admin/table-controls";
import { useToast } from "@/components/admin/toast";
import { useConfirm } from "@/components/admin/confirm";
import { checkForm } from "@/components/admin/form-validation";
import { Req, RequiredNote } from "@/components/admin/ui";
import {
  ACCEPTED_UPLOAD_LABEL,
  ACCEPTED_UPLOAD_TYPES,
  DEFAULT_MAX_UPLOAD_MB,
  MAX_UPLOAD_MB,
  uploadLimitMb,
} from "@/lib/upload-limits";

function assetKind(mimeType: string) {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf") return "document";
  return "other";
}

type Asset = {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  folder: string;
  updatedAt: Date | string;
};
export function MediaManager({
  assets,
  readOnly = false,
}: {
  assets: Asset[];
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [busyId, setBusyId] = useState("");
  const [newFolder, setNewFolder] = useState(false);
  const confirm = useConfirm();
  const toast = useToast();
  useEffect(() => {
    if (error) toast("error", error);
  }, [error, toast]);
  const router = useRouter();
  const folders = Array.from(
    new Set(assets.map((asset) => asset.folder).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));
  // The folder was a free text box, so "Video", "video" and "videos" each
  // made a folder of their own and the library quietly fragmented. The
  // folders that already exist are offered instead, with one way to add.
  const [folder, setFolder] = useState(folders[0] ?? "general");
  const table = useTableControls<Asset>({
    rows: assets,
    searchFields: (asset) => [asset.name, asset.folder, asset.mimeType],
    filters: {
      folder: (asset, value) => asset.folder === value,
      kind: (asset, value) => assetKind(asset.mimeType) === value,
    },
    sorters: {
      updatedAt: (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      name: (a, b) => a.name.localeCompare(b.name),
    },
    initialSort: "updatedAt",
    pageSize: 12,
  });

  /**
   * What the tile shows for the file.
   *
   * A video used to fall through to the generic file icon, so the library
   * could not say which clip it was holding. It plays here instead: the first
   * frame stands in for a thumbnail, and an editor can check the footage is
   * the right one without leaving the panel. Metadata only is preloaded, so a
   * page of videos does not download itself.
   */
  function AssetPreview({ asset }: { asset: Asset }) {
    const kind = assetKind(asset.mimeType);
    if (kind === "image")
      return (
        <a
          href={asset.url}
          target="_blank"
          rel="noopener"
          aria-label={`Open ${asset.name} in a new tab`}
          className="block h-full w-full"
        >
          <img
            src={asset.url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-200 hover:scale-[1.03]"
          />
        </a>
      );
    if (kind === "video")
      return (
        <video
          src={asset.url}
          controls
          playsInline
          preload="metadata"
          aria-label={asset.name}
          className="h-full w-full bg-black object-contain"
        />
      );
    if (kind === "document")
      return (
        <a
          href={asset.url}
          target="_blank"
          rel="noopener"
          className="grid h-full w-full place-items-center gap-2 text-ad-faint transition-colors hover:bg-ad-accent-soft hover:text-ad-accent"
        >
          <FileText size={32} aria-hidden="true" />
          <span className="text-[10px] font-bold uppercase tracking-[.14em]">
            Open PDF
          </span>
        </a>
      );
    return (
      <a
        href={asset.url}
        target="_blank"
        rel="noopener"
        className="grid h-full w-full place-items-center gap-2 text-ad-faint transition-colors hover:bg-ad-accent-soft hover:text-ad-accent"
      >
        <FileImage size={32} aria-hidden="true" />
        <span className="text-[10px] font-bold uppercase tracking-[.14em]">
          Open file
        </span>
      </a>
    );
  }

  async function remove(asset: Asset) {
    if (readOnly) return;
    const ok = await confirm({
      title: `Delete ${asset.name}?`,
      message:
        "The file is removed from the library and from the server. It can be uploaded again, but any page still pointing at it would show a broken image — so the panel checks for that first.",
      confirmLabel: "Delete file",
      tone: "danger",
    });
    if (!ok) return;
    setBusyId(asset.id);
    const response = await fetch(`/api/admin/media/${asset.id}`, {
      method: "DELETE",
    });
    const result = await response.json();
    setBusyId("");
    if (!response.ok)
      return toast("error", result.error || "The file could not be deleted.");
    toast("success", result.message || "File deleted.");
    router.refresh();
  }

  async function copyUrl(asset: Asset) {
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopied(asset.id);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setError("The browser blocked clipboard access.");
    }
  }
  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (readOnly) return;
    const problem = checkForm(event.currentTarget);
    if (problem) return setError(problem);
    // Catch an over-sized file before spending minutes uploading it only for
    // the server to refuse it at the far end.
    const picked = Array.from(
      event.currentTarget.querySelector<HTMLInputElement>('input[name="file"]')
        ?.files ?? [],
    );
    // The picker's "All files" option means anything can be chosen, so the
    // type is checked here too rather than only after the upload.
    const wrongType = picked.find(
      (file) => !ACCEPTED_UPLOAD_TYPES.includes(file.type),
    );
    if (wrongType)
      return setError(
        `${wrongType.name} cannot be uploaded. Choose a ${ACCEPTED_UPLOAD_LABEL} file.`,
      );
    const tooLarge = picked.find(
      (file) => file.size > uploadLimitMb(file.type) * 1024 * 1024,
    );
    if (tooLarge)
      return setError(
        `${tooLarge.name} is ${(tooLarge.size / (1024 * 1024)).toFixed(1)} MB. ` +
          `${tooLarge.type.startsWith("video/") ? "Videos" : "Files"} must be ${uploadLimitMb(tooLarge.type)} MB or smaller.`,
      );
    setBusy(true);
    setError("");
    const response = await fetch("/api/admin/media", {
      method: "POST",
      body: new FormData(event.currentTarget),
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) return setError(result.error || "Upload failed");
    // Part of a batch can fail on its own; say which, and keep the rest.
    const rejected: { name: string; error: string }[] = result.failed ?? [];
    if (rejected.length)
      setError(
        `${rejected.length} file${rejected.length > 1 ? "s were" : " was"} not uploaded: ` +
          rejected.map((f) => `${f.name} (${f.error})`).join(", "),
      );
    else setOpen(false);
    setChosen(0);
    router.refresh();
  }
  return (
    <>
      <div className="overflow-hidden rounded-[18px] bg-ad-surface shadow-ad-sm ring-1 ring-ad-line">
        <div className="flex flex-col gap-3 border-b border-ad-hairline p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <TableSearch
              value={table.search}
              onChange={table.setSearch}
              placeholder="Search media by name or type…"
            />
            {folders.length > 1 ? (
              <TableFilter
                label="Folder"
                value={table.filterValues.folder ?? "all"}
                onChange={(value) => table.setFilter("folder", value)}
                options={[
                  { value: "all", label: "All folders" },
                  ...folders.map((folder) => ({
                    value: folder,
                    label: folder,
                  })),
                ]}
              />
            ) : null}
            <TableFilter
              label="Type"
              value={table.filterValues.kind ?? "all"}
              onChange={(value) => table.setFilter("kind", value)}
              options={[
                { value: "all", label: "All types" },
                { value: "image", label: "Images" },
                { value: "video", label: "Video" },
                { value: "document", label: "Documents" },
              ]}
            />
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            {readOnly ? (
              <span className="inline-flex h-10 items-center rounded-lg bg-ad-accent-soft px-4 text-xs font-bold text-ad-accent">
                Content Reader · View only
              </span>
            ) : (
              <button
                onClick={() => setOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-ad-accent px-4 text-xs font-semibold text-white transition-colors hover:brightness-110"
              >
                <Upload size={15} />
                Upload media
              </button>
            )}
          </div>
        </div>
        {table.rows.length ? (
          <div className="stagger grid gap-px bg-ad-hairline sm:grid-cols-2 xl:grid-cols-3">
            {table.rows.map((asset) => (
              <article key={asset.id} className="bg-ad-surface p-5">
                <div className="grid aspect-[16/9] place-items-center overflow-hidden rounded-xl bg-ad-sunken">
                  <AssetPreview asset={asset} />
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-ad-ink">
                      {asset.name}
                    </h2>
                    <p className="mt-1 truncate text-[11px] text-ad-faint">
                      {asset.folder} · {asset.mimeType}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener"
                      aria-label={`Open ${asset.name} in a new tab`}
                      className="rounded-lg p-2 text-ad-faint ring-1 ring-ad-line transition hover:text-ad-accent hover:ring-ad-accent/60"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => copyUrl(asset)}
                      aria-label={`Copy the URL for ${asset.name}`}
                      className="rounded-lg p-2 text-ad-faint ring-1 ring-ad-line transition hover:text-ad-accent hover:ring-ad-accent/60"
                    >
                      {copied === asset.id ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    {readOnly ? null : (
                      <button
                        type="button"
                        onClick={() => remove(asset)}
                        disabled={busyId === asset.id}
                        aria-label={`Delete ${asset.name}`}
                        className="rounded-lg p-2 text-rose-500 ring-1 ring-rose-500/20 transition hover:bg-rose-500/10 disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="px-6 py-16 text-center text-sm text-ad-faint">
            {table.unfilteredTotal
              ? "No media matches the current filters."
              : "No media has been uploaded."}
          </p>
        )}
        <TablePagination
          page={table.page}
          pageCount={table.pageCount}
          total={table.total}
          pageSize={table.pageSize}
          onPage={table.setPage}
        />
      </div>
      {open ? (
        <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-slate-950/60 p-2.5 sm:p-4">
          <form
            noValidate
            onSubmit={upload}
            className="animate-rise w-full max-w-lg rounded-2xl bg-ad-raised p-4 shadow-ad-lg ring-1 ring-ad-line sm:p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Upload media</h2>
              <button type="button" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <RequiredNote />
              <span className="block text-xs font-semibold text-ad-muted">
                File <Req />
              </span>
              <input
                name="file"
                type="file"
                aria-label="File"
                required
                multiple
                onChange={(event) =>
                  setChosen(event.currentTarget.files?.length ?? 0)
                }
                accept={ACCEPTED_UPLOAD_TYPES.join(",")}
                className="block w-full rounded-lg border border-dashed border-ad-line p-5 text-xs"
              />
              <p className="text-[11px] text-ad-faint">
                {chosen > 1
                  ? `${chosen} files selected — each keeps its own file name.`
                  : "Choose one file, or several to upload them together."}
              </p>
              <p className="text-[11px] leading-5 text-ad-faint">
                {/* The accepted list is spelled out: "images and documents"
                    reads as though a Word file would be taken, and the file
                    picker's own "All files" option lets one be chosen. */}
                JPG, PNG, WebP and PDF up to {DEFAULT_MAX_UPLOAD_MB} MB; MP4
                video up to {MAX_UPLOAD_MB["video/mp4"]} MB. Images are
                converted to WebP automatically.
              </p>
              {/* A display name and alt text describe one file, so they are
                  offered only when one file is being uploaded. */}
              {chosen > 1 ? null : (
                <>
                  <input
                    name="name"
                    placeholder="Display name"
                    className="h-11 w-full rounded-lg ring-1 ring-ad-line px-3 text-sm"
                  />
                  <input
                    name="altText"
                    placeholder="Accessible alt text"
                    className="h-11 w-full rounded-lg ring-1 ring-ad-line px-3 text-sm"
                  />
                </>
              )}
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-ad-muted">
                  Folder <Req />
                </span>
                {newFolder ? (
                  <div className="flex gap-2">
                    <input
                      name="folder"
                      aria-label="Folder"
                      required
                      autoFocus
                      value={folder}
                      onChange={(event) =>
                        // Folders become part of the file's path on disk, so
                        // a name is reduced to what a path can safely hold.
                        setFolder(
                          event.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]+/g, "-")
                            .replace(/^-+/, "")
                            .slice(0, 40),
                        )
                      }
                      placeholder="new-folder-name"
                      className="h-11 w-full rounded-lg px-3 text-sm ring-1 ring-ad-line"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setNewFolder(false);
                        setFolder(folders[0] ?? "general");
                      }}
                      className="h-11 shrink-0 rounded-lg px-3 text-xs font-semibold text-ad-muted ring-1 ring-ad-line"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <select
                    name="folder"
                    aria-label="Folder"
                    required
                    value={folder}
                    onChange={(event) => {
                      if (event.target.value === "__new") {
                        setNewFolder(true);
                        return setFolder("");
                      }
                      setFolder(event.target.value);
                    }}
                    className="h-11 w-full rounded-lg px-3 text-sm ring-1 ring-ad-line"
                  >
                    {folders.length ? null : (
                      <option value="general">general</option>
                    )}
                    {folders.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                    <option value="__new">+ New folder…</option>
                  </select>
                )}
              </label>
            </div>
            <button
              disabled={busy}
              className="mt-6 h-11 w-full rounded-lg bg-ad-accent text-sm font-semibold text-white"
            >
              {busy
                ? "Uploading…"
                : chosen > 1
                  ? `Upload ${chosen} files`
                  : "Upload file"}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
