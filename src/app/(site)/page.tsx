import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Aperture,
  ArrowRight,
  ArrowUpRight,
  Download,
  Factory,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Counter } from "@/components/shared/counter";
import {
  HeroCarousel,
  type HeroSlide,
} from "@/components/shared/hero-carousel";
import { ValidatedForm } from "@/components/shared/validated-form";
import { getPublishedEntry } from "@/services/cms.service";
import { cmsMetadata } from "@/lib/cms-metadata";
import { applyGlobalContact, getBranding } from "@/lib/branding";
import {
  contactContentSchema,
  homeContentSchema,
} from "@/validations/public-content.validation";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata(await getPublishedEntry("page", "home"));
}
const pillarIcons = {
  aperture: Aperture,
  shield: ShieldCheck,
  factory: Factory,
  globe: Globe,
};

export default async function HomePage() {
  const [entry, contactEntry, branding] = await Promise.all([
    getPublishedEntry("page", "home"),
    getPublishedEntry("page", "contact"),
    getBranding(),
  ]);
  if (!entry || !contactEntry)
    throw new Error(
      "Published home/contact content is missing. Run the CMS seed.",
    );
  const content = homeContentSchema.parse(entry.content);
  const contactContent = contactContentSchema.parse(contactEntry.content);
  const contact = applyGlobalContact(contactContent.headquarters, branding);
  const mothersonHealth = contactContent.network[0]?.href;
  const careers = contactContent.network[1]?.href;
  if (!mothersonHealth || !careers)
    throw new Error("Home page network links are missing from CMS content.");
  const slides: HeroSlide[] = content.slides;
  return (
    <main id="main">
      {/* 1. Hero banner (full-bleed carousel) */}
      <HeroCarousel slides={slides} />

      {/* Corporate info bar (independent Motherson endorsement) */}
      <section
        className="endorse"
        aria-label={content.sections.endorsement.ariaLabel}
      >
        <div className="wrap endorse__inner">
          <p className="endorse__text">
            <span className="label">{content.sections.endorsement.label}</span>
            {content.sections.endorsement.text}
          </p>
          <Image
            className="endorse__mark"
            src={content.sections.endorsement.image}
            alt={content.sections.endorsement.imageAlt}
            width={2340}
            height={265}
            unoptimized
          />
          <a
            className="link-pill"
            href={mothersonHealth}
            target="_blank"
            rel="noopener"
          >
            {content.sections.endorsement.linkLabel}{" "}
            <ArrowUpRight className="i" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </section>

      {/* 2. Four-pillar corporate grid */}
      <section className="section" id="company" aria-labelledby="pillars-title">
        <div className="wrap">
          <header className="sec-head reveal">
            <p className="label">{content.sections.pillars.label}</p>
            <h2 className="h2" id="pillars-title">
              {content.sections.pillars.title}
              <span className="dot">.</span>
            </h2>
          </header>

          <div className="pillars">
            {content.pillars.map(({ num, icon, title, text, link }) => {
              const Icon = pillarIcons[icon];
              return (
                <article className="pillar reveal" key={num}>
                  <span className="pillar__num">{num}</span>
                  <Icon className="i pillar__icon" aria-hidden="true" />
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <a className="link" href={link.href}>
                    {link.label}{" "}
                    <ArrowUpRight className="i" aria-hidden="true" />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Annual-report style counters */}
      <section
        className="section section--canvas"
        id="performance"
        aria-labelledby="perf-title"
      >
        <div className="wrap">
          <div className="report reveal">
            <div className="report__intro">
              <p className="label">{content.sections.performance.label}</p>
              <h2 className="h2" id="perf-title">
                {content.sections.performance.title}
                <span className="dot">.</span>
              </h2>
              <p>{content.sections.performance.text}</p>
              <a className="pill" href={content.sections.performance.link.href}>
                {content.sections.performance.link.label}{" "}
                <Download className="i" aria-hidden="true" />
              </a>
            </div>
            <dl className="report__figures">
              {content.figures.map((f) => (
                <div className="figure" key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>
                    <Counter target={f.value} />
                    <span className="figure__unit">{f.unit}</span>
                  </dd>
                  <span className="figure__bar" aria-hidden="true">
                    <span style={{ "--w": "100%" } as React.CSSProperties} />
                  </span>
                  <p>{f.text}</p>
                </div>
              ))}
              <div className="figure">
                <dt>{content.sections.performance.certification.label}</dt>
                <dd>
                  <span className="figure__pre">
                    {content.sections.performance.certification.prefix}
                  </span>{" "}
                  <Counter
                    target={content.sections.performance.certification.value}
                    plain
                  />
                  <span className="figure__unit">
                    {content.sections.performance.certification.unit}
                  </span>
                </dd>
                <span className="figure__bar" aria-hidden="true">
                  <span style={{ "--w": "100%" } as React.CSSProperties} />
                </span>
                <p>{content.sections.performance.certification.text}</p>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* 4. Strategic division cards */}
      <section className="section" id="divisions" aria-labelledby="div-title">
        <div className="wrap">
          <header className="sec-head sec-head--split reveal">
            <div>
              <p className="label">{content.sections.divisions.label}</p>
              <h2 className="h2" id="div-title">
                {content.sections.divisions.title}
                <span className="dot">.</span>
              </h2>
            </div>
            <a
              className="link-pill"
              href={content.sections.divisions.link.href}
            >
              {content.sections.divisions.link.label}{" "}
              <ArrowUpRight className="i" aria-hidden="true" />
            </a>
          </header>

          <div className="divisions">
            {content.divisions.map((d) => (
              <a className="division reveal" href={d.href} key={d.title}>
                <span
                  className={
                    d.light
                      ? "division__img division__img--light"
                      : "division__img"
                  }
                >
                  <Image
                    src={d.image}
                    alt=""
                    width={d.size[0]}
                    height={d.size[1]}
                    unoptimized
                  />
                </span>
                <span className="division__body">
                  <span className="label">{d.label}</span>
                  <span className="division__title">{d.title}</span>
                  <span className="division__text">{d.text}</span>
                  <span className="division__foot">
                    {content.sections.divisions.itemLinkLabel}{" "}
                    <span className="circle-arrow">
                      <ArrowRight className="i" aria-hidden="true" />
                    </span>
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Clinical impact (case studies; illustrative content) */}
      <section
        className="section section--canvas"
        id="clinical-impact"
        aria-labelledby="ci-title"
      >
        <div className="wrap">
          <header className="sec-head sec-head--split reveal">
            <div>
              <p className="label">{content.sections.clinical.label}</p>
              <h2 className="h2" id="ci-title">
                {content.sections.clinical.title}
                <span className="dot">.</span>
              </h2>
            </div>
            <ul className="specialty-links">
              {content.specialtyLinks.map((s) => (
                <li key={s}>
                  <a href="#clinical-impact">
                    {s} <ArrowUpRight className="i" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </header>

          <div className="cases">
            {content.caseStudies.slice(-3).map((item) => (
              <article
                className={item.wide ? "case case--wide reveal" : "case reveal"}
                key={item.title}
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  width={800}
                  height={500}
                  unoptimized
                />
                <div className="case__body">
                  <p className="label">{item.label}</p>
                  <h3>{item.title}</h3>
                  {item.text ? <p>{item.text}</p> : null}
                  <a
                    className="link"
                    href={content.sections.clinical.itemLinkHref}
                  >
                    {content.sections.clinical.itemLinkLabel}{" "}
                    <ArrowRight className="i" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Investors & media (document cards + feature panels) */}
      <section className="section" id="media" aria-labelledby="media-title">
        <div className="wrap">
          <header className="sec-head sec-head--split reveal">
            <div>
              <p className="label">{content.sections.media.label}</p>
              <h2 className="h2" id="media-title">
                {content.sections.media.title}
                <span className="dot">.</span>
              </h2>
            </div>
            <Link
              className="pill pill--sm"
              href={content.sections.media.link.href}
            >
              {content.sections.media.link.label}{" "}
              <ArrowUpRight className="i" aria-hidden="true" />
            </Link>
          </header>

          <div className="docs">
            {content.documents.map((doc) => (
              <Link
                className="doc reveal"
                href={content.sections.media.documentHref}
                key={doc.title}
              >
                <span className="doc__cat">{doc.cat}</span>
                <span className="doc__title">{doc.title}</span>
                <span className="doc__meta">
                  {doc.format}{" "}
                  <span className="circle-arrow circle-arrow--red">
                    <Download className="i" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            ))}
          </div>

          <div className="panels">
            {content.mediaPanels.map((panel, index) => {
              const body = (
                <>
                  <Image
                    src={panel.image}
                    alt=""
                    width={800}
                    height={500}
                    unoptimized
                  />
                  <span className="panel__shade" aria-hidden="true" />
                  <span className="panel__body">
                    <span className="panel__title">{panel.title}</span>
                    <span
                      className={
                        index === 1 ? "tag-pill tag-pill--red" : "tag-pill"
                      }
                    >
                      {panel.tag}{" "}
                      <ArrowUpRight className="i" aria-hidden="true" />
                    </span>
                    {panel.external ? (
                      <span className="sr-only">(opens in a new tab)</span>
                    ) : null}
                  </span>
                </>
              );
              return panel.external ? (
                <a
                  className="panel reveal"
                  href={panel.href === "careers" ? careers : panel.href}
                  target="_blank"
                  rel="noopener"
                  key={panel.title}
                >
                  {body}
                </a>
              ) : (
                <Link
                  className="panel reveal"
                  href={panel.href}
                  key={panel.title}
                >
                  {body}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Global presence */}
      <section
        className="section section--canvas"
        id="global"
        aria-labelledby="global-title"
      >
        <div className="wrap">
          <div className="split reveal">
            <div className="split__media">
              <Image
                src={content.sections.global.image}
                alt={content.sections.global.imageAlt}
                width={900}
                height={500}
                unoptimized
              />
            </div>
            <div className="split__body">
              <p className="label">{content.sections.global.label}</p>
              <h2 className="h2" id="global-title">
                {content.sections.global.title}
                <span className="dot">.</span>
              </h2>
              <ul className="facts">
                {content.globalFacts.map((fact) => (
                  <li key={fact.label}>
                    <span>{fact.label}</span>
                    <strong>{fact.value}</strong>
                  </li>
                ))}
              </ul>
              <a className="pill" href={content.sections.global.link.href}>
                {content.sections.global.link.label}{" "}
                <ArrowRight className="i" aria-hidden="true" />
              </a>
            </div>
          </div>

          <a className="address-row reveal" href="#contact">
            <span>
              <span className="address-row__title">
                {content.sections.global.addressTitle}
              </span>
              <span className="address-row__text">
                {content.sections.global.addressText}
              </span>
            </span>
            <span className="address-row__arrow" aria-hidden="true">
              <span />
              <ArrowRight className="i" />
            </span>
          </a>
        </div>
      </section>

      {/* Contact */}
      <section className="section" id="contact" aria-labelledby="contact-title">
        <div className="wrap contact">
          <div className="contact__info reveal">
            <p className="label">{content.sections.contact.label}</p>
            <h2 className="h2" id="contact-title">
              {content.sections.contact.title}
              <span className="dot">.</span>
            </h2>
            <p>{content.sections.contact.text}</p>
            <ul className="contact__list">
              <li>
                <MapPin className="i" aria-hidden="true" />
                <span>
                  <strong>{contact.company}</strong>
                  {contact.address}
                </span>
              </li>
              <li>
                <Mail className="i" aria-hidden="true" />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              {contact.phone ? (
                <li>
                  <Phone className="i" aria-hidden="true" />
                  <a href={contact.phoneHref}>{contact.phone}</a>
                </li>
              ) : null}
            </ul>
          </div>

          <div className="contact__form-wrap reveal">
            <ValidatedForm
              id="contact-form"
              successId="contact-done"
              submitLabel={content.contactForm.submitLabel}
              successMessage={content.contactForm.successMessage}
              resetLabel={content.contactForm.resetLabel}
            >
              <div className="form__grid">
                <div className="field">
                  <label htmlFor="c-name">
                    {content.contactForm.nameLabel}
                  </label>
                  <input
                    id="c-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                  />
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field">
                  <label htmlFor="c-org">
                    {content.contactForm.organisationLabel}
                  </label>
                  <input
                    id="c-org"
                    name="organisation"
                    type="text"
                    autoComplete="organization"
                    required
                  />
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field">
                  <label htmlFor="c-email">
                    {content.contactForm.emailLabel}
                  </label>
                  <input
                    id="c-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field">
                  <label htmlFor="c-topic">
                    {content.contactForm.topicLabel}
                  </label>
                  <select id="c-topic" name="topic" required defaultValue="">
                    <option value="">
                      {content.contactForm.topicPlaceholder}
                    </option>
                    {content.contactForm.topics.map((topic) => (
                      <option key={topic}>{topic}</option>
                    ))}
                  </select>
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field field--full">
                  <label htmlFor="c-msg">
                    {content.contactForm.messageLabel}
                  </label>
                  <textarea
                    id="c-msg"
                    name="message"
                    rows={4}
                    required
                    minLength={10}
                    data-msg={content.contactForm.messageError}
                  />
                  <span className="field__err" aria-live="polite" />
                </div>
              </div>
              <label className="check">
                <input
                  type="checkbox"
                  name="consent"
                  id="c-consent"
                  required
                  data-msg={content.contactForm.consentError}
                />
                <span>{content.contactForm.consentText}</span>
              </label>
              <span
                className="field__err"
                id="c-consent-err"
                aria-live="polite"
              />
            </ValidatedForm>
          </div>
        </div>
      </section>
    </main>
  );
}
