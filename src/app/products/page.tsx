import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Download } from "lucide-react";
import { CtaBand, SectionHead, SubHero } from "@/components/shared/page-sections";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Irillic nm and Irillic L nm fluorescence imaging systems for open and minimally invasive surgery, compared side by side.",
};

const Yes = () => (
  <span className="yes">
    <Check className="i" aria-hidden="true" /> Yes
  </span>
);

/* Technical values are presentation copy: confirm against Irillic's current datasheets before publishing. */
const MATRIX: { group: string; rows: [string, React.ReactNode, React.ReactNode][] }[] = [
  {
    group: "Optics & imaging",
    rows: [
      ["Optical sensor", "NIR-sensitive imaging sensor with dedicated fluorescence channel", "Endoscopic camera with combined white-light and NIR channels"],
      ["Excitation wavelength", "Near-infrared, optimised for ICG absorption (~800 nm)", "Near-infrared, optimised for ICG absorption (~800 nm)"],
      ["Fluorescence detection", "NIR emission band (~830 nm)", "NIR emission band (~830 nm)"],
      ["Imaging resolution", "High-definition", "Full HD / 4K"],
    ],
  },
  {
    group: "Display & workflow",
    rows: [
      ["Display modes", "White light · NIR overlay · Monochrome NIR", "White light · NIR overlay · Monochrome NIR"],
      ["Real-time overlay", <Yes key="a" />, <Yes key="b" />],
      ["Form factor", "Handheld camera head, portable cart", "Laparoscopic tower with camera control unit"],
      ["OR integration", "Stand-alone, moves between rooms", "Standard laparoscopy stacks and surgical booms"],
    ],
  },
  {
    group: "Compliance & support",
    rows: [
      ["Certifications", "ISO 13485:2016 QMS · CDSCO", "ISO 13485:2016 QMS · CDSCO · CE"],
      ["Training & service", "On-site clinical training, preventive maintenance", "On-site clinical training, preventive maintenance"],
    ],
  },
];

const QUICK = ["Irillic nm IFU", "Irillic L nm IFU", "Irillic nm spec sheet", "Irillic L nm spec sheet"];

