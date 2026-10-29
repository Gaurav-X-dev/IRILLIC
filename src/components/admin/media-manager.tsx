/* Uploaded assets use their original CMS URL and intentionally bypass Next image optimization. */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { Check, Copy, FileImage, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  TableFilter,
  TablePagination,
  TableSearch,
  useTableControls,
} from "@/components/admin/table-controls";

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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const router = useRouter();
  const folders = Array.from(
    new Set(assets.map((asset) => asset.folder)),
  ).sort();
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
    setBusy(true);
    setError("");
    const response = await fetch("/api/admin/media", {
      method: "POST",
      body: new FormData(event.currentTarget),
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) return setError(result.error || "Upload failed");
    setOpen(false);
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
                  {asset.mimeType.startsWith("image/") ? (
                    <img
                      src={asset.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileImage size={32} className="text-ad-faint" />
                  )}
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
                  <button
                    type="button"
                    onClick={() => copyUrl(asset)}
                    aria-label={`Copy the URL for ${asset.name}`}
                    className="shrink-0 rounded-lg ring-1 ring-ad-line p-2 text-ad-faint transition hover:border-cyan-300 hover:text-ad-accent"
                  >
                    {copied === asset.id ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
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
              <input
                name="file"
                type="file"
                required
                accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4"
                className="block w-full rounded-lg border border-dashed border-ad-line p-5 text-xs"
              />
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
              <input
                name="folder"
                placeholder="Folder"
                defaultValue="general"
                className="h-11 w-full rounded-lg ring-1 ring-ad-line px-3 text-sm"
              />
              {error ? <p className="text-xs text-red-600">{error}</p> : null}
            </div>
            <button
              disabled={busy}
              className="mt-6 h-11 w-full rounded-lg bg-ad-accent text-sm font-semibold text-white"
            >
              {busy ? "Uploading…" : "Upload file"}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
