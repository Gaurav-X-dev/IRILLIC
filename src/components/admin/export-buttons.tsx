import { FileDown } from "lucide-react";

export function ExportButtons({
  dataset,
  type,
}: {
  dataset:
    | "content"
    | "enquiries"
    | "media"
    | "users"
    | "audit"
    | "sessions"
    | "security-events";
  type?: string;
}) {
  const query = `dataset=${dataset}${type ? `&type=${encodeURIComponent(type)}` : ""}`;
  return (
    <div
      className="flex items-center gap-1 rounded-xl bg-ad-surface p-1 ring-1 ring-ad-line"
      aria-label="Export records"
    >
      <span className="hidden items-center gap-1 px-2 text-[10px] font-semibold text-ad-faint lg:flex">
        <FileDown size={13} /> Export
      </span>
      {(["csv", "excel", "pdf"] as const).map((format) => (
        <a
          key={format}
          href={`/api/admin/export?${query}&format=${format}`}
          className="rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase text-ad-muted transition-colors hover:bg-ad-accent-soft hover:text-ad-accent"
        >
          {format === "excel" ? "XLS" : format}
        </a>
      ))}
    </div>
  );
}
