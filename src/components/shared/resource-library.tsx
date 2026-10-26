"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Download,
  FileText,
  Play,
  Search,
  Video,
} from "lucide-react";
import { useHashChange } from "@/hooks/use-hash-change";
import { pubmedUrl } from "@/lib/site-content";
import type { Resource, ResourceType } from "@/types/site.types";

type Sort = "new" | "old" | "az";
type ResourceCopy = {
  searchLabel: string;
  searchPlaceholder: string;
  filterLabel: string;
  showingTemplate: string;
  sortLabel: string;
  sortNewest: string;
  sortOldest: string;
  sortAz: string;
  emptyTitle: string;
  emptyText: string;
  requestLabel: string;
  requestHref: string;
  publicationAction: string;
  videoAction: string;
  downloadAction: string;
  newTabLabel: string;
  filters: { type: ResourceType | "all"; hash: string; label: string }[];
  typeLabels: Record<ResourceType, string>;
};

const ICONS: Record<ResourceType, typeof FileText> = {
  ifu: FileText,
  study: BookOpen,
  paper: FileText,
  video: Video,
};

function ResourceAction({
  resource,
  copy,
}: {
  resource: Resource;
  copy: ResourceCopy;
}) {
  if (resource.type === "study") {
    return (
      <a
        className="pill pill--sm"
        href={pubmedUrl(resource.title)}
        target="_blank"
        rel="noopener"
      >
        {copy.publicationAction}{" "}
        <ArrowUpRight className="i" aria-hidden="true" />
        <span className="sr-only">({copy.newTabLabel})</span>
      </a>
    );
  }
  if (resource.type === "video") {
    return (
      <a className="pill pill--sm" href={resource.href}>
        {copy.videoAction} <Play className="i i--fill" aria-hidden="true" />
      </a>
    );
  }
  return (
    <a className="pill pill--sm" href={resource.href} download>
      {copy.downloadAction} <Download className="i" aria-hidden="true" />
    </a>
  );
}

/** Theme 1 resource library: type filters, instant search, sort, #hash deep links. */
export function ResourceLibrary({
  resources,
  copy,
}: {
  resources: Resource[];
  copy: ResourceCopy;
}) {
  const [filter, setFilter] = useState<ResourceType | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("new");
  const sectionRef = useRef<HTMLDivElement>(null);

  useHashChange((hash) => {
    const match = copy.filters.find((f) => f.hash === hash);
    if (!match) return;
    setFilter(match.type);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    sectionRef.current?.closest("section")?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  });

  const chooseFilter = (type: ResourceType | "all", hash: string) => {
    setFilter(type);
    const url = type === "all" ? window.location.pathname : `#${hash}`;
    window.history.replaceState(window.history.state, "", url);
  };

  const sorted = useMemo(() => {
    const list = [...resources];
    if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    else
      list.sort((a, b) => (sort === "old" ? a.year - b.year : b.year - a.year));
    return list;
  }, [resources, sort]);

  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const isVisible = (r: Resource) => {
    if (filter !== "all" && r.type !== filter) return false;
    const hay =
      `${copy.typeLabels[r.type]} ${r.title} ${r.description} ${r.year} ${r.meta}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  };
  const shown = sorted.filter(isVisible).length;

  return (
    <div ref={sectionRef}>
      <div className="lib-tools reveal">
        <label className="lib-search">
          <Search className="i" aria-hidden="true" />
          <span className="sr-only">{copy.searchLabel}</span>
          <input
            type="search"
            id="lib-search"
            placeholder={copy.searchPlaceholder}
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="lib-filters" role="group" aria-label={copy.filterLabel}>
          {copy.filters.map((f) => (
            <button
              key={f.type}
              type="button"
              aria-pressed={filter === f.type}
              onClick={() => chooseFilter(f.type, f.hash)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="lib-meta">
          <p className="lib-count" aria-live="polite">
            {copy.showingTemplate
              .replace("{shown}", String(shown))
              .replace("{total}", String(resources.length))}
          </p>
          <label className="lib-sort">
            <span>{copy.sortLabel}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
            >
              <option value="new">{copy.sortNewest}</option>
              <option value="old">{copy.sortOldest}</option>
              <option value="az">{copy.sortAz}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="res-grid">
        {sorted.map((r) => {
          const Icon = ICONS[r.type];
          return (
            <article
              className="res"
              data-type={r.type}
              key={r.title}
              hidden={!isVisible(r)}
            >
              <div className="res__top">
                <span className="res__icon">
                  <Icon className="i" aria-hidden="true" />
                </span>
                <span className="res__type">{copy.typeLabels[r.type]}</span>
              </div>
              <h3 className="res__title">{r.title}</h3>
              <p className="res__desc">{r.description}</p>
              <div className="res__foot">
                <span className="res__meta">
                  {r.year} · {r.meta}
                </span>
                <ResourceAction resource={r} copy={copy} />
              </div>
            </article>
          );
        })}
      </div>

      <div className="lib-empty" hidden={shown !== 0}>
        <p className="lib-empty__title">{copy.emptyTitle}</p>
        <p>{copy.emptyText}</p>
        <Link className="link-pill" href={copy.requestHref}>
          {copy.requestLabel} <ArrowUpRight className="i" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
