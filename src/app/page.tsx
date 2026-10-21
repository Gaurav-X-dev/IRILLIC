import Image from "next/image";
import Link from "next/link";
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
import { HeroCarousel, type HeroSlide } from "@/components/shared/hero-carousel";
import { ValidatedForm } from "@/components/shared/validated-form";
import { CONTACT, EXTERNAL } from "@/config/navigation";

const SLIDES: HeroSlide[] = [
  {
    kicker: "Optical surgical imaging. Designed and made in India.",
    title: "A Global Pioneer in Optical Surgical Imaging",
    text: "Irillic gives surgeons real-time sight of perfusion, vessels and lymphatics through ICG fluorescence and laparoscopic imaging systems, engineered in Bengaluru.",
    cta: { label: "Explore our systems", href: "#divisions" },
    image: "/images/theme/hero-1-operating-room.svg",
    tab: "01 Pioneer",
    tabLabel: "Slide 1: Global pioneer",
  },
  {
    kicker: "ICG fluorescence imaging",
    title: "Seeing the unseen. In real time",
    text: "Radiation-free guidance for sentinel lymph node mapping and tissue perfusion assessment, overlaid live on the surgical view.",
    cta: { label: "See clinical impact", href: "#clinical-impact" },
    image: "/images/theme/hero-2-fluorescence.svg",
    tab: "02 Fluorescence",
    tabLabel: "Slide 2: Fluorescence",
  },
  {
    kicker: "Precision optics",
    title: "Engineered in India. Built for every operating room",
    text: "In-house optics, imaging and software, made under an ISO 13485:2016 certified quality management system.",
    cta: { label: "Our pillars", href: "#company" },
    image: "/images/theme/hero-3-precision-optics.svg",
    tab: "03 Optics",
    tabLabel: "Slide 3: Precision optics",
  },
];

const PILLARS = [
  {
    num: "01",
    icon: Aperture,
    title: "Precision Optics",
    text: "Near-infrared optics, sensors and image processing developed in-house for ultra-sensitive, real-time fluorescence detection.",
    link: { label: "Our technology", href: "#divisions" },
  },
  {
    num: "02",
    icon: ShieldCheck,
    title: "Patient Safety",
    text: "Radiation-free ICG guidance with no radioisotopes or nuclear medicine logistics. It's safer for patients and OR teams alike.",
    link: { label: "Clinical impact", href: "#clinical-impact" },
  },
  {
    num: "03",
    icon: Factory,
    title: "Make in India",
    text: "Indigenously engineered and manufactured in Bengaluru with BIRAC support, making advanced surgical imaging accessible.",
    link: { label: "Our presence", href: "#global" },
  },
  {
    num: "04",
    icon: Globe,
    title: "Global Regulatory Compliance",
    text: "An ISO 13485:2016 certified quality management system governing design, manufacture and post-market support.",
    link: { label: "Quality & policies", href: "#media" },
  },
];

/* Figures supplied by Irillic; confirm before publishing. */
const FIGURES = [
  {
    label: "Procedures supported",
    value: <Counter target={5000} />,
    unit: "+",
    text: "Open and minimally invasive procedures performed with Irillic fluorescence imaging.",
  },
  {
    label: "Surgical centres",
    value: <Counter target={300} />,
    unit: "+",
    text: "Hospitals and surgical centres equipped with Irillic systems and trained teams.",
  },
];

const DIVISIONS = [
  {
    label: "Division 01 · Open Surgery",
    title: "Irillic nm Fluorescence Imaging System",
    text: "Handheld open-surgery imaging with a real-time NIR camera and ultra-sensitive ICG detection.",
    image: "/images/theme/division-open-surgery.svg",
    size: [600, 450],
    light: true,
    href: "#contact",
  },
  {
    label: "Division 02 · Minimally Invasive",
    title: "Irillic L nm Laparoscopic Imaging System",
    text: "Full HD fluorescence overlay integrated into the endoscopic surgical workflow.",
    image: "/images/theme/division-minimally-invasive.svg",
    size: [600, 450],
    light: true,
    href: "#contact",
  },
  {
    label: "Division 03 · Education",
    title: "Clinical Education & Training",
    text: "Structured programmes that help surgical teams build confident, repeatable ICG workflows.",
    image: "/images/theme/division-training.svg",
    size: [800, 500],
    light: false,
    href: "#clinical-impact",
  },
  {
    label: "Division 04 · Service",
    title: "Service & Lifecycle Support",
    text: "Installation, preventive maintenance and on-site support that keep systems OR-ready.",
    image: "/images/theme/division-service.svg",
    size: [800, 500],
    light: false,
    href: "#global",
  },
];

