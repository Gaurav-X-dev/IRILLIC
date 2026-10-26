import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { CtaBand, SubHero } from "@/components/shared/page-sections";
import { ResourceLibrary } from "@/components/shared/resource-library";
import { cmsService } from "@/services/cms.service";
import { getPublishedEntry } from "@/services/cms.service";
import { cmsMetadata } from "@/lib/cms-metadata";
import type { Resource, ResourceType } from "@/types/site.types";
import { listingPageContentSchema } from "@/validations/public-content.validation";

export const dynamic = "force-dynamic";

function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`Resource field "${field}" is missing.`);
  return value.trim();
}

function requiredYear(value: unknown) {
  const year = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(year) || year < 1900 || year > 2200)
    throw new Error('Resource field "year" is missing or invalid.');
  return year;
}

function requiredResourceType(value: unknown): ResourceType {
  const type = requiredString(value, "resourceType");
  if (!["ifu", "study", "paper", "video"].includes(type))
    throw new Error('Resource field "resourceType" is invalid.');
  return type as ResourceType;
}

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata(await getPublishedEntry("page", "clinical-resources"));
}

export default async function ClinicalResourcesPage() {
  const [entries, pageEntry] = await Promise.all([
    cmsService.published("resource"),
    getPublishedEntry("page", "clinical-resources"),
  ]);
  if (!pageEntry)
    throw new Error("Published clinical resources page content is missing.");
  const pageContent = listingPageContentSchema.parse(pageEntry.content);
  if (!pageContent.resources)
    throw new Error("Clinical resource library copy is missing.");
  const resources: Resource[] = entries.map((entry) => ({
    type: requiredResourceType(entry.content.resourceType),
    title: entry.title,
    description: requiredString(entry.summary, "summary"),
    year: requiredYear(entry.content.year),
    meta: requiredString(entry.content.meta, "meta"),
    href:
      typeof entry.content.href === "string" ? entry.content.href : undefined,
  }));
  return (
    <main id="main">
      <SubHero
        crumbs={pageContent.breadcrumbs}
        tag={pageContent.hero.tag}
        title={pageContent.hero.title}
        summary={pageContent.hero.summary}
      />

      <section
        className="section section--tight"
        id="library"
        aria-labelledby="lib-title"
      >
        <div className="wrap">
          <h2 className="sr-only" id="lib-title">
            {pageContent.sectionTitle}
          </h2>
          <ResourceLibrary resources={resources} copy={pageContent.resources} />
          <p className="evidence-note">
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
