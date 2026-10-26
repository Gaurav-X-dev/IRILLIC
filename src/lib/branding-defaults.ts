/**
 * Brand and SEO values the administrator controls from General settings.
 * Consumers read them through `getBranding()`, so changing a value in the panel
 * changes the public website, the admin shell and the page metadata without a
 * deployment. This module stays free of server-only imports so the seed script
 * and the runtime reader share exactly one source of truth.
 */
export interface Branding {
  siteName: string;
  legalName: string;
  tagline: string;
  brandDescription: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  supportEmail: string;
  phone: string;
  logo: string;
  logoWhite: string;
  logoFooter: string;
  favicon: string;
  themeColor: string;
}

export const BRANDING_FALLBACK: Branding = {
  siteName: "IRILLIC",
  legalName: "Irillic Private Limited",
  tagline: "A Global Pioneer in Optical Surgical Imaging",
  brandDescription:
    "Pioneering real-time ICG fluorescence and advanced laparoscopic imaging systems to elevate surgical precision across India and global operating rooms.",
  seoTitle: "IRILLIC | A Global Pioneer in Optical Surgical Imaging",
  seoDescription:
    "Irillic designs and manufactures ICG fluorescence and laparoscopic imaging systems in India, as an enterprise of Motherson Health & Medical.",
  seoKeywords: [
    "IRILLIC",
    "ICG fluorescence imaging",
    "laparoscopic imaging",
    "NIR surgical imaging",
    "Motherson Health & Medical",
  ],
  supportEmail: "info@irillic.com",
  phone: "",
  logo: "/images/logo/irillic-logo-blue.png",
  logoWhite: "/images/logo/irillic-logo-white.png",
  logoFooter: "/images/logo/irillic-logo-blue.png",
  favicon: "/images/logo/irillic-logo-blue.png",
  themeColor: "#ffffff",
};