const SPECIALTY_LINKS = ["Surgical Oncology", "Plastic & Reconstructive", "Gastrointestinal", "Urology & Gynaecology"];

const DOCS = [
  { cat: "Product literature", title: "Irillic nm: Instructions for Use", format: "PDF" },
  { cat: "Product literature", title: "Irillic L nm: Instructions for Use", format: "PDF" },
  { cat: "Corporate", title: "Irillic Corporate Brochure", format: "PDF" },
  { cat: "Media", title: "Media Kit & Brand Assets", format: "ZIP" },
];

export default function HomePage() {
  return (
    <main id="main">
      {/* 1. Hero banner (full-bleed carousel) */}
      <HeroCarousel slides={SLIDES} />

      {/* Corporate info bar (independent Motherson endorsement) */}
      <section className="endorse" aria-label="Group affiliation">
        <div className="wrap endorse__inner">
          <p className="endorse__text">
            <span className="label">An enterprise of Motherson Health &amp; Medical</span>
            Irillic brings the engineering depth, quality culture and global reach of the Motherson Group to surgical
            imaging.
          </p>
          <Image
            className="endorse__mark"
            src="/images/motherson/PTBPO_Motherson.png"
            alt="Proud to be part of motherson"
            width={2340}
            height={265}
            unoptimized
          />
          <a className="link-pill" href={EXTERNAL.mothersonHealth} target="_blank" rel="noopener">
            Motherson Health &amp; Medical <ArrowUpRight className="i" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </section>

      {/* 2. Four-pillar corporate grid */}
      <section className="section" id="company" aria-labelledby="pillars-title">
        <div className="wrap">
          <header className="sec-head reveal">
            <p className="label">What defines us</p>
            <h2 className="h2" id="pillars-title">
              Four pillars of surgical imaging leadership<span className="dot">.</span>
            </h2>
          </header>

          <div className="pillars">
            {PILLARS.map(({ num, icon: Icon, title, text, link }) => (
              <article className="pillar reveal" key={num}>
                <span className="pillar__num">{num}</span>
                <Icon className="i pillar__icon" aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
                <a className="link" href={link.href}>
                  {link.label} <ArrowUpRight className="i" aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Annual-report style counters */}
      <section className="section section--canvas" id="performance" aria-labelledby="perf-title">
        <div className="wrap">
          <div className="report reveal">
            <div className="report__intro">
              <p className="label">Performance at a glance</p>
              <h2 className="h2" id="perf-title">
                Measured in outcomes<span className="dot">.</span>
              </h2>
              <p>Every figure represents a surgical team that saw more, and a patient who benefited from it.</p>
              <a className="pill" href="#media">
                Corporate brochure <Download className="i" aria-hidden="true" />
              </a>
            </div>
            <dl className="report__figures">
              {FIGURES.map((f) => (
                <div className="figure" key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>
                    {f.value}
                    <span className="figure__unit">{f.unit}</span>
                  </dd>
                  <span className="figure__bar" aria-hidden="true">
                    <span style={{ "--w": "100%" } as React.CSSProperties} />
                  </span>
                  <p>{f.text}</p>
                </div>
              ))}
              <div className="figure">
                <dt>Quality certified</dt>
                <dd>
                  <span className="figure__pre">ISO</span> <Counter target={13485} plain />
                  <span className="figure__unit">:2016</span>
                </dd>
                <span className="figure__bar" aria-hidden="true">
                  <span style={{ "--w": "100%" } as React.CSSProperties} />
                </span>
                <p>Certified quality management system for the design and manufacture of medical devices.</p>
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
              <p className="label">Strategic divisions</p>
              <h2 className="h2" id="div-title">
                Four divisions. One purpose: to see more in surgery<span className="dot">.</span>
              </h2>
            </div>
            <a className="link-pill" href="#contact">
              Request an OR demonstration <ArrowUpRight className="i" aria-hidden="true" />
            </a>
          </header>

          <div className="divisions">
            {DIVISIONS.map((d) => (
              <a className="division reveal" href={d.href} key={d.title}>
                <span className={d.light ? "division__img division__img--light" : "division__img"}>
                  <Image src={d.image} alt="" width={d.size[0]} height={d.size[1]} unoptimized />
                </span>
                <span className="division__body">
                  <span className="label">{d.label}</span>
                  <span className="division__title">{d.title}</span>
                  <span className="division__text">{d.text}</span>
                  <span className="division__foot">
                    Explore division{" "}
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
      <section className="section section--canvas" id="clinical-impact" aria-labelledby="ci-title">
        <div className="wrap">
          <header className="sec-head sec-head--split reveal">
            <div>
              <p className="label">Clinical impact</p>
              <h2 className="h2" id="ci-title">
                Evidence from the operating room<span className="dot">.</span>
              </h2>
            </div>
            <ul className="specialty-links">
              {SPECIALTY_LINKS.map((s) => (
                <li key={s}>
                  <a href="#clinical-impact">
                    {s} <ArrowUpRight className="i" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </header>

          <div className="cases">
            <article className="case case--wide reveal">
              <Image
                src="/images/theme/case-sentinel-node.svg"
                alt="Fluorescence image of lymphatic channels draining to a sentinel lymph node"
                width={800}
                height={500}
                unoptimized
              />
              <div className="case__body">
                <p className="label">Surgical Oncology · Case study</p>
                <h3>Radiation-free sentinel node mapping in early breast cancer</h3>
                <p>
                  ICG fluorescence visualises lymphatic channels and sentinel nodes in real time, without radioisotopes or a
                  nuclear medicine slot.
                </p>
                <a className="link" href="#contact">
                  Read case study <ArrowRight className="i" aria-hidden="true" />
                </a>
              </div>
            </article>
            <article className="case reveal">
              <Image
                src="/images/theme/case-perfusion.svg"
                alt="Fluorescence perfusion image of a bowel segment with a demarcation line"
                width={800}
                height={500}
                unoptimized
              />
              <div className="case__body">
                <p className="label">Gastrointestinal</p>
                <h3>Perfusion assessment before colorectal anastomosis</h3>
                <a className="link" href="#contact">
                  Read case study <ArrowRight className="i" aria-hidden="true" />
                </a>
              </div>
            </article>
            <article className="case reveal">
              <Image
                src="/images/theme/case-laparoscopic.svg"
                alt="Laparoscopic view with fluorescence overlay"
                width={800}
                height={500}
                unoptimized
              />
              <div className="case__body">
                <p className="label">Minimally Invasive</p>
                <h3>Fluorescence overlay in laparoscopic surgery</h3>
                <a className="link" href="#contact">
                  Read case study <ArrowRight className="i" aria-hidden="true" />
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Investors & media (document cards + feature panels) */}
      <section className="section" id="media" aria-labelledby="media-title">
        <div className="wrap">
          <header className="sec-head sec-head--split reveal">
            <div>
              <p className="label">Investors &amp; Media</p>
              <h2 className="h2" id="media-title">
                Company updates &amp; literature<span className="dot">.</span>
              </h2>
            </div>
            <Link className="pill pill--sm" href="/clinical-resources">
              More downloads <ArrowUpRight className="i" aria-hidden="true" />
            </Link>
          </header>

          <div className="docs">
            {DOCS.map((doc) => (
              <Link className="doc reveal" href="/clinical-resources#ifu" key={doc.title}>
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
            <Link className="panel reveal" href="/about-us#quality">
              <Image src="/images/theme/panel-sustainability.svg" alt="" width={800} height={500} unoptimized />
              <span className="panel__shade" aria-hidden="true" />
              <span className="panel__body">
                <span className="panel__title">Our ESG ambition</span>
                <span className="tag-pill">
                  Sustainability <ArrowUpRight className="i" aria-hidden="true" />
                </span>
              </span>
            </Link>
            <a className="panel reveal" href={EXTERNAL.careers} target="_blank" rel="noopener">
              <Image src="/images/theme/panel-people.svg" alt="" width={800} height={500} unoptimized />
              <span className="panel__shade" aria-hidden="true" />
              <span className="panel__body">
                <span className="panel__title">The Irillic Way</span>
                <span className="tag-pill tag-pill--red">
                  Join us <ArrowUpRight className="i" aria-hidden="true" />
                </span>
                <span className="sr-only">(opens in a new tab)</span>
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Global presence */}
      <section className="section section--canvas" id="global" aria-labelledby="global-title">
        <div className="wrap">
          <div className="split reveal">
            <div className="split__media">
              <Image
                src="/images/theme/global-network.svg"
                alt="Abstract map with connections radiating from Bengaluru"
                width={900}
                height={500}
                unoptimized
              />
            </div>
            <div className="split__body">
              <p className="label">Global presence</p>
              <h2 className="h2" id="global-title">
                Headquartered in Bengaluru. Connected through Motherson<span className="dot">.</span>
              </h2>
              <ul className="facts">
                <li>
                  <span>Corporate headquarters</span>
                  <strong>Bengaluru, India</strong>
                </li>
                <li>
                  <span>Quality system</span>
                  <strong>ISO 13485:2016</strong>
                </li>
                <li>
                  <span>Group network</span>
                  <strong>Motherson Health &amp; Medical</strong>
                </li>
              </ul>
              <a className="pill" href="#contact">
                Partner with us <ArrowRight className="i" aria-hidden="true" />
              </a>
            </div>
          </div>

          <a className="address-row reveal" href="#contact">
            <span>
              <span className="address-row__title">Looking for a specific Irillic contact?</span>
              <span className="address-row__text">Find our corporate office, sales and service details.</span>
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
            <p className="label">Contact</p>
            <h2 className="h2" id="contact-title">
              Let&apos;s talk surgical imaging<span className="dot">.</span>
            </h2>
            <p>
              For OR demonstrations, partnerships, media or service enquiries, our team will route your message to the right
              specialist.
            </p>
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
          </div>

          <div className="contact__form-wrap reveal">
            <ValidatedForm
              id="contact-form"
              successId="contact-done"
              submitLabel="Send enquiry"
              successMessage="Your enquiry has been received. A member of the Irillic team will respond within one business day."
              resetLabel="Send another enquiry"
            >
              <div className="form__grid">
                <div className="field">
                  <label htmlFor="c-name">Full name</label>
                  <input id="c-name" name="name" type="text" autoComplete="name" required />
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field">
                  <label htmlFor="c-org">Organisation</label>
                  <input id="c-org" name="organisation" type="text" autoComplete="organization" required />
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field">
                  <label htmlFor="c-email">Email</label>
                  <input id="c-email" name="email" type="email" autoComplete="email" required />
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field">
                  <label htmlFor="c-topic">Enquiry type</label>
                  <select id="c-topic" name="topic" required defaultValue="">
                    <option value="">Select</option>
                    <option>OR demonstration</option>
                    <option>Partnership &amp; distribution</option>
                    <option>Service &amp; support</option>
                    <option>Media enquiry</option>
                    <option>Other</option>
                  </select>
                  <span className="field__err" aria-live="polite" />
                </div>
                <div className="field field--full">
                  <label htmlFor="c-msg">Message</label>
                  <textarea
                    id="c-msg"
                    name="message"
                    rows={4}
                    required
                    minLength={10}
                    data-msg="Please add a short message (at least 10 characters)."
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
                  data-msg="Please confirm consent so we can respond."
                />
                <span>
                  I agree that Irillic may use my details to respond to this enquiry, as described in the Privacy Policy.
                </span>
              </label>
              <span className="field__err" id="c-consent-err" aria-live="polite" />
            </ValidatedForm>
          </div>
        </div>
      </section>
    </main>
  );
}
