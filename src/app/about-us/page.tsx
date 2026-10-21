import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Award, Check, Cpu, Factory, Flag, Globe, ShieldCheck } from "lucide-react";
import { LeadersGrid } from "@/components/shared/leaders-grid";
import { CtaBand, SectionHead, SubHero } from "@/components/shared/page-sections";
import { SubNav } from "@/components/shared/sub-nav";
import { EXTERNAL } from "@/config/navigation";
import { LEADERS } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "About Irillic: our story, Vaastu-compliant identity, Motherson synergy, leadership and quality certifications.",
};

const MILESTONES = [
  { title: "The beginning", text: "An engineering team in Bengaluru sets out to make fluorescence-guided surgery accessible in India." },
  { title: "Open-surgery imaging", text: "The Irillic nm system brings handheld, real-time NIR fluorescence to the operating table." },
  { title: "Minimally invasive surgery", text: "The Irillic L nm system extends fluorescence guidance into laparoscopic workflows." },
  { title: "Part of Motherson", text: "Irillic becomes an enterprise of Motherson Health & Medical, gaining global engineering and manufacturing depth." },
  { title: "A new identity", text: "A bold, human-centric, Vaastu-compliant identity expresses who we are today." },
];

const IDENTITY_POINTS = [
  { title: "Original blue, retained", text: "Continuity with the Irillic heritage surgeons already know and trust." },
  { title: "Capital, bold letters", text: "A strong, confident visual impact that reads clearly in every setting." },
  { title: "Rounded corners", text: "Softness, humility and care for human values, at the heart of patient care." },
  { title: "The dot at the top right", text: "An optical sensor that establishes our relationship with imaging solutions." },
];

const SYNERGY = [
  { icon: Cpu, title: "World-class engineering", text: "Shared expertise in electronics, optics and precision mechanics across Motherson's engineering network." },
  { icon: Factory, title: "Precision manufacturing", text: "Manufacturing discipline and process control that scale from prototype to volume production." },
  { icon: Globe, title: "Global supply chains", text: "Resilient sourcing and logistics that keep systems, spares and consumables available." },
  { icon: Award, title: "Quality culture", text: "A group-wide commitment to quality that reinforces our medical-device QMS." },
];

/* Confirm the regulatory status shown below with Irillic's Quality & Regulatory team before publishing. */
const CERTS = [
  { icon: ShieldCheck, label: "Quality management", title: "ISO 13485:2016", text: "Certified quality management system for the design and manufacture of medical devices." },
  { icon: Check, label: "Regulatory", title: "CDSCO compliance", text: "Systems manufactured and supplied in line with India's Medical Devices Rules, overseen by CDSCO." },
  { icon: Cpu, label: "Innovation support", title: "BIRAC", text: "Innovation supported by the Biotechnology Industry Research Assistance Council." },
  { icon: Flag, label: "Indigenous design", title: "Make in India", text: "Designed, engineered and manufactured in Bengaluru for India and the world." },
];

const pad = (n: number) => String(n).padStart(2, "0");

