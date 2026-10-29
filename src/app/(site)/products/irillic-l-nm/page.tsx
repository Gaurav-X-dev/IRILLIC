import type { Metadata } from "next";
import Link from "next/link";
import {
  Aperture,
  ArrowRight,
  ArrowUpRight,
  Download,
  Droplet,
  Eye,
  Layers,
  Monitor,
  ShieldCheck,
  SlidersVertical,
  Users,
  Video,
  Zap,
} from "lucide-react";
import {
  Breadcrumbs,
  CtaBand,
  SectionHead,
} from "@/components/shared/page-sections";
import { ProductGallery } from "@/components/shared/product-gallery";
import { SubNav } from "@/components/shared/sub-nav";
import { TabSet, type TabItem } from "@/components/shared/tab-set";
import { getPublishedEntry } from "@/services/cms.service";
import { cmsMetadata } from "@/lib/cms-metadata";
import { lnmDetailContentSchema } from "@/validations/public-content.validation";
import { SmartLink } from "@/components/shared/smart-link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata(await getPublishedEntry("product", "irillic-l-nm"));
}

const pad = (n: number) => String(n).padStart(2, "0");

export default async function ProductDetailPage() {
  const entry = await getPublishedEntry("product", "irillic-l-nm");
  if (!entry)
    throw new Error("Published Irillic L nm product content is missing.");
  const content = lnmDetailContentSchema.parse(entry.content);
  const specIconMap = {
    aperture: Aperture,
    eye: Eye,
    sliders: SlidersVertical,
    droplet: Droplet,
  };
  const workflowIconMap = { droplet: Droplet, zap: Zap, eye: Eye };
  const compatibilityIconMap = {
    monitor: Monitor,
    layers: Layers,
    video: Video,
    users: Users,
  };
  const dynamicSpecItems: TabItem[] = content.specificationTabs.map(
    ({ id, icon, label, title, intro, notice, rows }) => {
      const Icon = specIconMap[icon];
      return {
        id,
        label: (
          <>
            <Icon className="i" aria-hidden="true" /> {label}
          </>
        ),
        panel: (
          <div className="spec-panel">
            <div>
              <h3>{title}</h3>
              <p>{intro}</p>
              {notice ? (
                <p className="notice">
                  <ShieldCheck className="i" aria-hidden="true" /> {notice}
                </p>
              ) : null}
            </div>
            <dl className="spec-table">
              {rows.map(([dt, dd]) => (
                <div key={dt}>
                  <dt>{dt}</dt>
                  <dd>{dd}</dd>
                </div>
              ))}
            </dl>
          </div>
        ),
      };
    },
  );
  return (
    <main id="main">
      <section className="phero" aria-labelledby="page-title">
        <div className="wrap">
          <Breadcrumbs items={content.pageCopy.breadcrumbs} />
          <div className="phero__grid">
            <ProductGallery views={content.hero.views} />
            <div className="phero__copy">
              <p className="tag reveal">{content.hero.tag}</p>
              <h1 className="subhero__title reveal" id="page-title">
                {content.hero.title}
                <span className="dot">.</span>
              </h1>
              <p className="subhero__summary reveal">{content.hero.summary}</p>
              {/* Confirm certification marks with Irillic Quality & Regulatory before publishing. */}
              <ul
                className="badges reveal"
                aria-label={content.pageCopy.certificationsLabel}
              >
                {content.hero.badges.map((badge) => (
                  <li key={badge}>
                    <strong>{badge}</strong>
                  </li>
                ))}
              </ul>
              <dl className="keyspecs reveal">
                {content.hero.keySpecs.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="phero__ctas reveal">
                <Link
                  className="pill pill--lg"
                  href={content.pageCopy.primary.href}
                >
                  {content.pageCopy.primary.label}{" "}
                  <ArrowRight className="i" aria-hidden="true" />
                </Link>
                <Link
                  className="link-pill link-pill--lg"
                  href={content.pageCopy.secondary.href}
                >
                  {content.pageCopy.secondary.label}{" "}
                  <Download className="i" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SubNav items={content.pageCopy.navigation} />

      <section className="section" id="specs" aria-labelledby="specs-title">
        <div className="wrap">
          <SectionHead
            label={content.pageCopy.specs.label}
            title={content.pageCopy.specs.title}
            id="specs-title"
          />
          <TabSet
            items={dynamicSpecItems}
            label={content.pageCopy.specs.tabsLabel}
            className="tabs reveal"
          />
        </div>
      </section>

      <section
        className="section section--canvas"
        id="workflow"
        aria-labelledby="workflow-title"
      >
        <div className="wrap">
          <SectionHead
            label={content.pageCopy.workflow.label}
            title={content.pageCopy.workflow.title}
            id="workflow-title"
          />
          <ol className="workflow">
            {content.workflow.map(({ icon, title, text }, i) => {
              const Icon = workflowIconMap[icon];
              return (
                <li className="flow reveal" key={title}>
                  <span className="flow__num">{pad(i + 1)}</span>
                  <span className="flow__icon">
                    <Icon className="i" aria-hidden="true" />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section
        className="section"
        id="compatibility"
        aria-labelledby="compat-title"
      >
        <div className="wrap compat">
          <div className="compat__copy">
            <SectionHead
              label={content.pageCopy.compatibility.label}
              title={content.pageCopy.compatibility.title}
              id="compat-title"
            />
            <p className="reveal">{content.pageCopy.compatibility.text}</p>
            <Link
              className="pill reveal"
              href={content.pageCopy.compatibility.link.href}
            >
              {content.pageCopy.compatibility.link.label}{" "}
              <ArrowRight className="i" aria-hidden="true" />
            </Link>
          </div>
          <ul className="compat__list">
            {content.compatibility.map(({ icon, title, text }) => {
              const Icon = compatibilityIconMap[icon];
              return (
                <li className="reveal" key={title}>
                  <Icon className="i" aria-hidden="true" />
                  <div>
                    <strong>{title}</strong>
                    <span>{text}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section
        className="section section--canvas"
        id="downloads"
        aria-labelledby="dl-title"
      >
        <div className="wrap">
          <SectionHead
            label={content.pageCopy.downloads.label}
            title={content.pageCopy.downloads.title}
            id="dl-title"
            aside={
              <Link
                className="pill pill--sm"
                href={content.pageCopy.downloads.link.href}
              >
                {content.pageCopy.downloads.link.label}{" "}
                <ArrowUpRight className="i" aria-hidden="true" />
              </Link>
            }
          />
          <div className="docs">
            {content.downloads.map((d) => (
              <SmartLink className="doc reveal" href={d.href} download key={d.title}>
                <span className="doc__cat">{d.cat}</span>
                <span className="doc__title">{d.title}</span>
                <span className="doc__meta">
                  {d.meta}{" "}
                  <span className="circle-arrow circle-arrow--red">
                    <Download className="i" aria-hidden="true" />
                  </span>
                </span>
              </SmartLink>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title={content.pageCopy.cta.title}
        text={content.pageCopy.cta.text}
        primary={content.pageCopy.cta.primary}
        secondary={content.pageCopy.cta.secondary}
      />
    </main>
  );
}
