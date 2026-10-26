import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Droplet,
  HeartPulse,
  Scan,
  Target,
} from "lucide-react";
import { CtaBand, SubHero } from "@/components/shared/page-sections";
import { TabSet, type TabItem } from "@/components/shared/tab-set";
import { pubmedUrl } from "@/lib/site-content";
import { resolveContentIcon } from "@/lib/content-icons";
import { cmsService } from "@/services/cms.service";
import { getPublishedEntry } from "@/services/cms.service";
import { cmsMetadata } from "@/lib/cms-metadata";
import type { Reference } from "@/types/site.types";
import { listingPageContentSchema } from "@/validations/public-content.validation";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata(await getPublishedEntry("page", "clinical-applications"));
}

export const dynamic = "force-dynamic";
/** Defaults for the applications shipped with the website; an entry created in
    the panel picks its own icon through the `icon` field instead. */
const slugIcons = {
  oncology: Target,
  reconstructive: HeartPulse,
  gastro: Scan,
  urology: Droplet,
};

function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`Clinical application field "${field}" is missing.`);
  return value.trim();
}

export default async function ClinicalApplicationsPage() {
  const [entries, pageEntry] = await Promise.all([
    cmsService.published("application"),
    getPublishedEntry("page", "clinical-applications"),
  ]);
  if (!pageEntry)
    throw new Error("Published clinical applications page content is missing.");
  const pageContent = listingPageContentSchema.parse(pageEntry.content);
  if (!pageContent.applications)
    throw new Error("Clinical application interface copy is missing.");
  const copy = pageContent.applications;
  const items: TabItem[] = entries.map((s) => {
    const Icon = resolveContentIcon(s.content.icon, slugIcons, s.slug);
    const benefits = Array.isArray(s.content.benefits)
      ? s.content.benefits.map(String)
      : [];
    const steps = Array.isArray(s.content.steps)
      ? s.content.steps.map(String)
      : [];
    const references = Array.isArray(s.content.references)
      ? (s.content.references as unknown as Reference[])
      : [];
    if (typeof s.content.system !== "object" || !s.content.system)
      throw new Error(`Clinical application "${s.slug}" has no system link.`);
    const system = s.content.system as { label?: string; href?: string };
    const systemLabel = requiredString(system.label, "system.label");
    const systemHref = requiredString(system.href, "system.href");
    return {
      id: s.slug,
      hash: s.slug,
      label: (
        <>
          <Icon className="i" aria-hidden="true" /> {s.title}
        </>
      ),
      panel: (
        <article className="app">
          <figure className="app__media">
            <Image
              src={requiredString(s.content.image, "image")}
              alt={requiredString(s.content.alt, "alt")}
              width={800}
              height={500}
              unoptimized
            />
            <figcaption>{copy.figureCaption}</figcaption>
          </figure>
          <div className="app__body">
            <h2 className="app__title">{s.title}</h2>
            <div className="app__block">
              <p className="label">{copy.rationaleLabel}</p>
              <p>{requiredString(s.content.rationale, "rationale")}</p>
            </div>
            <div className="app__grid">
              <div className="app__block">
                <p className="label">{copy.benefitsLabel}</p>
                <ul className="ticks">
                  {benefits.map((b) => (
                    <li key={b}>
                      <Check className="i" aria-hidden="true" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="app__block app__case">
                <p className="label">{copy.workflowLabel}</p>
                <ol>
                  {steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="app__block">
              <p className="label">{copy.literatureLabel}</p>
              <ul className="refs">
                {references.map((r) => (
                  <li key={r.title}>
                    <a href={pubmedUrl(r.title)} target="_blank" rel="noopener">
                      <span className="ref__authors">{r.authors}</span>{" "}
                      <span className="ref__title">{r.title}.</span>{" "}
                      <em>{r.journal}</em>{" "}
                      <ArrowUpRight className="i" aria-hidden="true" />
                      <span className="sr-only">
                        (opens PubMed in a new tab)
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="app__foot">
              <span>{copy.recommendedLabel}</span>
              <Link className="link-pill" href={systemHref}>
                {systemLabel} <ArrowUpRight className="i" aria-hidden="true" />
              </Link>
              <Link className="pill pill--sm" href={copy.demoHref}>
                {copy.demoLabel} <ArrowRight className="i" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </article>
      ),
    };
  });
  return (
    <main id="main">
      <SubHero
        crumbs={pageContent.breadcrumbs}
        tag={pageContent.hero.tag}
        title={pageContent.hero.title}
        summary={pageContent.hero.summary}
      />

      <section
        className="section"
        id="specialties"
        aria-labelledby="spec-title"
      >
        <div className="wrap">
          <h2 className="sr-only" id="spec-title">
            {pageContent.sectionTitle}
          </h2>
          <TabSet
            items={items}
            label={copy.tabsLabel}
            className="tabs tabs--filter"
            hashSync
          />
          <p className="evidence-note reveal">
            <BookOpen className="i" aria-hidden="true" />{" "}
            {pageContent.evidenceNote}
          </p>
        </div>
      </section>

      <CtaBand
        title={pageContent.cta.title}
        text={pageContent.cta.text}
        primary={pageContent.cta.primary}
        secondary={pageContent.cta.secondary}
      />
    </main>
  );
}
