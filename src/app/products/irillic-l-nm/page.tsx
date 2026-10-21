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
import { Breadcrumbs, CtaBand, SectionHead } from "@/components/shared/page-sections";
import { ProductGallery } from "@/components/shared/product-gallery";
import { SubNav } from "@/components/shared/sub-nav";
import { TabSet, type TabItem } from "@/components/shared/tab-set";

export const metadata: Metadata = {
  title: "Irillic L nm Laparoscopic Imaging System",
  description:
    "Irillic L nm: 4K NIR laparoscopic fluorescence imaging with dual-mode overlay, clinical workflow, OR compatibility and documentation.",
};

/* Specification values are presentation copy: confirm against the Irillic L nm datasheet before publishing. */
const SPEC_TABS: { id: string; icon: typeof Aperture; label: string; title: string; intro: string; notice?: string; rows: [string, string][] }[] = [
  {
    id: "optical",
    icon: Aperture,
    label: "Optical Performance",
    title: "Optical Performance",
    intro: "4K white-light imaging with a dedicated near-infrared channel delivers a crisp laparoscopic view and a clear fluorescence signal.",
    rows: [
      ["White-light imaging", "4K UHD"],
      ["Fluorescence channel", "Near-infrared, optimised for ICG"],
      ["Excitation", "~800 nm NIR"],
      ["Detection", "~830 nm NIR emission band"],
      ["Display modes", "White light · NIR overlay (green) · Monochrome NIR"],
      ["Overlay", "Real-time, fused on the surgical view"],
    ],
  },
  {
    id: "camera",
    icon: Eye,
    label: "Camera & Light Source",
    title: "Camera & Light Source",
    intro: "A lightweight camera head and combined light source put fluorescence control in the surgeon's hand.",
    rows: [
      ["Camera head", "Ergonomic, lightweight, with on-head controls"],
      ["Mode switching", "From the camera head or console"],
      ["Light source", "Combined white-light LED and NIR excitation"],
      ["Laparoscope", "NIR-capable optics, per system configuration"],
      ["Video output", "Digital output to OR displays and recorders"],
      ["Capture", "Still image and video recording"],
    ],
  },
  {
    id: "ergonomics",
    icon: SlidersVertical,
    label: "Ergonomics & OR Integration",
    title: "Ergonomics & OR Integration",
    intro: "Built to work with the equipment already in your theatre, with minimal set-up time for the team.",
    rows: [
      ["Configuration", "Tower with camera control unit and light source"],
      ["Stack compatibility", "Standard laparoscopy towers and monitors"],
      ["Mounting", "Surgical booms and pendants"],
      ["Set-up", "Plug-and-play connection to existing displays"],
      ["Footprint", "Compact, fits standard OR layouts"],
      ["Training", "On-site onboarding for surgeons and OR staff"],
    ],
  },
  {
    id: "sterilization",
    icon: Droplet,
    label: "Sterilization Guidelines",
    title: "Sterilization Guidelines",
    intro: "Reprocess every component only with the methods validated in the Irillic L nm Instructions for Use.",
    notice: "Always follow the current Instructions for Use for validated cleaning, disinfection and sterilization methods.",
    rows: [
      ["Laparoscope", "Validated sterilization methods as listed in the IFU"],
      ["Camera head & cable", "Validated low-temperature reprocessing, as listed in the IFU"],
      ["Light cable", "Cleaning and sterilization per IFU"],
      ["Console & light source", "Non-sterile; surface cleaning and disinfection"],
      ["Inspection", "Check optics and cables before every procedure"],
      ["Documentation", "Reprocessing records per hospital protocol"],
    ],
  },
];

const WORKFLOW = [
  {
    icon: Droplet,
    title: "ICG administration",
    text: "A small dose of ICG is given intravenously for perfusion and vascular imaging, or injected locally for lymphatic mapping, according to the specialty protocol.",
  },
  {
    icon: Zap,
    title: "Real-time NIR excitation",
    text: "The light source excites ICG with near-infrared light. It is invisible to the eye, so the surgical view stays natural under white light.",
  },
  {
    icon: Eye,
    title: "High-definition perfusion assessment",
    text: "Fluorescence is captured and overlaid in real time, so the team can assess perfusion, vessels and anatomy before key surgical decisions.",
  },
];

const COMPAT = [
  { icon: Monitor, title: "Standard laparoscopy stacks", text: "Connects to existing towers and surgical monitors" },
  { icon: Layers, title: "Surgical booms & pendants", text: "Mounts alongside your current OR equipment" },
  { icon: Video, title: "Recording & integration", text: "Digital video output to OR recording systems" },
  { icon: Users, title: "Team onboarding", text: "On-site training for surgeons, nurses and biomedical teams" },
];

const DOWNLOADS = [
  { cat: "Instructions for Use", title: "Irillic L nm: Instructions for Use", meta: "PDF · 4.1 MB", href: "/docs/irillic-l-nm-ifu.pdf" },
  { cat: "Specification", title: "Irillic L nm: Product Spec Sheet", meta: "PDF · 0.9 MB", href: "/docs/irillic-l-nm-spec-sheet.pdf" },
  { cat: "Reprocessing", title: "Cleaning & Reprocessing Guide", meta: "PDF · 1.6 MB", href: "/docs/irillic-l-nm-reprocessing-guide.pdf" },
  { cat: "Quick start", title: "ICG Imaging Quick-Start Guide", meta: "PDF · 1.1 MB", href: "/docs/icg-quick-start-guide.pdf" },
];

const specItems: TabItem[] = SPEC_TABS.map(({ id, icon: Icon, label, title, intro, notice, rows }) => ({
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
        {notice && (
          <p className="notice">
            <ShieldCheck className="i" aria-hidden="true" /> {notice}
          </p>
        )}
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
}));

