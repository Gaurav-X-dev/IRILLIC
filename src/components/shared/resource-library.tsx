"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ArrowUpRight, BookOpen, Download, FileText, Play, Search, Video } from "lucide-react";
import { useHashChange } from "@/hooks/use-hash-change";
import { pubmedUrl, RESOURCE_FILTERS, RESOURCE_LABELS, RESOURCES } from "@/lib/site-content";
import type { Resource, ResourceType } from "@/types/site.types";

type Sort = "new" | "old" | "az";

const ICONS: Record<ResourceType, typeof FileText> = {
  ifu: FileText,
  study: BookOpen,
  paper: FileText,
  video: Video,
};

function ResourceAction({ resource }: { resource: Resource }) {
  if (resource.type === "study") {
    return (
      <a className="pill pill--sm" href={pubmedUrl(resource.title)} target="_blank" rel="noopener">
        View Publication <ArrowUpRight className="i" aria-hidden="true" />
        <span className="sr-only">(opens PubMed in a new tab)</span>
      </a>
    );
  }
  if (resource.type === "video") {
    return (
      <a className="pill pill--sm" href={resource.href}>
        Watch Video <Play className="i i--fill" aria-hidden="true" />
      </a>
    );
  }
  return (
    <a className="pill pill--sm" href={resource.href} download>
      Download Document <Download className="i" aria-hidden="true" />
    </a>
  );
}

/** Theme 1 resource library: type filters, instant search, sort, #hash deep links. */
export function ResourceLibrary() {
  const [filter, setFilter] = useState<ResourceType | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("new");
  const sectionRef = useRef<HTMLDivElement>(null);

  useHashChange((hash) => {
    const match = RESOURCE_FILTERS.find((f) => f.hash === hash);
    if (!match) return;
    setFilter(match.type);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sectionRef.current?.closest("section")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  });

  const chooseFilter = (type: ResourceType | "all", hash: string) => {
    setFilter(type);
    const url = type === "all" ? window.location.pathname : `#${hash}`;
    window.history.replaceState(window.history.state, "", url);
  };

  const sorted = useMemo(() => {
    const list = [...RESOURCES];
    if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    else list.sort((a, b) => (sort === "old" ? a.year - b.year : b.year - a.year));
    return list;
  }, [sort]);

  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const isVisible = (r: Resource) => {
    if (filter !== "all" && r.type !== filter) return false;
    const hay = `${RESOURCE_LABELS[r.type]} ${r.title} ${r.description} ${r.year} ${r.meta}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  };
  const shown = sorted.filter(isVisible).length;

  return (
    <div ref={sectionRef}>
      <div className="lib-tools reveal">
        <label className="lib-search">
          <Search className="i" aria-hidden="true" />
          <span className="sr-only">Search resources</span>
          <input
            type="search"
            id="lib-search"
            placeholder="Search papers, IFUs and guides"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="lib-filters" role="group" aria-label="Filter by type">
          {RESOURCE_FILTERS.map((f) => (
            <button key={f.type} type="button" aria-pressed={filter === f.type} onClick={() => chooseFilter(f.type, f.hash)}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="lib-meta">
          <p className="lib-count" aria-live="polite">
            Showing {shown} of {RESOURCES.length} resources
          </p>
          <label className="lib-sort">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="new">Newest first</option>
              <option value="old">Oldest first</option>
              <option value="az">Title A–Z</option>
            </select>
          </label>
        </div>
      </div>

      <div className="res-grid">
        {sorted.map((r) => {
          const Icon = ICONS[r.type];
          return (
            <article className="res" data-type={r.type} key={r.title} hidden={!isVisible(r)}>
              <div className="res__top">
                <span className="res__icon">
                  <Icon className="i" aria-hidden="true" />
                </span>
                <span className="res__type">{RESOURCE_LABELS[r.type]}</span>
              </div>
              <h3 className="res__title">{r.title}</h3>
              <p className="res__desc">{r.description}</p>
              <div className="res__foot">
                <span className="res__meta">
                  {r.year} · {r.meta}
                </span>
                <ResourceAction resource={r} />
              </div>
            </article>
          );
        })}
      </div>

      <div className="lib-empty" hidden={shown !== 0}>
        <p className="lib-empty__title">No resources match your search.</p>
        <p>Try another keyword, or ask our team for the document you need.</p>
        <Link className="link-pill" href="/contact#form">
          Request a document <ArrowUpRight className="i" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
