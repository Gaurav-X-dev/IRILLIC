/**
 * Human names, help text and a sensible order for the fields inside a section.
 *
 * The editor renders whatever keys the content holds, so without this the
 * panel showed "Href", "Tab", "Text" in storage order. Editors think in terms
 * of what appears on the page: title first, then the body, then the image, then
 * the link.
 */

export interface FieldMeta {
  label: string;
  hint?: string;
  /** Lower sorts first. */
  weight: number;
  /** Renders as a long text area regardless of the current length. */
  long?: boolean;
}

const FIELDS: Record<string, FieldMeta> = {
  // Identity and headings
  label: {
    label: "Eyebrow",
    hint: "The small line above the title.",
    weight: 10,
  },
  eyebrow: { label: "Eyebrow", weight: 10 },
  tab: {
    label: "Tab name",
    hint: "Shown on the slide or tab button.",
    weight: 11,
  },
  title: { label: "Title", weight: 20 },
  heading: { label: "Heading", weight: 20 },
  subtitle: { label: "Subtitle", weight: 25 },
  name: { label: "Name", weight: 20 },
  role: { label: "Role", weight: 22 },

  // Body copy
  text: { label: "Body text", weight: 30, long: true },
  description: { label: "Description", weight: 30, long: true },
  intro: { label: "Intro", weight: 31, long: true },
  body: { label: "Body text", weight: 31, long: true },
  summary: { label: "Summary", weight: 32, long: true },
  bio: { label: "Biography", weight: 33, long: true },
  copy: { label: "Copy", weight: 33, long: true },
  quote: { label: "Quote", weight: 34, long: true },

  // Media
  image: {
    label: "Image",
    hint: "Path to an image in the media library, for example /images/theme/hero.svg",
    weight: 40,
  },
  imageAlt: {
    label: "Image description",
    hint: "Describes the image for screen readers and when it fails to load.",
    weight: 41,
  },
  alt: { label: "Image description", weight: 41 },
  icon: { label: "Icon", weight: 42 },
  video: { label: "Video", weight: 43 },

  // Links and actions
  href: {
    label: "Link address",
    hint: "A page path such as /products, an anchor such as #contact, or a full https:// address.",
    weight: 50,
  },
  link: { label: "Link", weight: 50 },
  linkLabel: { label: "Link text", weight: 51 },
  cta: { label: "Button", weight: 52 },
  ctaLabel: { label: "Button text", weight: 52 },
  itemLinkLabel: {
    label: "Per-card link text",
    hint: "Repeated on every card in this block.",
    weight: 53,
  },
  itemLinkHref: { label: "Per-card link address", weight: 54 },
  file: { label: "File", weight: 55 },
  external: { label: "Opens in a new tab", weight: 56 },

  // Values
  value: { label: "Value", weight: 60 },
  prefix: { label: "Prefix", weight: 61 },
  suffix: { label: "Suffix", weight: 62 },
  unit: { label: "Unit", weight: 62 },
  year: { label: "Year", weight: 63 },
  type: { label: "Type", weight: 64 },
  status: { label: "Status", weight: 65 },

  // Accessibility and plumbing
  ariaLabel: {
    label: "Accessibility label",
    hint: "Read out by screen readers; not shown on the page.",
    weight: 90,
  },
  key: {
    label: "Key",
    hint: "Internal identifier — change with care.",
    weight: 95,
  },
  slug: {
    label: "Slug",
    hint: "Internal identifier — change with care.",
    weight: 95,
  },
  match: { label: "Matching paths", weight: 96 },
};

function titleise(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());
}

export function fieldMeta(key: string): FieldMeta {
  return FIELDS[key] ?? { label: titleise(key), weight: 70 };
}

/** Sorts a section's keys into the order they read on the page. */
export function orderFields(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const diff = fieldMeta(a).weight - fieldMeta(b).weight;
    return diff !== 0 ? diff : a.localeCompare(b);
  });
}

/** True when the value is an image path the editor should preview. */
export function isImageField(key: string, value: unknown): boolean {
  if (typeof value !== "string") return false;
  if (/^(image|photo|logo|thumbnail|cover|banner)$/i.test(key)) return true;
  return /\.(png|jpe?g|webp|svg|gif|avif)$/i.test(value.trim());
}