export default function ProductsPage() {
  return (
    <main id="main">
      <SubHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Innovations & Systems", href: "/products" }, { label: "Products" }]}
        tag="Surgical systems"
        title="Advanced Optical Systems for Open & Minimally Invasive Surgery"
        summary="Two Irillic platforms bring real-time ICG fluorescence to every surgical approach, from the open field to the laparoscopic view. Both share one imaging philosophy, one training path and one service network."
      />

      <section className="section" id="compare" aria-labelledby="compare-title">
        <div className="wrap">
          <SectionHead label="System portfolio" title="Choose the right system for your OR" id="compare-title" />
          <div className="systems">
            <article className="system reveal" id="nm">
              <div className="system__stage">
                <Image
                  src="/images/theme/division-open-surgery.svg"
                  alt="Illustration of the Irillic nm open-surgery fluorescence imaging system"
                  width={600}
                  height={450}
                  unoptimized
                />
                <span className="system__flag">Open surgery</span>
              </div>
              <div className="system__body">
                <ul className="chips">
                  <li>Handheld</li>
                  <li>Real-time NIR</li>
                  <li>Portable cart</li>
                </ul>
                <h2 className="system__title">Irillic nm Fluorescence Imaging System</h2>
                <p>
                  A handheld open-surgery unit with real-time NIR sensitivity, mounted on an ultra-portable cart that moves
                  easily between operating rooms.
                </p>
                <ul className="ticks">
                  {[
                    "Handheld NIR camera head for the open surgical field",
                    "Real-time, high-sensitivity ICG fluorescence detection",
                    "Ultra-portable cart with articulating arm",
                    "White light, NIR overlay and monochrome NIR views",
                  ].map((t) => (
                    <li key={t}>
                      <Check className="i" aria-hidden="true" /> {t}
                    </li>
                  ))}
                </ul>
                <div className="system__actions">
                  <Link className="pill" href="/contact?system=nm#form">
                    Request a demo <ArrowRight className="i" aria-hidden="true" />
                  </Link>
                  <Link className="link" href="/clinical-resources#ifu">
                    Download IFU <Download className="i" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>

            <article className="system reveal" id="lnm">
              <div className="system__stage">
                <Image
                  src="/images/theme/division-minimally-invasive.svg"
                  alt="Illustration of the Irillic L nm laparoscopic imaging tower"
                  width={600}
                  height={450}
                  unoptimized
                />
                <span className="system__flag">Minimally invasive</span>
              </div>
              <div className="system__body">
                <ul className="chips">
                  <li>Laparoscopic</li>
                  <li>Full HD / 4K</li>
                  <li>Dual-mode overlay</li>
                </ul>
                <h2 className="system__title">Irillic L nm Laparoscopic Imaging System</h2>
                <p>
                  Full HD and 4K endoscopic NIR integration with dual-mode white-light and fluorescence overlay, designed
                  for minimally invasive workflows.
                </p>
                <ul className="ticks">
                  {[
                    "Full HD / 4K endoscopic imaging with NIR channel",
                    "Dual-mode white-light and fluorescence overlay",
                    "Integrates with standard laparoscopy stacks",
                    "Mode switching from the camera head",
                  ].map((t) => (
                    <li key={t}>
                      <Check className="i" aria-hidden="true" /> {t}
                    </li>
                  ))}
                </ul>
                <div className="system__actions">
                  <Link className="pill" href="/products/irillic-l-nm">
                    Explore Irillic L nm <ArrowRight className="i" aria-hidden="true" />
                  </Link>
                  <Link className="link" href="/contact?system=lnm#form">
                    Request a demo <ArrowRight className="i" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--canvas" id="matrix" aria-labelledby="matrix-title">
        <div className="wrap">
          <SectionHead
            label="Feature matrix"
            title="Side-by-side comparison"
            id="matrix-title"
            text="Key technical characteristics of both systems. Full specifications are available in each system's spec sheet."
          />
          <div className="matrix reveal" role="region" aria-label="Feature comparison table" tabIndex={0}>
            <table>
              <caption className="sr-only">Comparison of Irillic nm and Irillic L nm</caption>
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">
                    <span className="matrix__sys">Irillic nm</span>
                    <small>Open surgery</small>
                  </th>
                  <th scope="col">
                    <span className="matrix__sys">Irillic L nm</span>
                    <small>Minimally invasive</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                {MATRIX.flatMap(({ group, rows }) => [
                  <tr className="matrix__group" key={group}>
                    <th scope="rowgroup" colSpan={3}>
                      {group}
                    </th>
                  </tr>,
                  ...rows.map(([feature, nm, lnm]) => (
                    <tr key={feature}>
                      <th scope="row">{feature}</th>
                      <td>{nm}</td>
                      <td>{lnm}</td>
                    </tr>
                  )),
                ])}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="quickbar" aria-label="Quick downloads">
        <div className="wrap quickbar__inner">
          <p className="quickbar__label">
            <Download className="i" aria-hidden="true" /> IFU &amp; spec sheets
          </p>
          <ul>
            {QUICK.map((q) => (
              <li key={q}>
                <Link href="/clinical-resources#ifu">
                  {q} <span>PDF</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link className="pill pill--sm" href="/clinical-resources">
            All resources <ArrowRight className="i" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <CtaBand
        title="See both systems in your OR"
        text="Our clinical specialists will demonstrate Irillic nm and Irillic L nm on your own cases."
        primary={{ label: "Request a demonstration", href: "/contact#form" }}
        secondary={{ label: "Clinical applications", href: "/clinical-applications" }}
      />
    </main>
  );
}
