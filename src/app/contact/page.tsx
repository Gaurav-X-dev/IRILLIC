import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, BookOpen, Globe, Link2, Mail, MapPin, Phone, SlidersVertical, Users } from "lucide-react";
import { MapEmbed } from "@/components/shared/map-embed";
import { SectionHead, SubHero } from "@/components/shared/page-sections";
import { ValidatedForm } from "@/components/shared/validated-form";
import { CONTACT, EXTERNAL } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Request an OR demonstration or contact Irillic's Bangalore headquarters and the Motherson Health & Medical network.",
};

const NETWORK = [
  { icon: Globe, label: "Motherson Health & Medical", href: EXTERNAL.mothersonHealth },
  { icon: Users, label: "Careers at Motherson Health & Medical", href: EXTERNAL.careers },
  { icon: Link2, label: "Motherson Group", href: EXTERNAL.mothersonGroup },
];

const ENQUIRIES = [
  {
    icon: SlidersVertical,
    title: "Service & support",
    text: "Installation, maintenance and technical support for installed systems.",
    subject: "Service & support enquiry",
  },
  {
    icon: Users,
    title: "Partnerships & distribution",
    text: "Distribution, institutional and research partnerships.",
    subject: "Partnership & distribution enquiry",
  },
  {
    icon: BookOpen,
    title: "Media & communications",
    text: "Press, media kits and corporate communications.",
    subject: "Media enquiry",
  },
];

const DEPARTMENTS = [
  "Surgical Oncology",
  "Plastic & Reconstructive Surgery",
  "Gastrointestinal Surgery",
  "Urology",
  "Gynaecology",
  "General & Laparoscopic Surgery",
  "Neurosurgery",
  "Other",
];

const Req = () => (
  <span className="req" aria-hidden="true">
    *
  </span>
);

export default function ContactPage() {
  return (
    <main id="main">
      <SubHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        tag="Contact"
        title="Connect with Our Clinical Specialists"
        summary="Request a surgical demonstration in your OR, or reach our Bangalore headquarters for partnerships, service and media. We respond to every enquiry within one business day."
      />

      <section className="section section--tight" aria-label="Contact details and demonstration request">
        <div className="wrap contact-split">
          <div className="contact-split__info">
            <article className="hq reveal" id="hq">
              <p className="label">Corporate headquarters</p>
              <h2 className="hq__title">
                Bangalore, India<span className="dot">.</span>
              </h2>
              <ul className="contact__list">
                <li>
                  <MapPin className="i" aria-hidden="true" />
                  <span>
                    <strong>{CONTACT.company}</strong>
                    {CONTACT.address}
                  </span>
                </li>
                <li>
                  <Mail className="i" aria-hidden="true" />
                  <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                </li>
                <li>
                  <Phone className="i" aria-hidden="true" />
                  <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
                </li>
              </ul>
            </article>

            <MapEmbed />

            <article className="network reveal" id="network">
              <p className="label">Global network</p>
              <h2 className="hq__title">
                Motherson Health &amp; Medical<span className="dot">.</span>
              </h2>
              <p>
                As an enterprise of Motherson Health &amp; Medical, Irillic is connected to the Motherson Group&apos;s
                global engineering, manufacturing and supply network.
              </p>
              <ul className="network__links">
                {NETWORK.map(({ icon: Icon, label, href }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener">
                      <Icon className="i" aria-hidden="true" /> {label} <ArrowUpRight className="i" aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
              <Image
                className="network__mark"
                src="/images/motherson/PTBPO_Motherson.png"
                alt="Proud to be part of motherson"
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
              submitLabel="Request Demonstration"
              successMessage="Your demonstration request has been received. A clinical specialist will contact you within one business day to confirm the date and set-up."
              resetLabel="Submit another request"
            >
              <p className="label">OR demonstration</p>
              <h2 className="form__title">
                Request a Surgical Demonstration in Your OR<span className="dot">.</span>
              </h2>
              <p className="form__intro">
                Fields marked <Req />
                <span className="sr-only">with an asterisk</span> are required.
              </p>
              <div className="form__grid">
                <div className="field">
                  <label htmlFor="f-name">
                    Full name <Req />
                  </label>
                  <input id="f-name" name="name" type="text" autoComplete="name" required data-msg="Please enter your full name." />
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field">
                  <label htmlFor="f-hosp">
                    Hospital / Institution <Req />
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
                    Department / Specialty <Req />
                  </label>
                  <select id="f-dept" name="department" required defaultValue="" data-msg="Please select a department or specialty.">
                    <option value="">Select</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field">
                  <label htmlFor="f-city">
                    City / State <Req />
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
                    Work email <Req />
                  </label>
                  <input id="f-email" name="email" type="email" autoComplete="email" required data-msg="Please enter your work email." />
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field">
                  <label htmlFor="f-phone">
                    Phone <Req />
                  </label>
                  <input id="f-phone" name="phone" type="tel" autoComplete="tel" required data-msg="Please enter a phone number." />
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field">
                  <label htmlFor="f-date1">Preferred date</label>
                  <input id="f-date1" name="date_first" type="date" data-future="" />
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field">
                  <label htmlFor="f-date2">Alternative date</label>
                  <input id="f-date2" name="date_alternative" type="date" data-future="" />
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field field--full">
                  <label htmlFor="f-system">System of interest</label>
                  <select id="f-system" name="system" data-prefill="system" defaultValue="">
                    <option value="">Not sure yet</option>
                    <option value="nm">Irillic nm Fluorescence Imaging System</option>
                    <option value="lnm">Irillic L nm Laparoscopic Imaging System</option>
                    <option value="both">Both systems</option>
                  </select>
                </div>
                <div className="field field--full">
                  <label htmlFor="f-msg">Your clinical challenge</label>
                  <textarea
                    id="f-msg"
                    name="message"
                    rows={3}
                    placeholder="e.g. We want objective perfusion assessment in colorectal cases."
                  />
                </div>
              </div>
              <label className="check">
                <input type="checkbox" id="f-consent" name="consent" required data-msg="Please confirm consent so we can respond." />
                <span>
                  I agree that Irillic may use my details to arrange this demonstration, as described in the Privacy Policy.
                </span>
              </label>
              <span className="field__err" id="f-consent-err" aria-live="polite" />
            </ValidatedForm>
          </div>
        </div>
      </section>

      <section className="section section--canvas" id="enquiries" aria-labelledby="enq-title">
        <div className="wrap">
          <SectionHead label="Other enquiries" title="How can we help" id="enq-title" />
          <div className="enquiries">
            {ENQUIRIES.map(({ icon: Icon, title, text, subject }) => (
              <a className="enquiry reveal" href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}`} key={title}>
                <Icon className="i enquiry__icon" aria-hidden="true" />
                <strong>{title}</strong>
                <span>{text}</span>
                <em>
                  {CONTACT.email} <ArrowRight className="i" aria-hidden="true" />
                </em>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
