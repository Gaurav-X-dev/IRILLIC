import type { MegaSection, NavLink, SearchEntry } from "@/types/site.types";

export const SITE_ROUTES = {
  home: "/",
  about: "/about-us",
  products: "/products",
  productLnm: "/products/irillic-l-nm",
  applications: "/clinical-applications",
  resources: "/clinical-resources",
  contact: "/contact",
} as const;

export const EXTERNAL = {
  mothersonHealth: "https://healthandmedical.motherson.com/",
  careers: "https://healthandmedical.motherson.com/careers/",
  mothersonGroup: "https://www.motherson.com/",
} as const;

/** Routes that render the application shell instead of the marketing site */
export const APP_ROUTE_PREFIXES = [
  "/admin",
  "/dashboard",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/register",
];

export const MEGA_MENU: MegaSection[] = [
  {
    key: "company",
    label: "Company",
    heading: "Pioneering what surgeons can see",
    intro:
      "Irillic designs and manufactures fluorescence and laparoscopic imaging systems in Bengaluru, India, as an enterprise of Motherson Health & Medical.",
    cta: { label: "About Irillic", href: "/about-us" },
    columns: [
      {
        title: "Who we are",
        links: [
          { label: "Our Story", href: "/about-us#story" },
          { label: "The Motherson Synergy", href: "/about-us#synergy" },
          {
            label: "Leadership & Advisory Board",
            href: "/about-us#leadership",
          },
          { label: "Our Identity", href: "/about-us#identity" },
        ],
      },
      {
        title: "How we work",
        links: [
          { label: "Quality & Certifications", href: "/about-us#quality" },
          { label: "Make in India", href: "/about-us#quality" },
          { label: "Contact Us", href: "/contact" },
          { label: "Careers", href: EXTERNAL.careers, external: true },
        ],
      },
    ],
    feature: {
      image: "/images/theme/case-sentinel-node.svg",
      href: "/clinical-applications#oncology",
      label: "Featured application",
      title: "Radiation-free sentinel node mapping in surgical oncology",
      cta: "Explore application",
    },
    downloadsLabel: "Quick IFU downloads",
    match: ["/about-us"],
  },
  {
    key: "systems",
    label: "Innovations & Systems",
    heading: "Optical systems engineered for every approach",
    intro:
      "From handheld open-surgery imaging to 4K laparoscopic fluorescence, every Irillic system is designed, built and supported in India.",
    cta: { label: "All systems", href: "/products" },
    columns: [
      {
        title: "Imaging systems",
        links: [
          {
            label: "Irillic nm Fluorescence Imaging System",
            href: "/products#nm",
          },
          {
            label: "Irillic L nm Laparoscopic Imaging System",
            href: "/products/irillic-l-nm",
          },
          { label: "Compare systems", href: "/products#matrix" },
        ],
      },
      {
        title: "Technology",
        links: [
          {
            label: "Optical Performance",
            href: "/products/irillic-l-nm#specs",
          },
          {
            label: "Clinical Workflow",
            href: "/products/irillic-l-nm#workflow",
          },
          {
            label: "OR Compatibility",
            href: "/products/irillic-l-nm#compatibility",
          },
          { label: "Technical Documentation", href: "/clinical-resources#ifu" },
        ],
      },
    ],
    feature: {
      image: "/images/theme/case-laparoscopic.svg",
      href: "/products/irillic-l-nm",
      label: "Product spotlight",
      title: "Irillic L nm: 4K NIR fluorescence for minimally invasive surgery",
      cta: "View system",
    },
    downloadsLabel: "Quick IFU downloads",
    match: ["/products"],
  },
  {
    key: "clinical",
    label: "Clinical Impact",
    heading: "Evidence from the operating room",
    intro:
      "Real-time ICG fluorescence supports surgical decisions in oncology, reconstruction, gastrointestinal, urological and gynaecological surgery.",
    cta: { label: "Clinical applications", href: "/clinical-applications" },
    columns: [
      {
        title: "Specialties",
        links: [
          {
            label: "Surgical Oncology",
            href: "/clinical-applications#oncology",
          },
          {
            label: "Plastic & Reconstructive",
            href: "/clinical-applications#reconstructive",
          },
          {
            label: "Gastrointestinal Surgery",
            href: "/clinical-applications#gastro",
          },
          {
            label: "Urology & Gynaecology",
            href: "/clinical-applications#urology",
          },
        ],
      },
      {
        title: "Evidence & education",
        links: [
          { label: "Clinical Resources", href: "/clinical-resources" },
          { label: "Clinical Studies", href: "/clinical-resources#studies" },
          { label: "Video Guides", href: "/clinical-resources#videos" },
          { label: "Request an OR Demonstration", href: "/contact#form" },
        ],
      },
    ],
    feature: {
      image: "/images/theme/case-perfusion.svg",
      href: "/clinical-applications#gastro",
      label: "Featured application",
      title: "Objective perfusion assessment before colorectal anastomosis",
      cta: "Explore application",
    },
    downloadsLabel: "Quick IFU downloads",
    match: ["/clinical-applications", "/clinical-resources"],
  },
  {
    key: "global",
    label: "Global Presence",
    heading: "Built in India, connected to the world",
    intro:
      "Headquartered in Bengaluru and backed by the global network of the Motherson Group.",
    cta: { label: "Our presence", href: "/contact#network" },
    columns: [
      {
        title: "Locations",
        links: [
          { label: "Bangalore Headquarters", href: "/contact#hq" },
          { label: "Global Network", href: "/contact#network" },
          { label: "Service & Support", href: "/contact#enquiries" },
        ],
      },
      {
        title: "Partnerships",
        links: [
          { label: "The Motherson Synergy", href: "/about-us#synergy" },
          { label: "Become a Partner", href: "/contact#enquiries" },
          {
            label: "Motherson Health & Medical",
            href: EXTERNAL.mothersonHealth,
            external: true,
          },
        ],
      },
    ],
    feature: {
      image: "/images/theme/global-network.svg",
      href: "/contact#network",
      label: "Spotlight",
      title: "From Bengaluru to operating rooms across the country",
      cta: "Discover more",
    },
    downloadsLabel: "Quick IFU downloads",
    match: [],
  },
  {
    key: "media",
    label: "Investors & Media",
    heading: "News, literature and group updates",
    intro:
      "Press releases, media resources and product literature, plus investor information through the Motherson Group.",
    cta: { label: "Media centre", href: "/#media" },
    columns: [
      {
        title: "Media",
        links: [
          { label: "Company Updates", href: "/#media" },
          { label: "Whitepapers", href: "/clinical-resources#whitepapers" },
          { label: "Brand Identity", href: "/about-us#identity" },
        ],
      },
      {
        title: "Investors",
        links: [
          {
            label: "Motherson Group",
            href: EXTERNAL.mothersonGroup,
            external: true,
          },
          { label: "Group Partnership", href: "/about-us#synergy" },
          { label: "Company Policies", href: "/about-us#quality" },
        ],
      },
    ],
    feature: {
      image: "/images/theme/panel-people.svg",
      href: "/about-us#leadership",
      label: "The Irillic Way",
      title: "The people behind the precision",
      cta: "Meet our leadership",
    },
    downloadsLabel: "Quick downloads",
    match: [],
  },
];

