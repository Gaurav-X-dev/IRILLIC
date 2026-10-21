import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Check } from "lucide-react";
import { CtaBand, SubHero } from "@/components/shared/page-sections";
import { TabSet, type TabItem } from "@/components/shared/tab-set";
import { pubmedUrl, SPECIALTIES } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Clinical Applications",
  description:
    "ICG fluorescence guidance in surgical oncology, plastic and reconstructive, gastrointestinal, urological and gynaecological surgery.",
};

const items: TabItem[] = SPECIALTIES.map((s) => {
  const Icon = s.icon;
  return {
    id: s.key,
    hash: s.key,
    label: (
      <>
        <Icon className="i" aria-hidden="true" /> {s.name}
      </>
    ),
    panel: (
      <article className="app">
        <figure className="app__media">
          <Image src={s.image} alt={s.alt} width={800} height={500} unoptimized />
          <figcaption>NIR fluorescence · Illustrative imaging</figcaption>
        </figure>
        <div className="app__body">
          <h2 className="app__title">{s.name}</h2>
          <div className="app__block">
            <p className="label">Clinical rationale</p>
            <p>{s.rationale}</p>
          </div>
          <div className="app__grid">
            <div className="app__block">
              <p className="label">Key benefits</p>
              <ul className="ticks">
                {s.benefits.map((b) => (
                  <li key={b}>
                    <Check className="i" aria-hidden="true" /> {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="app__block app__case">
              <p className="label">Representative case workflow</p>
              <ol>
                {s.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
          <div className="app__block">
            <p className="label">Published clinical literature</p>
            <ul className="refs">
              {s.references.map((r) => (
                <li key={r.title}>
                  <a href={pubmedUrl(r.title)} target="_blank" rel="noopener">
                    <span className="ref__authors">{r.authors}</span> <span className="ref__title">{r.title}.</span>{" "}
                    <em>{r.journal}</em> <ArrowUpRight className="i" aria-hidden="true" />
                    <span className="sr-only">(opens PubMed in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="app__foot">
            <span>Recommended system</span>
            <Link className="link-pill" href={s.system.href}>
              {s.system.label} <ArrowUpRight className="i" aria-hidden="true" />
            </Link>
            <Link className="pill pill--sm" href="/contact#form">
              Request a demo <ArrowRight className="i" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </article>
    ),
  };
});

export default function ClinicalApplicationsPage() {
  return (
    <main id="main">
      <SubHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Clinical Impact", href: "/clinical-applications" },
          { label: "Clinical Applications" },
        ]}
        tag="Clinical applications"
        title="Precision Guidance Across Multi-Disciplinary Surgeries"
        summary="Real-time ICG fluorescence gives surgeons objective information about perfusion, lymphatic drainage and critical anatomy. Explore how it supports decisions in each specialty, with references to the published literature."
      />

      <section className="section" id="specialties" aria-labelledby="spec-title">
        <div className="wrap">
          <h2 className="sr-only" id="spec-title">
            Specialties
          </h2>
          <TabSet items={items} label="Filter by specialty" className="tabs tabs--filter" hashSync />
          <p className="evidence-note reveal">
            <BookOpen className="i" aria-hidden="true" /> References are independent, peer-reviewed publications on ICG
            fluorescence imaging, provided for clinical education. They are not studies of Irillic systems unless stated.
            Links open a PubMed search for each title.
          </p>
        </div>
      </section>

      <CtaBand
        title="Discuss your specialty with our clinical team"
        text="We'll share specialty-specific protocols and arrange a demonstration on your cases."
        primary={{ label: "Request a demonstration", href: "/contact#form" }}
        secondary={{ label: "Clinical studies", href: "/clinical-resources#studies" }}
      />
    </main>
  );
}