export default function AboutPage() {
  return (
    <main id="main">
      <SubHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Company", href: "/about-us" }, { label: "About Us" }]}
        tag="Company"
        title="Pioneering Optical Precision in Surgical Care"
        summary="Irillic designs and manufactures ICG fluorescence and laparoscopic imaging systems that let surgeons see perfusion, vessels and lymphatics in real time. As an enterprise of Motherson Health & Medical, we pair Indian engineering with the scale and quality culture of a global group."
        media={
          <Image
            src="/images/theme/hero-3-precision-optics.svg"
            alt="Close-up of a precision optical lens"
            width={1920}
            height={1080}
            priority
            unoptimized
          />
        }
      />
      <SubNav
        items={[
          { id: "story", label: "Our Story" },
          { id: "identity", label: "Our Identity" },
          { id: "synergy", label: "Motherson Synergy" },
          { id: "leadership", label: "Leadership" },
          { id: "quality", label: "Quality & Certifications" },
        ]}
      />

      <section className="section" id="story" aria-labelledby="story-title">
        <div className="wrap">
          <div className="story">
            <div className="story__copy">
              <SectionHead label="Our story" title="From an idea in Bengaluru to operating rooms across India" id="story-title" />
              <p className="lead reveal">
                Irillic began with a simple conviction: every surgeon in India should be able to see what fluorescence
                imaging reveals, without the cost and complexity that kept it out of reach.
              </p>
              <p className="reveal">
                Our engineers built near-infrared optics, imaging sensors and software in-house, then worked side by side
                with surgeons to turn them into systems that fit naturally into real operating rooms. Today Irillic
                supports open and minimally invasive surgery across oncology, reconstruction, gastrointestinal, urological
                and gynaecological procedures.
              </p>
            </div>
            <ol className="timeline reveal" aria-label="Milestones">
              {MILESTONES.map((m, i) => (
                <li key={m.title}>
                  <span className="timeline__step">{pad(i + 1)}</span>
                  <div>
                    <strong>{m.title}</strong>
                    <p>{m.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section section--canvas" id="identity" aria-labelledby="identity-title">
        <div className="wrap">
          <SectionHead
            label="Our identity"
            title="A Vaastu-compliant identity built on human values"
            id="identity-title"
            text="Our refreshed logo was designed to be Vaastu compliant while keeping everything that made Irillic recognisable, and to say more about how we care for patients and surgeons."
          />
          <div className="identity reveal">
            <figure className="identity__logo">
              <Image
                src="/images/logo/irillic-logo-blue.png"
                alt="The Irillic logo: bold capital letters with rounded corners and a dot at the top right"
                width={473}
                height={139}
                unoptimized
              />
              <figcaption>Irillic Blue · #0091D0 · RGB 0 145 208 · CMYK 80 30 0 0</figcaption>
            </figure>
            <ul className="identity__points">
              {IDENTITY_POINTS.map((p, i) => (
                <li key={p.title}>
                  <span>{pad(i + 1)}</span>
                  <div>
                    <strong>{p.title}</strong>
                    <p>{p.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section" id="synergy" aria-labelledby="synergy-title">
        <div className="wrap">
          <div className="synergy">
            <div className="synergy__media reveal">
              <Image
                src="/images/theme/global-network.svg"
                alt="Abstract map with connections radiating from Bengaluru"
                width={900}
                height={500}
                unoptimized
              />
            </div>
            <div className="synergy__copy">
              <SectionHead
                label="The Motherson synergy"
                title="The reach of a global group. The focus of a specialist"
                id="synergy-title"
              />
              <p className="reveal">
                Being part of Samvardhana Motherson Group gives Irillic access to world-class engineering, precision
                manufacturing and global supply chains, so our surgical systems are built with the rigour expected of a
                global industrial leader.
              </p>
              <div className="endorse-card reveal">
                <Image
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
            </div>
          </div>
          <div className="pillars pillars--compact">
            {SYNERGY.map(({ icon: Icon, title, text }, i) => (
              <article className="pillar reveal" key={title}>
                <span className="pillar__num">{pad(i + 1)}</span>
                <Icon className="i pillar__icon" aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership profiles are shown by role. Add names and approved photographs from Irillic before go-live. */}
      <section className="section section--canvas" id="leadership" aria-labelledby="lead-title">
        <div className="wrap">
          <SectionHead
            label="Leadership"
            title="Leadership & Scientific Advisory Board"
            id="lead-title"
            text="Engineers, clinicians and quality specialists who guide how Irillic designs, validates and supports every system."
          />
          <LeadersGrid leaders={LEADERS} />
        </div>
      </section>

      <section className="section" id="quality" aria-labelledby="quality-title">
        <div className="wrap">
          <SectionHead
            label="Quality & certifications"
            title="Built to medical-device standards"
            id="quality-title"
            text="Quality is designed into every Irillic system, from component sourcing to post-market support."
            aside={
              <Link className="pill pill--sm" href="/clinical-resources#ifu">
                Technical documentation <ArrowRight className="i" aria-hidden="true" />
              </Link>
            }
          />
          <div className="certs">
            {CERTS.map(({ icon: Icon, label, title, text }) => (
              <article className="cert reveal" key={title}>
                <span className="cert__badge">
                  <Icon className="i" aria-hidden="true" />
                </span>
                <p className="label">{label}</p>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Partner with Irillic"
        text="Whether you are a hospital, distributor or research institution, our team would like to hear from you."
        primary={{ label: "Contact our team", href: "/contact" }}
        secondary={{ label: "Clinical resources", href: "/clinical-resources" }}
      />
    </main>
  );
}
