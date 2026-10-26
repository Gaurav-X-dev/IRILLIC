import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { ne } from "drizzle-orm";
import { contentEntries, siteSettings, users } from "./schema";
import {
  APPLICATION_SEEDS,
  LEADER_SEEDS,
  RESOURCE_SEEDS,
} from "./catalog-seed-data";
import { BRANDING_FALLBACK } from "../lib/branding-defaults";
import {
  ABOUT_CONTENT,
  CLINICAL_APPLICATIONS_PAGE_CONTENT,
  CLINICAL_RESOURCES_PAGE_CONTENT,
  CONTACT_CONTENT,
  HOME_CONTENT,
  LNM_DETAIL_CONTENT,
  PRODUCTS_PAGE_CONTENT,
} from "./seed-data";
import {
  CONTACT,
  FOOTER_COLUMNS,
  LEGAL_LINKS,
  MEGA_DOWNLOADS,
  MEGA_MENU,
  SEARCH_CHIPS,
  SEARCH_INDEX,
} from "../config/navigation";

dotenv.config({ path: ".env.local" });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const initialContent = [
  {
    type: "page",
    slug: "site-chrome",
    title: "Global navigation and footer",
    summary: "Header, search, footer and contact configuration",
    status: "published",
    sortOrder: 0,
    content: {
      megaMenu: MEGA_MENU,
      megaDownloads: MEGA_DOWNLOADS,
      searchChips: SEARCH_CHIPS,
      searchIndex: SEARCH_INDEX,
      footerColumns: FOOTER_COLUMNS,
      legalLinks: LEGAL_LINKS,
      contact: CONTACT,
    },
    seo: {},
  },
  {
    type: "page",
    slug: "home",
    title: "Home page",
    summary: "IRILLIC corporate website home page",
    status: "published",
    sortOrder: 1,
    content: HOME_CONTENT,
    seo: { title: "A Global Pioneer in Optical Surgical Imaging" },
  },
  {
    type: "page",
    slug: "about-us",
    title: "About IRILLIC",
    summary: "Company, leadership, quality and identity",
    status: "published",
    sortOrder: 2,
    content: { ...ABOUT_CONTENT, leaders: LEADER_SEEDS },
    seo: { title: "About Us" },
  },
  {
    type: "page",
    slug: "products",
    title: "Products",
    summary: "IRILLIC surgical imaging portfolio",
    status: "published",
    sortOrder: 3,
    content: PRODUCTS_PAGE_CONTENT,
    seo: { title: "Products" },
  },
  {
    type: "page",
    slug: "clinical-applications",
    title: "Clinical applications",
    summary: "Clinical applications for fluorescence-guided surgery",
    status: "published",
    sortOrder: 4,
    content: CLINICAL_APPLICATIONS_PAGE_CONTENT,
    seo: { title: "Clinical Applications" },
  },
  {
    type: "page",
    slug: "clinical-resources",
    title: "Clinical resources",
    summary: "Documents, studies and video resources",
    status: "published",
    sortOrder: 5,
    content: CLINICAL_RESOURCES_PAGE_CONTENT,
    seo: { title: "Clinical Resources" },
  },
  {
    type: "page",
    slug: "contact",
    title: "Contact",
    summary: "Contact and demonstration requests",
    status: "published",
    sortOrder: 6,
    content: CONTACT_CONTENT,
    seo: { title: "Contact" },
  },
  {
    type: "product",
    slug: "irillic-nm",
    title: "Irillic nm Fluorescence Imaging System",
    summary:
      "A handheld open-surgery unit with real-time NIR sensitivity, mounted on an ultra-portable cart that moves easily between operating rooms.",
    status: "published",
    sortOrder: 1,
    isFeatured: true,
    content: {
      anchor: "nm",
      approach: "Open surgery",
      image: "/images/theme/division-open-surgery.svg",
      imageAlt:
        "Illustration of the Irillic nm open-surgery fluorescence imaging system",
      chips: ["Handheld", "Real-time NIR", "Portable cart"],
      features: [
        "Handheld NIR camera head for the open surgical field",
        "Real-time, high-sensitivity ICG fluorescence detection",
        "Ultra-portable cart with articulating arm",
        "White light, NIR overlay and monochrome NIR views",
      ],
      primary: { label: "Request a demo", href: "/contact?system=nm#form" },
      secondary: {
        label: "Download IFU",
        href: "/clinical-resources#ifu",
        icon: "download",
      },
    },
    seo: {},
  },
  {
    type: "product",
    slug: "irillic-l-nm",
    title: "Irillic L nm Laparoscopic Imaging System",
    summary:
      "Full HD and 4K endoscopic NIR integration with dual-mode white-light and fluorescence overlay, designed for minimally invasive workflows.",
    status: "published",
    sortOrder: 2,
    isFeatured: true,
    content: {
      anchor: "lnm",
      approach: "Minimally invasive",
      image: "/images/theme/division-minimally-invasive.svg",
      imageAlt: "Illustration of the Irillic L nm laparoscopic imaging tower",
      chips: ["Laparoscopic", "Full HD / 4K", "Dual-mode overlay"],
      features: [
        "Full HD / 4K endoscopic imaging with NIR channel",
        "Dual-mode white-light and fluorescence overlay",
        "Integrates with standard laparoscopy stacks",
        "Mode switching from the camera head",
      ],
      primary: {
        label: "Explore Irillic L nm",
        href: "/products/irillic-l-nm",
      },
      secondary: {
        label: "Request a demo",
        href: "/contact?system=lnm#form",
        icon: "arrow",
      },
      ...LNM_DETAIL_CONTENT,
    },
    seo: {},
  },
  ...APPLICATION_SEEDS.map((specialty, index) => ({
    type: "application",
    slug: specialty.key,
    title: specialty.name,
    summary: specialty.rationale,
    status: "published",
    sortOrder: index + 1,
    content: {
      image: specialty.image,
      icon: specialty.icon,
      alt: specialty.alt,
      rationale: specialty.rationale,
      benefits: specialty.benefits,
      steps: specialty.steps,
      references: specialty.references,
      system: specialty.system,
    },
    seo: {},
  })),
  ...RESOURCE_SEEDS.map((resource, index) => ({
    type: "resource",
    slug: `${resource.type}-${index + 1}`,
    title: resource.title,
    summary: resource.description,
    status: "published",
    sortOrder: index + 1,
    content: {
      resourceType: resource.type,
      year: resource.year,
      meta: resource.meta,
      href: resource.href,
    },
    seo: {},
  })),
];

