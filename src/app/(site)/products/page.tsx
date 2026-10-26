import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Download } from "lucide-react";
import {
  CtaBand,
  SectionHead,
  SubHero,
} from "@/components/shared/page-sections";
import { cmsService, getPublishedEntry } from "@/services/cms.service";
import { cmsMetadata } from "@/lib/cms-metadata";
import {
  productCardContentSchema,
  productsPageContentSchema,
} from "@/validations/public-content.validation";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata(await getPublishedEntry("page", "products"));
}

const Yes = ({ label }: { label: string }) => (
  <span className="yes">
    <Check className="i" aria-hidden="true" /> {label}
  </span>
);

export default async function ProductsPage() {
  const [entries, pageEntry] = await Promise.all([
    cmsService.published("product"),
    getPublishedEntry("page", "products"),
  ]);
  if (!pageEntry)
    throw new Error("Published products page content is missing.");
  const pageContent = productsPageContentSchema.parse(pageEntry.content);
  const products = entries.map((entry) => ({
    ...entry,
    details: productCardContentSchema.parse(entry.content),
  }));
  return (
    <main id="main">
      <SubHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Innovations & Systems", href: "/products" },
          { label: "Products" },
        ]}
        tag={pageContent.hero.tag}
        title={pageContent.hero.title}
        summary={pageContent.hero.summary}
      />

      <section className="section" id="compare" aria-labelledby="compare-title">
        <div className="wrap">
          <SectionHead
            label={pageContent.portfolio.label}
            title={pageContent.portfolio.title}
            id="compare-title"
          />
          <div className="systems">
            {products.map(({ id, title, summary, details }) => (
              <article className="system reveal" id={details.anchor} key={id}>
                <div className="system__stage">
                  <Image
                    src={details.image}
                    alt={details.imageAlt}
                    width={600}
                    height={450}
                    unoptimized
                  />
                  <span className="system__flag">{details.approach}</span>
                </div>
                <div className="system__body">
                  <ul className="chips">
                    {details.chips.map((chip) => (
                      <li key={chip}>{chip}</li>
                    ))}
                  </ul>
                  <h2 className="system__title">{title}</h2>
                  <p>{summary}</p>
                  <ul className="ticks">
                    {details.features.map((t) => (
                      <li key={t}>
                        <Check className="i" aria-hidden="true" /> {t}
                      </li>
                    ))}
                  </ul>
                  <div className="system__actions">
                    <Link className="pill" href={details.primary.href}>
                      {details.primary.label}{" "}
                      <ArrowRight className="i" aria-hidden="true" />
                    </Link>
                    <Link className="link" href={details.secondary.href}>
                      {details.secondary.label}{" "}
                      {details.secondary.icon === "download" ? (
                        <Download className="i" aria-hidden="true" />
                      ) : (
                        <ArrowRight className="i" aria-hidden="true" />
                      )}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="section section--canvas"
        id="matrix"
        aria-labelledby="matrix-title"
      >
        <div className="wrap">
          <SectionHead
            label={pageContent.comparison.label}
            title={pageContent.comparison.title}
            id="matrix-title"
            text={pageContent.comparison.text}
          />
          <div
            className="matrix reveal"
            role="region"
            aria-label="Feature comparison table"
            tabIndex={0}
          >
            <table>
              <caption className="sr-only">
                {pageContent.comparison.caption}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{pageContent.comparison.featureLabel}</th>
                  <th scope="col">
                    <span className="matrix__sys">
                      {pageContent.comparison.first.title}
                    </span>
                    <small>{pageContent.comparison.first.subtitle}</small>
                  </th>
                  <th scope="col">
                    <span className="matrix__sys">
                      {pageContent.comparison.second.title}
                    </span>
                    <small>{pageContent.comparison.second.subtitle}</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageContent.matrix.flatMap(({ group, rows }) => [
                  <tr className="matrix__group" key={group}>
                    <th scope="rowgroup" colSpan={3}>
                      {group}
                    </th>
                  </tr>,
                  ...rows.map(([feature, nm, lnm]) => (
                    <tr key={feature}>
                      <th scope="row">{feature}</th>
                      <td>
                        {nm === "__yes__" ? (
                          <Yes label={pageContent.comparison.yesLabel} />
                        ) : (
                          nm
                        )}
                      </td>
                      <td>
                        {lnm === "__yes__" ? (
                          <Yes label={pageContent.comparison.yesLabel} />
                        ) : (
                          lnm
                        )}
                      </td>
                    </tr>
                  )),
                ])}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="quickbar" aria-label={pageContent.quick.ariaLabel}>
        <div className="wrap quickbar__inner">
          <p className="quickbar__label">
            <Download className="i" aria-hidden="true" />{" "}
            {pageContent.quick.label}
          </p>
          <ul>
            {pageContent.quickDownloads.map((q) => (
              <li key={q}>
                <Link href={pageContent.quick.href}>
                  {q} <span>{pageContent.quick.format}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link className="pill pill--sm" href={pageContent.quick.allHref}>
            {pageContent.quick.allLabel}{" "}
            <ArrowRight className="i" aria-hidden="true" />
          </Link>
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
