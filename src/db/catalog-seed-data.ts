/**
 * First-install bootstrap records only. Public routes never import this file;
 * after seeding, every value is read from PostgreSQL and edited through CMS.
 */
export const LEADER_SEEDS = [
  {
    mono: "CEO",
    group: "Leadership",
    role: "Chief Executive Officer",
    focusLine: "Strategy, growth & group alignment",
    bio: "Leads Irillic's strategy, growth and partnerships with hospitals and clinical institutions.",
    focus: ["Corporate strategy", "Partner alignment", "Market expansion"],
  },
  {
    mono: "CTO",
    group: "Leadership",
    role: "Chief Technology Officer",
    focusLine: "Optics, imaging & software",
    bio: "Directs engineering of near-infrared optics, imaging sensors and surgical software.",
    focus: ["NIR optics", "Image processing", "Product roadmap"],
  },
  {
    mono: "HCA",
    group: "Leadership",
    role: "Head of Clinical Affairs",
    focusLine: "Clinical evidence & education",
    bio: "Works with surgeons and institutions to develop evidence, protocols and training.",
    focus: ["Clinical protocols", "Surgeon training", "KOL engagement"],
  },
  {
    mono: "QRA",
    group: "Leadership",
    role: "Head of Quality & Regulatory Affairs",
    focusLine: "Compliance & product safety",
    bio: "Owns quality systems and regulatory compliance across the product lifecycle.",
    focus: ["ISO 13485", "Regulatory submissions", "Post-market safety"],
  },
];

export const APPLICATION_SEEDS = [
  {
    key: "oncology",
    name: "Surgical Oncology",
    icon: "target",
    image: "/images/theme/case-sentinel-node.svg",
    alt: "Fluorescence lymphatic map with a highlighted sentinel node",
    rationale:
      "ICG fluorescence supports real-time lymphatic mapping and intraoperative assessment.",
    benefits: [
      "Sentinel node mapping",
      "Visual pathway tracing",
      "Margin assessment support",
    ],
    steps: ["Administer ICG", "Follow fluorescence", "Confirm target tissue"],
    references: [],
    system: { label: "Irillic nm", href: "/products#nm" },
  },
  {
    key: "reconstructive",
    name: "Plastic & Reconstructive Surgery",
    icon: "heart-pulse",
    image: "/images/theme/case-perfusion.svg",
    alt: "Fluorescence perfusion assessment",
    rationale:
      "ICG angiography gives a real-time view of flap and skin perfusion.",
    benefits: [
      "Flap assessment",
      "Perfusion verification",
      "Lymphatic imaging",
    ],
    steps: ["Administer ICG", "Observe perfusion", "Review low-flow areas"],
    references: [],
    system: { label: "Irillic nm", href: "/products#nm" },
  },
  {
    key: "gastro",
    name: "Gastrointestinal Surgery",
    icon: "scan",
    image: "/images/theme/case-laparoscopic.svg",
    alt: "Laparoscopic fluorescence overlay",
    rationale:
      "Fluorescence angiography supports assessment of bowel perfusion and biliary anatomy.",
    benefits: [
      "Perfusion assessment",
      "Resection-line review",
      "Biliary visualisation",
    ],
    steps: ["Administer ICG", "Assess under NIR", "Confirm the surgical plan"],
    references: [],
    system: { label: "Irillic L nm", href: "/products/irillic-l-nm" },
  },
  {
    key: "urology",
    name: "Urology & Gynaecology",
    icon: "droplet",
    image: "/images/theme/specialty-urology.svg",
    alt: "Fluorescence highlighting critical anatomy",
    rationale:
      "Fluorescence supports lymphatic mapping, perfusion assessment and anatomy identification.",
    benefits: [
      "Ureter identification",
      "Sentinel node mapping",
      "Renal perfusion review",
    ],
    steps: ["Administer ICG", "Identify anatomy", "Complete guided dissection"],
    references: [],
    system: { label: "Irillic L nm", href: "/products/irillic-l-nm" },
  },
];

export const RESOURCE_SEEDS = [
  {
    type: "ifu",
    title: "Irillic nm: Instructions for Use",
    description: "Set-up, operation, safety and maintenance guidance.",
    year: 2026,
    meta: "PDF",
    href: "/docs/irillic-nm-ifu.pdf",
  },
  {
    type: "ifu",
    title: "Irillic L nm: Instructions for Use",
    description: "Guidance for the laparoscopic imaging system.",
    year: 2026,
    meta: "PDF",
    href: "/docs/irillic-l-nm-ifu.pdf",
  },
  {
    type: "paper",
    title: "ICG Fluorescence Imaging Principles",
    description: "Clinical education for fluorescence-guided surgery teams.",
    year: 2026,
    meta: "PDF",
    href: "/docs/whitepaper-icg-principles.pdf",
  },
  {
    type: "video",
    title: "Setting Up Irillic L nm in the OR",
    description: "Preparing the system and connecting the imaging stack.",
    year: 2026,
    meta: "Video",
    href: "/docs/video-l-nm-setup.mp4",
  },
];
