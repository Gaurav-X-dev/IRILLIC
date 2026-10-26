import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Crumb } from "@/types/site.types";

/* ------------------------------------------------------------------ Breadcrumbs */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((c) => (
          <li key={c.label}>
            {c.href ? (
              <Link href={c.href}>{c.label}</Link>
            ) : (
              <span aria-current="page">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ------------------------------------------------------------------ Sub-hero */
interface SubHeroProps {
  crumbs: Crumb[];
  tag: string;
  title: string;
  summary: string;
  media?: React.ReactNode;
}

/** Light inner-page banner: breadcrumb, category tag, editorial title, 2-sentence summary. */
export function SubHero({ crumbs, tag, title, summary, media }: SubHeroProps) {
  return (
    <section className="subhero" aria-labelledby="page-title">
      <div className="wrap">
        <Breadcrumbs items={crumbs} />
        <div className={cn("subhero__grid", media && "subhero__grid--media")}>
          <div className="subhero__copy">
            <p className="tag reveal">{tag}</p>
            <h1 className="subhero__title reveal" id="page-title">
              {title}
              <span className="dot">.</span>
            </h1>
            <p className="subhero__summary reveal">{summary}</p>
          </div>
          {media && <div className="subhero__media reveal">{media}</div>}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Section heading */
interface SectionHeadProps {
  label: string;
  title: string;
  id: string;
  text?: string;
  aside?: React.ReactNode;
}

export function SectionHead({
  label,
  title,
  id,
  text,
  aside,
}: SectionHeadProps) {
  return (
    <header className={cn("sec-head reveal", aside && "sec-head--split")}>
      <div>
        <p className="label">{label}</p>
        <h2 className="h2" id={id}>
          {title}
          <span className="dot">.</span>
        </h2>
        {text && <p className="sec-head__text">{text}</p>}
      </div>
      {aside}
    </header>
  );
}

/* ------------------------------------------------------------------ CTA band */
interface CtaBandProps {
  title: string;
  text: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}

export function CtaBand({ title, text, primary, secondary }: CtaBandProps) {
  return (
    <section className="cta-band" aria-label={title}>
      <div className="wrap cta-band__inner reveal">
        <div>
          <p className="label">Next step</p>
          <h2 className="cta-band__title">
            {title}
            <span className="dot">.</span>
          </h2>
          <p>{text}</p>
        </div>
        <div className="cta-band__actions">
          <Link className="pill pill--lg" href={primary.href}>
            {primary.label} <ArrowRight className="i" aria-hidden="true" />
          </Link>
          {secondary && (
            <Link className="link-pill link-pill--light" href={secondary.href}>
              {secondary.label}{" "}
              <ArrowUpRight className="i" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