export const MEGA_DOWNLOADS: NavLink[] = [
  {
    label: "Irillic nm: Instructions for Use",
    href: "/clinical-resources#ifu",
  },
  {
    label: "Irillic L nm: Instructions for Use",
    href: "/clinical-resources#ifu",
  },
  { label: "Product Spec Sheets", href: "/clinical-resources#ifu" },
];

export const SEARCH_CHIPS: { label: string; query: string }[] = [
  { label: "ICG fluorescence", query: "ICG" },
  { label: "IFU downloads", query: "IFU" },
  { label: "Laparoscopic system", query: "laparoscopic" },
  { label: "Surgical oncology", query: "oncology" },
  { label: "ISO 13485", query: "ISO" },
];

export const SEARCH_INDEX: SearchEntry[] = [
  {
    title: "About Irillic",
    section: "Company",
    href: "/about-us",
    keywords: "company about story vision who we are",
  },
  {
    title: "Our Identity: Vaastu-compliant logo",
    section: "Company",
    href: "/about-us#identity",
    keywords: "brand logo vaastu identity design",
  },
  {
    title: "The Motherson Synergy",
    section: "Company",
    href: "/about-us#synergy",
    keywords:
      "motherson group samvardhana engineering manufacturing supply chain",
  },
  {
    title: "Leadership & Scientific Advisory Board",
    section: "Company",
    href: "/about-us#leadership",
    keywords: "leadership team ceo cto advisors board",
  },
  {
    title: "Quality & Certifications",
    section: "Company",
    href: "/about-us#quality",
    keywords:
      "iso 13485 cdsco birac make in india quality regulatory compliance certified",
  },
  {
    title: "Products: all systems",
    section: "Innovations & Systems",
    href: "/products",
    keywords: "products systems portfolio compare",
  },
  {
    title: "Irillic nm Fluorescence Imaging System",
    section: "Innovations & Systems",
    href: "/products#nm",
    keywords: "nm open surgery handheld icg fluorescence camera portable cart",
  },
  {
    title: "Irillic L nm Laparoscopic Imaging System",
    section: "Innovations & Systems",
    href: "/products/irillic-l-nm",
    keywords:
      "l nm laparoscopic minimally invasive endoscopic 4k full hd nir overlay",
  },
  {
    title: "Feature comparison matrix",
    section: "Innovations & Systems",
    href: "/products#matrix",
    keywords: "compare matrix wavelength sensor display modes certifications",
  },
  {
    title: "L nm specifications",
    section: "Irillic L nm",
    href: "/products/irillic-l-nm#specs",
    keywords:
      "specs optical camera light source ergonomics sterilization reprocessing",
  },
  {
    title: "Clinical workflow",
    section: "Irillic L nm",
    href: "/products/irillic-l-nm#workflow",
    keywords: "workflow icg administration nir excitation perfusion",
  },
  {
    title: "OR compatibility",
    section: "Irillic L nm",
    href: "/products/irillic-l-nm#compatibility",
    keywords: "compatibility laparoscopy stack boom integration",
  },
  {
    title: "Surgical Oncology",
    section: "Clinical Applications",
    href: "/clinical-applications#oncology",
    keywords: "oncology cancer sentinel lymph node sln margin breast",
  },
  {
    title: "Plastic & Reconstructive Surgery",
    section: "Clinical Applications",
    href: "/clinical-applications#reconstructive",
    keywords: "plastic reconstructive flap perfusion microvascular",
  },
  {
    title: "Gastrointestinal Surgery",
    section: "Clinical Applications",
    href: "/clinical-applications#gastro",
    keywords:
      "gastrointestinal gi colorectal anastomosis leak biliary cholangiography",
  },
  {
    title: "Urology & Gynaecology",
    section: "Clinical Applications",
    href: "/clinical-applications#urology",
    keywords:
      "urology gynaecology gynecology ureter endometrial cervical lymphatic",
  },
  {
    title: "IFU downloads",
    section: "Clinical Resources",
    href: "/clinical-resources#ifu",
    keywords: "ifu instructions for use pdf download manual spec sheet",
  },
  {
    title: "Clinical studies",
    section: "Clinical Resources",
    href: "/clinical-resources#studies",
    keywords: "clinical studies papers research evidence pubmed pillar fires",
  },
  {
    title: "Whitepapers",
    section: "Clinical Resources",
    href: "/clinical-resources#whitepapers",
    keywords: "whitepaper guide programme principles",
  },
  {
    title: "Video guides",
    section: "Clinical Resources",
    href: "/clinical-resources#videos",
    keywords: "video training setup guide",
  },
  {
    title: "Request an OR demonstration",
    section: "Contact",
    href: "/contact#form",
    keywords: "demo demonstration book request or hospital",
  },
  {
    title: "Bangalore headquarters",
    section: "Contact",
    href: "/contact#hq",
    keywords: "contact address bangalore bengaluru office phone email map",
  },
  {
    title: "Global network",
    section: "Contact",
    href: "/contact#network",
    keywords: "global presence network motherson health medical partners",
  },
];

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About Irillic", href: "/about-us" },
      { label: "Leadership", href: "/about-us#leadership" },
      { label: "Quality & Certifications", href: "/about-us#quality" },
      { label: "Sustainability & ESG", href: "/#media" },
      { label: "Careers", href: EXTERNAL.careers, external: true },
    ],
  },
  {
    title: "Systems",
    links: [
      { label: "All Systems", href: "/products" },
      { label: "Irillic nm", href: "/products#nm" },
      { label: "Irillic L nm", href: "/products/irillic-l-nm" },
      { label: "Compare Systems", href: "/products#matrix" },
    ],
  },
  {
    title: "Clinical",
    links: [
      { label: "Clinical Applications", href: "/clinical-applications" },
      { label: "Clinical Resources", href: "/clinical-resources" },
      { label: "IFU Downloads", href: "/clinical-resources#ifu" },
      { label: "OR Demonstration", href: "/contact#form" },
    ],
  },
];

export const LEGAL_LINKS: NavLink[] = [
  { label: "Privacy Policy", href: "#" },
  { label: "Cookie Policy", href: "#" },
  { label: "Terms & Conditions", href: "#" },
  { label: "Data Deletion Policy", href: "#" },
];

export const CONTACT = {
  company: "Irillic Private Limited",
  address:
    "3rd Floor, Kalyani Neptune, Bannerghatta Road, Bangalore – 560076, India",
  email: "info@irillic.com",
  phone: "+91 7624973228",
  phoneHref: "tel:+917624973228",
} as const;
