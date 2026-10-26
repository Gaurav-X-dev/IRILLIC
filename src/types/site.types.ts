import type { LucideIcon } from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface NavColumn {
  title: string;
  links: NavLink[];
}

export interface MegaFeature {
  image: string;
  href: string;
  label: string;
  title: string;
  cta: string;
}

export interface MegaSection {
  key: string;
  label: string;
  heading: string;
  intro: string;
  cta: NavLink;
  columns: [NavColumn, NavColumn];
  feature: MegaFeature;
  downloadsLabel: string;
  /** Route prefixes that mark this tab as the current section */
  match: string[];
}

export interface SearchEntry {
  title: string;
  section: string;
  href: string;
  keywords: string;
}

export interface Crumb {
  label: string;
  href?: string;
}

export interface Reference {
  authors: string;
  title: string;
  journal: string;
}

export interface Specialty {
  key: string;
  name: string;
  icon: LucideIcon;
  image: string;
  alt: string;
  rationale: string;
  benefits: string[];
  steps: string[];
  references: Reference[];
  system: NavLink;
}

export type ResourceType = "ifu" | "study" | "paper" | "video";

export interface Resource {
  type: ResourceType;
  title: string;
  description: string;
  year: number;
  meta: string;
  /** Local file for downloads and videos; studies link to PubMed */
  href?: string;
}

export interface Leader {
  mono: string;
  group: "Leadership" | "Scientific Advisory Board";
  role: string;
  focusLine: string;
  bio: string;
  focus: string[];
}
