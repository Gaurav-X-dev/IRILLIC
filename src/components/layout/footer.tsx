import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  FlaskConical,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import type { NavLink } from "@/types/site.types";
import type { SiteChromeContent } from "@/validations/public-content.validation";
import type { Branding } from "@/lib/branding";

function FooterLink({ link }: { link: NavLink }) {
  const icon = <ArrowUpRight className="i" aria-hidden="true" />;
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener">
        {icon} {link.label}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={link.href}>
      {icon} {link.label}
    </Link>
  );
}

export function Footer({
  branding,
  footerColumns,
  legalLinks,
  contact,
}: Pick<SiteChromeContent, "footerColumns" | "legalLinks" | "contact"> & {
  branding: Branding;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="footer">
      <div className="wrap">
        <div className="footer__top">
          {/* Brand & quality accreditations */}
          <div className="footer-brand-col">
            {/* Logo with official safe area (0.5 x height of "I") */}
            <div className="footer-logo-wrap">
              <Link href="/" aria-label={`${branding.siteName} home`}>
                <Image
                  src={branding.logoFooter}
                  alt={branding.siteName}
                  className="footer-logo"
                  width={473}
                  height={139}
                  unoptimized
                />
              </Link>
            </div>

            <p className="footer-brand-desc">{branding.brandDescription}</p>

            <ul className="footer-trust-badges" aria-label="Accreditations">
              <li
                className="trust-pill"
                title="Certified Quality Management System"
              >
                <ShieldCheck
                  className="trust-icon"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span>
                  <strong>ISO 13485:2016</strong> Certified
                </span>
              </li>
              <li
                className="trust-pill"
                title="Indigenous Medical Device Innovation"
              >
                <Globe
                  className="trust-icon"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span>Make in India</span>
              </li>
              <li
                className="trust-pill"
                title="Biotechnology Industry Research Assistance Council"
              >
                <FlaskConical
                  className="trust-icon"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span>BIRAC Supported</span>
              </li>
            </ul>

            <p className="footer-group-tag">
              <span className="group-dot" aria-hidden="true" /> An Enterprise in
              Surgical Photonics &amp; Medical Technology
            </p>
          </div>

          <nav className="footer__cols" aria-label="Footer">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="footer__title">{column.title}</p>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <FooterLink link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="footer__title">Bangalore Office</p>
              <address className="footer__addr">
                <p>
                  <MapPin className="i" aria-hidden="true" />
                  <span>
                    <strong>{contact.company}</strong>
                    {contact.address}
                  </span>
                </p>
                <p>
                  <Mail className="i" aria-hidden="true" />
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </p>
                {contact.phone ? (
                  <p>
                    <Phone className="i" aria-hidden="true" />
                    <a href={contact.phoneHref}>{contact.phone}</a>
                  </p>
                ) : null}
              </address>
            </div>
          </nav>
        </div>

        {/* Independent Motherson endorsement (never locked up with the Irillic logo) */}
        <div className="footer__endorse">
          <Image
            src="/images/motherson/PTBPO_Motherson.png"
            alt="Proud to be part of motherson"
            width={2340}
            height={265}
            unoptimized
          />
        </div>
      </div>

      <div className="footer__legal">
        <div className="wrap footer__legal-inner">
          <ul>
            {legalLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
          <p>
            Copyright © {year} {branding.legalName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