const pad = (n: number) => String(n).padStart(2, "0");

export default function ProductDetailPage() {
  return (
    <main id="main">
      <section className="phero" aria-labelledby="page-title">
        <div className="wrap">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Innovations & Systems", href: "/products" },
              { label: "Products", href: "/products" },
              { label: "Irillic L nm" },
            ]}
          />
          <div className="phero__grid">
            <ProductGallery
              views={[
                { src: "/images/theme/division-minimally-invasive.svg", alt: "Irillic L nm laparoscopic imaging tower with NIR laparoscope", label: "System", width: 600, height: 450 },
                { src: "/images/theme/case-laparoscopic.svg", alt: "Laparoscopic view with live ICG fluorescence overlay", label: "NIR overlay", width: 800, height: 500 },
                { src: "/images/theme/case-perfusion.svg", alt: "Perfusion assessment of a bowel segment under NIR fluorescence", label: "Perfusion", width: 800, height: 500 },
              ]}
            />
            <div className="phero__copy">
              <p className="tag reveal">Minimally invasive · Laparoscopic</p>
              <h1 className="subhero__title reveal" id="page-title">
                Irillic L nm Laparoscopic Imaging System<span className="dot">.</span>
              </h1>
              <p className="subhero__summary reveal">
                4K NIR fluorescence for minimally invasive surgery, with dual-mode white-light and ICG overlay on the
                laparoscopic view. Designed to slot into the laparoscopy stack your team already uses.
              </p>
              {/* Confirm certification marks with Irillic Quality & Regulatory before publishing. */}
              <ul className="badges reveal" aria-label="Certifications">
                <li>
                  <strong>CE</strong> Marked
                </li>
                <li>
                  <strong>ISO 13485</strong>:2016 QMS
                </li>
                <li>
                  <strong>CDSCO</strong> Compliant
                </li>
                <li>
                  <strong>Make in India</strong>
                </li>
              </ul>
              <dl className="keyspecs reveal">
                <div>
                  <dt>Imaging</dt>
                  <dd>4K + NIR</dd>
                </div>
                <div>
                  <dt>Overlay</dt>
                  <dd>Real-time</dd>
                </div>
                <div>
                  <dt>View modes</dt>
                  <dd>3</dd>
                </div>
                <div>
                  <dt>OR stack</dt>
                  <dd>Standard</dd>
                </div>
              </dl>
              <div className="phero__ctas reveal">
                <Link className="pill pill--lg" href="/contact?system=lnm#form">
                  Request In-Hospital Demo <ArrowRight className="i" aria-hidden="true" />
                </Link>
                <Link className="link-pill link-pill--lg" href="/clinical-resources#ifu">
                  Download Product Spec Sheet <Download className="i" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SubNav
        items={[
          { id: "specs", label: "Specifications" },
          { id: "workflow", label: "Clinical Workflow" },
          { id: "compatibility", label: "OR Compatibility" },
          { id: "downloads", label: "Downloads" },
        ]}
      />

      <section className="section" id="specs" aria-labelledby="specs-title">
        <div className="wrap">
          <SectionHead label="Specifications" title="Engineered for clarity in every mode" id="specs-title" />
          <TabSet items={specItems} label="Specification categories" className="tabs reveal" />
        </div>
      </section>

      <section className="section section--canvas" id="workflow" aria-labelledby="workflow-title">
        <div className="wrap">
          <SectionHead label="Clinical workflow" title="Three steps to fluorescence-guided surgery" id="workflow-title" />
          <ol className="workflow">
            {WORKFLOW.map(({ icon: Icon, title, text }, i) => (
              <li className="flow reveal" key={title}>
                <span className="flow__num">{pad(i + 1)}</span>
                <span className="flow__icon">
                  <Icon className="i" aria-hidden="true" />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" id="compatibility" aria-labelledby="compat-title">
        <div className="wrap compat">
          <div className="compat__copy">
            <SectionHead label="OR compatibility" title="Works with the OR you already have" id="compat-title" />
            <p className="reveal">
              Irillic L nm is designed to integrate with standard laparoscopy stacks and surgical booms. Your team keeps its
              familiar set-up and gains fluorescence guidance on top.
            </p>
            <Link className="pill reveal" href="/contact?system=lnm#form">
              Check compatibility for your OR <ArrowRight className="i" aria-hidden="true" />
            </Link>
          </div>
          <ul className="compat__list">
            {COMPAT.map(({ icon: Icon, title, text }) => (
              <li className="reveal" key={title}>
                <Icon className="i" aria-hidden="true" />
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--canvas" id="downloads" aria-labelledby="dl-title">
        <div className="wrap">
          <SectionHead
            label="Downloads"
            title="Irillic L nm documentation"
            id="dl-title"
            aside={
              <Link className="pill pill--sm" href="/clinical-resources">
                Resource library <ArrowUpRight className="i" aria-hidden="true" />
              </Link>
            }
          />
          <div className="docs">
            {DOWNLOADS.map((d) => (
              <a className="doc reveal" href={d.href} download key={d.title}>
                <span className="doc__cat">{d.cat}</span>
                <span className="doc__title">{d.title}</span>
                <span className="doc__meta">
                  {d.meta}{" "}
                  <span className="circle-arrow circle-arrow--red">
                    <Download className="i" aria-hidden="true" />
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Bring Irillic L nm to your hospital"
        text="Book an in-hospital demonstration on your own laparoscopic cases."
        primary={{ label: "Request In-Hospital Demo", href: "/contact?system=lnm#form" }}
        secondary={{ label: "Compare systems", href: "/products#matrix" }}
      />
    </main>
  );
}
