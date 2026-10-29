import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Check,
  Cpu,
  Factory,
  Flag,
  Globe,
  ShieldCheck,
} from "lucide-react";
import { LeadersGrid } from "@/components/shared/leaders-grid";
import {
  CtaBand,
  SectionHead,
  SubHero,
} from "@/components/shared/page-sections";
import { SubNav } from "@/components/shared/sub-nav";
import { getPublishedEntry } from "@/services/cms.service";
import { cmsMetadata } from "@/lib/cms-metadata";
import { aboutContentSchema } from "@/validations/public-content.validation";
import { SmartLink } from "@/components/shared/smart-link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata(await getPublishedEntry("page", "about-us"));
}

const synergyIcons = { cpu: Cpu, factory: Factory, globe: Globe, award: Award };
const certificationIcons = {
  shield: ShieldCheck,
  check: Check,
  cpu: Cpu,
  flag: Flag,
};

const pad = (n: number) => String(n).padStart(2, "0");

export default async function AboutPage() {
  const entry = await getPublishedEntry("page", "about-us");
  if (!entry) throw new Error("Published About Us content is missing.");
  const content = aboutContentSchema.parse(entry.content);
  return (
    <main id="main">
      <SubHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Company", href: "/about-us" },
          { label: "About Us" },
        ]}
        tag={content.hero.tag}
        title={content.hero.title}
        summary={content.hero.summary}
        media={
          <Image
            src={content.hero.image}
            alt={content.hero.imageAlt}
            width={1920}
            height={1080}
            priority
            unoptimized
          />
        }
      />
      <SubNav items={content.navigation} />

      <section className="section" id="story" aria-labelledby="story-title">
        <div className="wrap">
          <div className="story">
            <div className="story__copy">
              <SectionHead
                label={content.story.label}
                title={content.story.title}
                id="story-title"
              />
              <p className="lead reveal">{content.story.paragraphs[0]}</p>
              <p className="reveal">{content.story.paragraphs[1]}</p>
            </div>
            <ol className="timeline reveal" aria-label="Milestones">
              {content.milestones.map((m, i) => (
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

      <section
        className="section section--canvas"
        id="identity"
        aria-labelledby="identity-title"
      >
        <div className="wrap">
          <SectionHead
            label={content.identity.label}
            title={content.identity.title}
            id="identity-title"
            text={content.identity.text}
          />
          <div className="identity reveal">
            <figure className="identity__logo">
              <Image
                src={content.identity.logo}
                alt={content.identity.logoAlt}
                width={473}
                height={139}
                unoptimized
              />
              <figcaption>{content.identity.caption}</figcaption>
            </figure>
            <ul className="identity__points">
              {content.identityPoints.map((p, i) => (
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
                src={content.synergyIntro.image}
                alt={content.synergyIntro.imageAlt}
                width={900}
                height={500}
                unoptimized
              />
            </div>
            <div className="synergy__copy">
              <SectionHead
                label={content.synergyIntro.label}
                title={content.synergyIntro.title}
                id="synergy-title"
              />
              <p className="reveal">{content.synergyIntro.text}</p>
              <div className="endorse-card reveal">
                <Image
                  src="/images/motherson/PTBPO_Motherson.png"
                  alt="Proud to be part of motherson"
                  width={2340}
                  height={265}
                  unoptimized
                />
                <SmartLink
                  className="link-pill"
                  href={content.mothersonHealthUrl}
                  target="_blank"
                  rel="noopener"
                >
                  {content.synergyIntro.linkLabel}{" "}
                  <ArrowUpRight className="i" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </SmartLink>
              </div>
            </div>
          </div>
          <div className="pillars pillars--compact">
            {content.synergy.map(({ icon, title, text }, i) => {
              const Icon = synergyIcons[icon];
              return (
                <article className="pillar reveal" key={title}>
                  <span className="pillar__num">{pad(i + 1)}</span>
                  <Icon className="i pillar__icon" aria-hidden="true" />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leadership profiles are shown by role. Add names and approved photographs from Irillic before go-live. */}
      <section
        className="section section--canvas"
        id="leadership"
        aria-labelledby="lead-title"
      >
        <div className="wrap">
          <SectionHead
            label={content.leadershipIntro.label}
            title={content.leadershipIntro.title}
            id="lead-title"
            text={content.leadershipIntro.text}
          />
          <LeadersGrid leaders={content.leaders} />
        </div>
      </section>

      <section className="section" id="quality" aria-labelledby="quality-title">
        <div className="wrap">
          <SectionHead
            label={content.qualityIntro.label}
            title={content.qualityIntro.title}
            id="quality-title"
            text={content.qualityIntro.text}
            aside={
              <Link
                className="pill pill--sm"
                href={content.qualityIntro.linkHref}
              >
                {content.qualityIntro.linkLabel}{" "}
                <ArrowRight className="i" aria-hidden="true" />
              </Link>
            }
          />
          <div className="certs">
            {content.certifications.map(({ icon, label, title, text }) => {
              const Icon = certificationIcons[icon];
              return (
                <article className="cert reveal" key={title}>
                  <span className="cert__badge">
                    <Icon className="i" aria-hidden="true" />
                  </span>
                  <p className="label">{label}</p>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <CtaBand
        title={content.cta.title}
        text={content.cta.text}
        primary={content.cta.primary}
        secondary={content.cta.secondary}
      />
    </main>
  );
}
