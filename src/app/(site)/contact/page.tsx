import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Globe,
  Link2,
  Mail,
  MapPin,
  Phone,
  SlidersVertical,
  Users,
} from "lucide-react";
import { MapEmbed } from "@/components/shared/map-embed";
import { SectionHead, SubHero } from "@/components/shared/page-sections";
import { ValidatedForm } from "@/components/shared/validated-form";
import { getPublishedEntry } from "@/services/cms.service";
import { cmsMetadata } from "@/lib/cms-metadata";
import { applyGlobalContact, getBranding } from "@/lib/branding";
import { contactContentSchema } from "@/validations/public-content.validation";
import { SmartLink } from "@/components/shared/smart-link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata(await getPublishedEntry("page", "contact"));
}

const networkIcons = { globe: Globe, users: Users, link: Link2 };
const enquiryIcons = { sliders: SlidersVertical, users: Users, book: BookOpen };

const Req = () => (
  <span className="req" aria-hidden="true">
    *
  </span>
);

export default async function ContactPage() {
  const [entry, branding] = await Promise.all([
    getPublishedEntry("page", "contact"),
    getBranding(),
  ]);
  if (!entry) throw new Error("Published contact content is missing.");
  const content = contactContentSchema.parse(entry.content);
  const contact = applyGlobalContact(content.headquarters, branding);
  const fields = content.pageCopy.formFields;
  return (
    <main id="main">
      <SubHero
        crumbs={content.pageCopy.breadcrumbs}
        tag={content.pageCopy.hero.tag}
        title={content.pageCopy.hero.title}
        summary={content.pageCopy.hero.summary}
      />

      <section
        className="section section--tight"
        aria-label={content.pageCopy.sectionAriaLabel}
      >
        <div className="wrap contact-split">
          <div className="contact-split__info">
            <article className="hq reveal" id="hq">
              <p className="label">{content.pageCopy.headquartersLabel}</p>
              <h2 className="hq__title">
                {content.pageCopy.headquartersTitle}
                <span className="dot">.</span>
              </h2>
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
                  <SmartLink href={`mailto:${contact.email}`}>{contact.email}</SmartLink>
                </li>
                {contact.phone ? (
                  <li>
                    <Phone className="i" aria-hidden="true" />
                    <SmartLink href={contact.phoneHref}>{contact.phone}</SmartLink>
                  </li>
                ) : null}
              </ul>
            </article>

            <MapEmbed query={contact.address} label={contact.company} />

            <article className="network reveal" id="network">
              <p className="label">{content.pageCopy.network.label}</p>
              <h2 className="hq__title">
                {content.pageCopy.network.title}
                <span className="dot">.</span>
              </h2>
              <p>{content.pageCopy.network.text}</p>
              <ul className="network__links">
                {content.network.map(({ icon, label, href }) => {
                  const Icon = networkIcons[icon];
                  return (
                    <li key={label}>
                      <SmartLink href={href} target="_blank" rel="noopener">
                        <Icon className="i" aria-hidden="true" /> {label}{" "}
                        <ArrowUpRight className="i" aria-hidden="true" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </SmartLink>
                    </li>
                  );
                })}
              </ul>
              <Image
                className="network__mark"
                src={content.pageCopy.network.image}
                alt={content.pageCopy.network.imageAlt}
                width={2340}
                height={265}
                unoptimized
              />
            </article>
          </div>

          <div className="contact-split__form reveal" id="form">
            <ValidatedForm
              id="demo-form"
              successId="demo-done"
              submitLabel={content.pageCopy.form.submitLabel}
              successMessage={content.pageCopy.form.successMessage}
              resetLabel={content.pageCopy.form.resetLabel}
            >
              <p className="label">{content.pageCopy.form.label}</p>
              <h2 className="form__title">
                {content.pageCopy.form.title}
                <span className="dot">.</span>
              </h2>
              <p className="form__intro">
                {content.pageCopy.requiredIntro} <Req />
                <span className="sr-only">
                  {content.pageCopy.requiredSuffix}
                </span>
              </p>
              <div className="form__grid">
                <div className="field">
                  <label htmlFor="f-name">
                    {fields.name} <Req />
                  </label>
                  <input
                    id="f-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    data-msg="Please enter your full name."
                  />
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field">
                  <label htmlFor="f-hosp">
                    {fields.hospital} <Req />
                  </label>
                  <input
                    id="f-hosp"
                    name="hospital"
                    type="text"
                    autoComplete="organization"
                    required
                    data-msg="Please enter your hospital or institution."
                  />
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field">
                  <label htmlFor="f-dept">
                    {fields.department} <Req />
                  </label>
                  <select
                    id="f-dept"
                    name="department"
                    required
                    defaultValue=""
                    data-msg="Please select a department or specialty."
                  >
                    <option value="">{fields.select}</option>
                    {content.departments.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field">
                  <label htmlFor="f-city">
                    {fields.city} <Req />
                  </label>
                  <input
                    id="f-city"
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    required
                    data-msg="Please enter your city and state."
                  />
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field">
                  <label htmlFor="f-email">
                    {fields.email} <Req />
                  </label>
                  <input
                    id="f-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    data-msg="Please enter your work email."
                  />
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field">
                  <label htmlFor="f-phone">
                    {fields.phone} <Req />
                  </label>
                  <input
                    id="f-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    data-msg="Please enter a phone number."
                  />
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field">
                  <label htmlFor="f-date1">{fields.preferredDate}</label>
                  <input
                    id="f-date1"
                    name="date_first"
                    type="date"
                    data-future=""
                  />
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field">
                  <label htmlFor="f-date2">{fields.alternativeDate}</label>
                  <input
                    id="f-date2"
                    name="date_alternative"
                    type="date"
                    data-future=""
                  />
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field field--full">
                  <label htmlFor="f-system">{fields.system}</label>
                  <select
                    id="f-system"
                    name="system"
                    data-prefill="system"
                    defaultValue=""
                  >
                    <option value="">{fields.unsure}</option>
                    {content.pageCopy.systemOptions.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field field--full">
                  <label htmlFor="f-msg">{fields.message}</label>
                  <textarea
                    id="f-msg"
                    name="message"
                    rows={3}
                    placeholder={fields.messagePlaceholder}
                  />
                </div>
              </div>
              <label className="check">
                <input
                  type="checkbox"
                  id="f-consent"
                  name="consent"
                  required
                  data-msg="Please confirm consent so we can respond."
                />
                <span>{fields.consent}</span>
              </label>
              <span
                className="field__err"
                id="f-consent-err"
                aria-live="polite"
              />
            </ValidatedForm>
          </div>
        </div>
      </section>

      <section
        className="section section--canvas"
        id="enquiries"
        aria-labelledby="enq-title"
      >
        <div className="wrap">
          <SectionHead
            label={content.pageCopy.enquiries.label}
            title={content.pageCopy.enquiries.title}
            id="enq-title"
          />
          <div className="enquiries">
            {content.enquiries.map(({ icon, title, text, subject }) => {
              const Icon = enquiryIcons[icon];
              return (
                <SmartLink
                  className="enquiry reveal"
                  href={`mailto:${contact.email}?subject=${encodeURIComponent(subject)}`}
                  key={title}
                >
                  <Icon className="i enquiry__icon" aria-hidden="true" />
                  <strong>{title}</strong>
                  <span>{text}</span>
                  <em>
                    {contact.email}{" "}
                    <ArrowRight className="i" aria-hidden="true" />
                  </em>
                </SmartLink>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
