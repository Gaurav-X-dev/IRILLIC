/**
 * Human names for page-section keys.
 *
 * The stored keys come from the published content shape, so the panel used to
 * show raw keys like `sections__media` and listed "Pillars" twice — once for
 * the cards and once for the heading above them. This registry turns each key
 * into a name, a one-line description of what it controls on the public page,
 * and a group, so the editor reads as a page rather than as a data dump.
 */

export type SectionGroup =
  | "Top of the page"
  | "Page content"
  | "Headings above a block"
  | "Lists and cards"
  | "Downloads and links"
  | "Contact"
  | "Other";

export interface SectionMeta {
  label: string;
  description: string;
  group: SectionGroup;
}

/** Keys that hold the copy sitting above another block. */
const HEADING_KEYS: Record<string, { label: string; description: string }> = {
  endorsement: {
    label: "Motherson endorsement",
    description: "The group affiliation strip, its text and logo.",
  },
  pillars: {
    label: "Pillars heading",
    description: "The eyebrow and title above the four pillars.",
  },
  performance: {
    label: "Performance heading",
    description:
      "Heading, intro and the certification badge above the figures.",
  },
  divisions: {
    label: "Divisions heading",
    description: "Heading and call to action above the division cards.",
  },
  clinical: {
    label: "Clinical impact heading",
    description: "Heading and per-card link label above the case studies.",
  },
  media: {
    label: "Investors & media heading",
    description: "Heading and link above the media and literature panels.",
  },
  global: {
    label: "Global presence heading",
    description: "Heading and intro above the global facts.",
  },
  contact: {
    label: "Contact heading",
    description: "Heading and intro above the contact form.",
  },
  specialties: {
    label: "Specialties heading",
    description: "Heading above the clinical specialty links.",
  },
};

/** Keys that hold the actual content of a block. */
const CONTENT_KEYS: Record<string, SectionMeta> = {
  hero: {
    label: "Hero",
    description: "The first thing a visitor sees: headline, intro and image.",
    group: "Top of the page",
  },
  slides: {
    label: "Hero slides",
    description: "The rotating headline slides at the top of the home page.",
    group: "Top of the page",
  },
  navigation: {
    label: "In-page navigation",
    description: "The anchor links that jump between sections of this page.",
    group: "Top of the page",
  },
  pageCopy: {
    label: "Page intro copy",
    description: "The eyebrow, title and intro paragraph for this page.",
    group: "Top of the page",
  },

  pillars: {
    label: "Pillars",
    description: "The four pillar cards and their text.",
    group: "Lists and cards",
  },
  figures: {
    label: "Performance figures",
    description: "The counted statistics shown across the page.",
    group: "Lists and cards",
  },
  divisions: {
    label: "Divisions",
    description: "The strategic division cards.",
    group: "Lists and cards",
  },
  caseStudies: {
    label: "Case studies",
    description: "Clinical impact cards and their linked evidence.",
    group: "Lists and cards",
  },
  mediaPanels: {
    label: "Media panels",
    description: "Company update and literature panels.",
    group: "Lists and cards",
  },
  globalFacts: {
    label: "Global facts",
    description: "The global presence figures and their labels.",
    group: "Lists and cards",
  },
  milestones: {
    label: "Milestones",
    description: "The company timeline entries.",
    group: "Lists and cards",
  },
  certifications: {
    label: "Certifications",
    description: "Quality and regulatory certification cards.",
    group: "Lists and cards",
  },
  portfolio: {
    label: "Product portfolio",
    description: "The product cards listed on this page.",
    group: "Lists and cards",
  },
  comparison: {
    label: "Comparison matrix",
    description: "The side-by-side system comparison table.",
    group: "Lists and cards",
  },
  specificationTabs: {
    label: "Specification tabs",
    description: "Technical specifications, grouped into tabs.",
    group: "Page content",
  },
  workflow: {
    label: "Workflow",
    description: "The step-by-step clinical workflow.",
    group: "Page content",
  },
  compatibility: {
    label: "Compatibility",
    description: "Compatible instruments and integrations.",
    group: "Page content",
  },
  story: {
    label: "Our story",
    description: "The narrative about the company.",
    group: "Page content",
  },
  identity: {
    label: "Our identity",
    description: "What the company stands for.",
    group: "Page content",
  },
  identityPoints: {
    label: "Identity points",
    description: "The supporting points under Our identity.",
    group: "Lists and cards",
  },
  synergy: {
    label: "Motherson synergy",
    description: "What the group relationship brings.",
    group: "Page content",
  },
  synergyIntro: {
    label: "Synergy intro",
    description: "The intro copy above the synergy section.",
    group: "Headings above a block",
  },
  leadershipIntro: {
    label: "Leadership intro",
    description: "The intro copy above the leadership grid.",
    group: "Headings above a block",
  },
  qualityIntro: {
    label: "Quality intro",
    description: "The intro copy above quality and certifications.",
    group: "Headings above a block",
  },
  quick: {
    label: "Quick answers",
    description: "Short question-and-answer entries.",
    group: "Page content",
  },
  departments: {
    label: "Departments",
    description: "Who to contact, by department.",
    group: "Contact",
  },
  headquarters: {
    label: "Headquarters",
    description: "The registered address and map location.",
    group: "Contact",
  },
  network: {
    label: "Service network",
    description: "Regional offices and service coverage.",
    group: "Contact",
  },
  enquiries: {
    label: "Enquiry routing",
    description: "Which enquiry types the contact form offers.",
    group: "Contact",
  },
  contactForm: {
    label: "Contact form",
    description: "Field labels, helper text and the submit button.",
    group: "Contact",
  },
  documents: {
    label: "Documents",
    description: "Downloadable brochures, IFUs and manuals.",
    group: "Downloads and links",
  },
  downloads: {
    label: "Downloads",
    description: "The files offered on this page.",
    group: "Downloads and links",
  },
  specialtyLinks: {
    label: "Specialty links",
    description: "Links through to each clinical specialty.",
    group: "Downloads and links",
  },
  mothersonHealthUrl: {
    label: "Motherson Health link",
    description: "The group website address used on this page.",
    group: "Downloads and links",
  },
  cta: {
    label: "Call to action",
    description: "The closing band that invites the visitor to get in touch.",
    group: "Page content",
  },
};

function titleise(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());
}

/**
 * Resolves a stored section key. Unknown keys still get a readable name, so
 * a section added later never shows as a raw key.
 */
export function sectionMeta(sectionKey: string): SectionMeta {
  if (sectionKey.startsWith("sections__")) {
    const nested = sectionKey.slice("sections__".length);
    const known = HEADING_KEYS[nested];
    return {
      label: known?.label ?? `${titleise(nested)} heading`,
      description:
        known?.description ??
        "The eyebrow, title and intro copy above this block.",
      group: "Headings above a block",
    };
  }
  return (
    CONTENT_KEYS[sectionKey] ?? {
      label: titleise(sectionKey),
      description: "Content for this part of the page.",
      group: "Other",
    }
  );
}

/** The order groups appear in the editor, top to bottom. */
export const SECTION_GROUP_ORDER: SectionGroup[] = [
  "Top of the page",
  "Page content",
  "Lists and cards",
  "Headings above a block",
  "Downloads and links",
  "Contact",
  "Other",
];