async function seed() {
  const email = (process.env.ADMIN_EMAIL || "admin@irillic.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 12)
    throw new Error(
      "Set ADMIN_PASSWORD in .env.local with at least 12 characters before seeding.",
    );
  const passwordHash = await bcrypt.hash(password, 12);
  await db
    .insert(users)
    .values({
      name: process.env.ADMIN_NAME || "IRILLIC Admin",
      email,
      password: passwordHash,
      role: "admin",
      isActive: true,
      emailVerified: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        name: process.env.ADMIN_NAME || "IRILLIC Admin",
        password: passwordHash,
        role: "admin",
        isActive: true,
        emailVerified: true,
        updatedAt: new Date(),
      },
    });
  await db.delete(users).where(ne(users.email, email));
  // Seed only missing records. Never overwrite content edited in the CMS.
  for (const item of initialContent)
    await db
      .insert(contentEntries)
      .values({ ...item, publishedAt: new Date() })
      .onConflictDoNothing({
        target: [contentEntries.type, contentEntries.slug],
      });
  const defaults: Record<string, unknown> = Object.fromEntries(
    Object.entries({
      ...BRANDING_FALLBACK,
      seoKeywords: BRANDING_FALLBACK.seoKeywords.join(", "),
    }).map(([key, value]) => [`general.${key}`, value]),
  );
  for (const [key, value] of Object.entries(defaults))
    await db
      .insert(siteSettings)
      .values({ key, group: "general", value })
      .onConflictDoNothing();
  console.log(`Database seeded for ${email}.`);
}

seed()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
