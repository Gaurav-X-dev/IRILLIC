"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Equal,
  FileText,
  Plus,
  Search,
  Sparkle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MegaSection, NavLink } from "@/types/site.types";
import type { SiteChromeContent } from "@/validations/public-content.validation";
import type { Branding } from "@/lib/branding";
import { SmartLink } from "@/components/shared/smart-link";

const DESKTOP_QUERY = "(min-width: 1101px)";

function pathOf(href: string): string {
  return href.split("#")[0] || "/";
}

function isSectionCurrent(section: MegaSection, pathname: string): boolean {
  return section.match.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function MegaLink({
  link,
  pathname,
  onNavigate,
}: {
  link: NavLink;
  pathname: string;
  onNavigate: () => void;
}) {
  if (link.external) {
    return (
      <SmartLink href={link.href} target="_blank" rel="noopener" onClick={onNavigate}>
        {link.label} <ArrowUpRight className="i" aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </SmartLink>
    );
  }
  const current = !link.href.includes("#") && pathOf(link.href) === pathname;
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      aria-current={current ? "page" : undefined}
    >
      {link.label}
    </Link>
  );
}

export function Header({
  branding,
  megaMenu,
  megaDownloads,
  searchChips,
  searchIndex,
}: Pick<
  SiteChromeContent,
  "megaMenu" | "megaDownloads" | "searchChips" | "searchIndex"
> & { branding: Branding }) {
  const pathname = usePathname();
  const router = useRouter();

  const [openKey, setOpenKey] = useState<MegaSection["key"] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [desktop, setDesktop] = useState(true);

  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const overlayOpen = useRef(false);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const searchBtnRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  overlayOpen.current = openKey !== null || searchOpen || drawerOpen;

  const closeAll = useCallback(() => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    setOpenKey(null);
    setSearchOpen(false);
    setDrawerOpen(false);
  }, []);

  /* desktop / mobile breakpoint */
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => {
      setDesktop(mq.matches);
      setOpenKey(null);
      setDrawerOpen(false);
    };
    setDesktop(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* close everything after navigation */
  useEffect(() => {
    closeAll();
  }, [pathname, closeAll]);

  /* shadow on scroll; hide on scroll down, reveal on scroll up */
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (!overlayOpen.current) {
        if (y > lastY && y > 320) setHidden(true);
        else if (y < lastY - 4 || y < 320) setHidden(false);
      }
      lastY = y;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* lock page scroll behind the mobile drawer */
  useEffect(() => {
    document.body.classList.toggle("is-locked", drawerOpen);
    return () => document.body.classList.remove("is-locked");
  }, [drawerOpen]);

  /* focus the search field when the panel opens */
  useEffect(() => {
    if (!searchOpen) return;
    const t = window.setTimeout(() => searchInputRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [searchOpen]);

  /* Escape closes the top-most overlay and returns focus */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (searchOpen) {
        setSearchOpen(false);
        searchBtnRef.current?.focus();
      } else if (openKey) {
        const trigger = triggerRefs.current[openKey];
        setOpenKey(null);
        trigger?.focus();
      } else if (drawerOpen) {
        setDrawerOpen(false);
        burgerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen, openKey, drawerOpen]);

  const openMega = (key: MegaSection["key"]) => {
    setSearchOpen(false);
    setOpenKey(key);
    setHidden(false);
  };

  const onItemEnter = (key: MegaSection["key"]) => {
    if (!desktop) return;
    window.clearTimeout(closeTimer.current);
    const delay = openKey ? 0 : 90;
    openTimer.current = window.setTimeout(() => openMega(key), delay);
  };

  const onItemLeave = (key: MegaSection["key"]) => {
    if (!desktop) return;
    window.clearTimeout(openTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setOpenKey((current) => (current === key ? null : current));
    }, 220);
  };

  const onItemBlur = (
    key: MegaSection["key"],
    e: React.FocusEvent<HTMLLIElement>,
  ) => {
    if (!desktop) return;
    const next = e.relatedTarget as Node | null;
    if (next && !e.currentTarget.contains(next)) {
      setOpenKey((current) => (current === key ? null : current));
    }
  };

  const onTriggerKey = (
    key: MegaSection["key"],
    e: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (e.key === "ArrowDown" && desktop) {
      e.preventDefault();
      openMega(key);
      window.requestAnimationFrame(() =>
        panelRefs.current[key]?.querySelector<HTMLAnchorElement>("a")?.focus(),
      );
    }
  };

  const toggleSearch = () => {
    setOpenKey(null);
    setDrawerOpen(false);
    setSearchOpen((open) => !open);
    setHidden(false);
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const terms = q.split(/\s+/);
    return searchIndex
      .filter((entry) => {
        const hay =
          `${entry.title} ${entry.section} ${entry.keywords}`.toLowerCase();
        return terms.every((term) => hay.includes(term));
      })
      .slice(0, 6);
  }, [query, searchIndex]);

  const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (results && results[0]) {
      closeAll();
      router.push(results[0].href);
    }
  };

  const scrimVisible = (desktop && openKey !== null) || searchOpen;
  const contactCurrent = pathname === "/contact";

  return (
    <>
      <header
        className={cn("hdr", scrolled && "is-scrolled", hidden && "is-hidden")}
        id="hdr"
      >
        <div className="hdr__bar">
          <Link
            className="hdr__logo"
            href="/"
            aria-label={`${branding.siteName} home`}
          >
            <Image
              src={branding.logo}
              alt={branding.siteName}
              width={473}
              height={139}
              priority
              unoptimized
            />
          </Link>

          <nav
            className={cn("nav", drawerOpen && "is-open")}
            id="nav"
            aria-label="Primary"
          >
            <ul className="nav__list">
              {megaMenu.map((section) => {
                const current = isSectionCurrent(section, pathname);
                const expanded = openKey === section.key;
                return (
                  <li
                    key={section.key}
                    className="nav__item"
                    onMouseEnter={() => onItemEnter(section.key)}
                    onMouseLeave={() => onItemLeave(section.key)}
                    onBlur={(e) => onItemBlur(section.key, e)}
                  >
                    <button
                      ref={(el) => {
                        triggerRefs.current[section.key] = el;
                      }}
                      className={cn("nav__trigger", current && "is-current")}
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`mega-${section.key}`}
                      onClick={() => {
                        window.clearTimeout(openTimer.current);
                        if (expanded) setOpenKey(null);
                        else openMega(section.key);
                      }}
                      onKeyDown={(e) => onTriggerKey(section.key, e)}
                    >
                      {section.label}{" "}
                      <Plus className="i nav__plus" aria-hidden="true" />
                      {current && (
                        <span className="sr-only">(current section)</span>
                      )}
                    </button>

                    <div
                      className="mega"
                      id={`mega-${section.key}`}
                      hidden={!expanded}
                      ref={(el) => {
                        panelRefs.current[section.key] = el;
                      }}
                    >
                      <div className="mega__inner">
                        <div className="mega__intro">
                          <p className="label">{section.label}</p>
                          <p className="mega__heading">
                            {section.heading}
                            <span className="dot">.</span>
                          </p>
                          <p>{section.intro}</p>
                          <Link
                            className="pill"
                            href={section.cta.href}
                            onClick={closeAll}
                            aria-current={
                              !section.cta.href.includes("#") &&
                              section.cta.href === pathname
                                ? "page"
                                : undefined
                            }
                          >
                            {section.cta.label}{" "}
                            <ArrowRight className="i" aria-hidden="true" />
                          </Link>
                        </div>
                        {section.columns.map((column) => (
                          <div className="mega__col" key={column.title}>
                            <p className="mega__title">{column.title}</p>
                            <ul className="mega__links">
                              {column.links.map((link) => (
                                <li key={link.label}>
                                  <MegaLink
                                    link={link}
                                    pathname={pathname}
                                    onNavigate={closeAll}
                                  />
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        <Link
                          className="mega__feature"
                          href={section.feature.href}
                          onClick={closeAll}
                        >
                          <span className="mega__feature-img">
                            <Image
                              src={section.feature.image}
                              alt=""
                              width={800}
                              height={500}
                              unoptimized
                            />
                          </span>
                          <span className="label">{section.feature.label}</span>
                          <span className="mega__feature-title">
                            {section.feature.title}
                          </span>
                          <span className="link">
                            {section.feature.cta}{" "}
                            <ArrowRight className="i" aria-hidden="true" />
                          </span>
                        </Link>
                      </div>
                      <div className="mega__ifu">
                        <p className="label">{section.downloadsLabel}</p>
                        <ul>
                          {megaDownloads.map((d) => (
                            <li key={d.label}>
                              <Link href={d.href} onClick={closeAll}>
                                <FileText className="i" aria-hidden="true" />{" "}
                                {d.label} <span>PDF</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="nav__mobile-actions">
              <Link className="pill" href="/contact" onClick={closeAll}>
                Contact <ArrowRight className="i" aria-hidden="true" />
              </Link>
            </div>
          </nav>

          <div className="hdr__actions">
            <button
              ref={searchBtnRef}
              className="search-pill"
              type="button"
              id="search-open"
              aria-haspopup="dialog"
              aria-controls="search"
              aria-expanded={searchOpen}
              onClick={toggleSearch}
            >
              <Sparkle className="i i--red i--fill" aria-hidden="true" />
              <span>Search</span>
            </button>
            <Link
              className="pill pill--sm hdr__contact"
              href="/contact"
              aria-current={contactCurrent ? "page" : undefined}
            >
              Contact <ArrowRight className="i" aria-hidden="true" />
            </Link>
            <button
              ref={burgerRef}
              className="hdr__burger"
              type="button"
              id="burger"
              aria-controls="nav"
              aria-expanded={drawerOpen}
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              onClick={() => {
                setSearchOpen(false);
                setDrawerOpen((open) => !open);
                setHidden(false);
              }}
            >
              {drawerOpen ? (
                <X className="i" aria-hidden="true" />
              ) : (
                <Equal className="i" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Search panel */}
        <div
          className="search"
          id="search"
          role="dialog"
          aria-modal="true"
          aria-label="Search the site"
          hidden={!searchOpen}
        >
          <div className="search__inner">
            <form
              className="search__form"
              role="search"
              onSubmit={onSearchSubmit}
            >
              <Search className="i" aria-hidden="true" />
              <label className="sr-only" htmlFor="search-input">
                Search Irillic
              </label>
              <input
                ref={searchInputRef}
                id="search-input"
                type="search"
                placeholder="What are you looking for?"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                className="search__close"
                type="button"
                aria-label="Close search"
                onClick={() => {
                  setSearchOpen(false);
                  searchBtnRef.current?.focus();
                }}
              >
                <X className="i" aria-hidden="true" />
              </button>
            </form>
            <div className="search__suggest" hidden={results !== null}>
              <p className="label">Popular searches</p>
              <div className="search__chips">
                {searchChips.map((chip) => (
                  <button
                    key={chip.query}
                    type="button"
                    onClick={() => {
                      setQuery(chip.query);
                      searchInputRef.current?.focus();
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
            <ul className="search__results" aria-live="polite">
              {results && results.length === 0 && (
                <li className="search__empty">
                  No results for &ldquo;{query.trim()}&rdquo;. Try
                  &ldquo;ICG&rdquo;, &ldquo;IFU&rdquo; or
                  &ldquo;laparoscopic&rdquo;.
                </li>
              )}
              {results?.map((entry) => (
                <li key={entry.href + entry.title}>
                  <Link href={entry.href} onClick={closeAll}>
                    <span>
                      <small>{entry.section}</small>
                      <strong>{entry.title}</strong>
                    </span>
                    <ArrowRight className="i" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>
      <div className="scrim" hidden={!scrimVisible} onClick={closeAll} />
    </>
  );
}
