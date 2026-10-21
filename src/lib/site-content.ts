import { Droplet, HeartPulse, Scan, Target } from "lucide-react";
import type { Leader, Resource, ResourceType, Specialty } from "@/types/site.types";

/** PubMed search link for a publication title */
export function pubmedUrl(title: string): string {
  return `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(title).replace(/%20/g, "+")}`;
}

/* -------------------------------------------------------------------------
   Leadership (shown by role; add names and approved photographs before go-live)
   ------------------------------------------------------------------------- */
export const LEADERS: Leader[] = [
  {
    mono: "CEO",
    group: "Leadership",
    role: "Chief Executive Officer",
    focusLine: "Strategy, growth & group alignment",
    bio: "Leads Irillic's strategy and growth, aligning the company's roadmap with Motherson Health & Medical and building partnerships with hospitals and clinical institutions across India.",
    focus: ["Corporate strategy & growth", "Group and partner alignment", "Market access & expansion"],
  },
  {
    mono: "CTO",
    group: "Leadership",
    role: "Chief Technology Officer",
    focusLine: "Optics, imaging & software",
    bio: "Directs the engineering of Irillic's near-infrared optics, imaging sensors and software, from early research through to production-ready surgical systems.",
    focus: ["NIR optics & sensor engineering", "Image processing & software", "Product roadmap"],
  },
  {
    mono: "HCA",
    group: "Leadership",
    role: "Head of Clinical Affairs",
    focusLine: "Clinical evidence & education",
    bio: "Works with surgeons and institutions to build clinical evidence, develop specialty protocols and deliver training for confident adoption of fluorescence-guided surgery.",
    focus: ["Clinical protocols & evidence", "Surgeon training programmes", "Key opinion leader engagement"],
  },
  {
    mono: "QRA",
    group: "Leadership",
    role: "Head of Quality & Regulatory Affairs",
    focusLine: "Compliance & product safety",
    bio: "Owns Irillic's ISO 13485:2016 quality management system and regulatory compliance, ensuring every system is designed, built and supported to medical-device standards.",
    focus: ["ISO 13485:2016 QMS", "Regulatory submissions & compliance", "Post-market surveillance"],
  },
  {
    mono: "SO",
    group: "Scientific Advisory Board",
    role: "Scientific Advisor, Surgical Oncology",
    focusLine: "Sentinel node & margin guidance",
    bio: "Advises on oncological applications of ICG fluorescence, including sentinel lymph node mapping and intraoperative margin assessment.",
    focus: ["Sentinel lymph node mapping", "Tumour localisation", "Oncology protocols"],
  },
  {
    mono: "MIS",
    group: "Scientific Advisory Board",
    role: "Scientific Advisor, Minimally Invasive Surgery",
    focusLine: "Laparoscopic fluorescence workflows",
    bio: "Guides the development of laparoscopic fluorescence workflows, including perfusion assessment and biliary visualisation.",
    focus: ["Anastomotic perfusion", "Fluorescence cholangiography", "OR integration"],
  },
  {
    mono: "PRS",
    group: "Scientific Advisory Board",
    role: "Scientific Advisor, Plastic & Reconstructive Surgery",
    focusLine: "Flap & perfusion assessment",
    bio: "Advises on perfusion assessment in reconstructive surgery, from flap viability to lymphatic imaging.",
    focus: ["Flap viability", "Microvascular perfusion", "Lymphatic imaging"],
  },
];

/* -------------------------------------------------------------------------
   Clinical applications (references are independent ICG literature)
   ------------------------------------------------------------------------- */
export const SPECIALTIES: Specialty[] = [
  {
    key: "oncology",
    name: "Surgical Oncology",
    icon: Target,
    image: "/images/theme/case-sentinel-node.svg",
    alt: "Fluorescence lymphatic map with a glowing sentinel node",
    rationale:
      "ICG fluorescence lets surgeons follow lymphatic channels to the sentinel node in real time, without radioisotopes or nuclear medicine logistics. Fluorescence can also support assessment of tumour location and margins during resection.",
    benefits: [
      "Sentinel lymph node mapping in breast, head & neck and melanoma",
      "Radiation-free alternative to gamma probes",
      "Visual lymphatic pathway tracing for targeted dissection",
      "Support for intraoperative tumour margin assessment",
    ],
    steps: [
      "ICG is injected peritumorally or subdermally before incision.",
      "Lymphatic channels are followed under NIR to the first draining node.",
      "The fluorescent node is excised and confirmed ex vivo under NIR.",
    ],
    references: [
      {
        authors: "Kitai T, Inomoto T, Miwa M, Shikayama T.",
        title: "Fluorescence navigation with indocyanine green for detecting sentinel lymph nodes in breast cancer",
        journal: "Breast Cancer. 2005;12(3):211–215.",
      },
      {
        authors: "Alander JT, Kaartinen I, Laakso A, et al.",
        title: "A review of indocyanine green fluorescent imaging in surgery",
        journal: "Int J Biomed Imaging. 2012;2012:940585.",
      },
    ],
    system: { label: "Irillic nm", href: "/products#nm" },
  },
  {
    key: "reconstructive",
    name: "Plastic & Reconstructive Surgery",
    icon: HeartPulse,
    image: "/images/theme/case-perfusion.svg",
    alt: "Fluorescence perfusion image showing well and poorly perfused tissue",
    rationale:
      "Clinical judgement alone can misjudge tissue perfusion. ICG angiography gives an objective, real-time view of flap and skin perfusion, so poorly perfused tissue can be addressed before closure.",
    benefits: [
      "Flap viability assessment in free and pedicled flaps",
      "Microvascular perfusion verification after anastomosis",
      "Mastectomy skin-flap evaluation in breast reconstruction",
      "Lymphography to plan lymphaticovenous anastomosis",
    ],
    steps: [
      "ICG is given intravenously after flap inset or anastomosis.",
      "Perfusion is observed under NIR as the dye arrives in the tissue.",
      "Areas with poor fluorescence are reviewed and managed before closure.",
    ],
    references: [
      {
        authors: "Phillips BT, Lanier ST, Conkling N, et al.",
        title: "Intraoperative perfusion techniques can accurately predict mastectomy skin flap necrosis in breast reconstruction: results of a prospective trial",
        journal: "Plast Reconstr Surg. 2012;129(5):778e–788e.",
      },
      {
        authors: "Komorowska-Timek E, Gurtner GC.",
        title: "Intraoperative perfusion mapping with laser-assisted indocyanine green imaging can predict and prevent complications in immediate breast reconstruction",
        journal: "Plast Reconstr Surg. 2010;125(4):1065–1073.",
      },
    ],
    system: { label: "Irillic nm", href: "/products#nm" },
  },
  {
    key: "gastro",
    name: "Gastrointestinal Surgery",
    icon: Scan,
    image: "/images/theme/case-laparoscopic.svg",
    alt: "Laparoscopic view with fluorescence overlay",
    rationale:
      "Adequate blood supply is essential to anastomotic healing. Real-time fluorescence angiography lets surgeons evaluate perfusion at the planned resection line, supporting decisions aimed at reducing anastomotic leak risk. It also helps visualise biliary anatomy.",
    benefits: [
      "Real-time evaluation of anastomotic blood supply",
      "Supports decisions aimed at reducing anastomotic leak risk",
      "Fluorescence cholangiography of extrahepatic bile ducts",
      "Liver segment and tumour identification",
    ],
    steps: [
      "ICG is given intravenously before transection or anastomosis.",
      "Bowel perfusion is assessed under NIR at the proposed resection margin.",
      "The resection line is confirmed or adjusted before the anastomosis is completed.",
    ],
    references: [
      {
        authors: "Jafari MD, Wexner SD, Martz JE, et al.",
        title: "Perfusion assessment in laparoscopic left-sided/anterior resection (PILLAR II): a multi-institutional study",
        journal: "J Am Coll Surg. 2015;220(1):82–92.",
      },
      {
        authors: "Ishizawa T, Bandai Y, Ijichi M, et al.",
        title: "Fluorescent cholangiography illuminating the biliary tree during laparoscopic cholecystectomy",
        journal: "Br J Surg. 2010;97(9):1369–1377.",
      },
    ],
    system: { label: "Irillic L nm", href: "/products/irillic-l-nm" },
  },
  {
    key: "urology",
    name: "Urology & Gynaecology",
    icon: Droplet,
    image: "/images/theme/specialty-urology.svg",
    alt: "Fluorescence image highlighting both ureters",
    rationale:
      "In pelvic surgery, fluorescence helps identify critical structures and lymphatic drainage. ICG-guided sentinel node mapping supports staging in gynaecological cancers, and ureteral visualisation helps protect the ureters during complex dissection.",
    benefits: [
      "Ureteral identification during pelvic dissection",
      "Lymphatic drainage tracking and sentinel node mapping",
      "Staging support in endometrial and cervical cancers",
      "Renal perfusion assessment in partial nephrectomy",
    ],
    steps: [
      "ICG is injected into the cervix for nodal mapping, or delivered intra-ureterally for ureter visualisation.",
      "Lymphatic pathways or ureters are identified laparoscopically under NIR.",
      "Sentinel nodes are retrieved while critical structures stay visible throughout dissection.",
    ],
    references: [
      {
        authors: "Rossi EC, Kowalski LD, Scalici J, et al.",
        title: "A comparison of sentinel lymph node biopsy to lymphadenectomy for endometrial cancer staging (FIRES trial): a multicentre, prospective, cohort study",
        journal: "Lancet Oncol. 2017;18(3):384–392.",
      },
      {
        authors: "Siddighi S, Yune JJ, Hardesty J.",
        title: "Indocyanine green for intraoperative localization of ureter",
        journal: "Am J Obstet Gynecol. 2014;211(4):436.e1–436.e2.",
      },
    ],
    system: { label: "Irillic L nm", href: "/products/irillic-l-nm" },
  },
];

/* -------------------------------------------------------------------------
   Resource library (file sizes / years for Irillic documents are sample values)
   ------------------------------------------------------------------------- */
export const RESOURCE_LABELS: Record<ResourceType, string> = {
  ifu: "Instructions for Use",
  study: "Clinical Study",
  paper: "Whitepaper",
  video: "Video Guide",
};

export const RESOURCE_FILTERS: { type: ResourceType | "all"; label: string; hash: string }[] = [
  { type: "all", label: "All", hash: "all" },
  { type: "ifu", label: "Instructions for Use (IFU)", hash: "ifu" },
  { type: "study", label: "Clinical Studies", hash: "studies" },
  { type: "paper", label: "Whitepapers", hash: "whitepapers" },
  { type: "video", label: "Video Guides", hash: "videos" },
];

export const RESOURCES: Resource[] = [
  { type: "ifu", title: "Irillic nm: Instructions for Use", description: "Safety information, set-up, operation and maintenance for the open-surgery system.", year: 2026, meta: "PDF · 3.2 MB", href: "/docs/irillic-nm-ifu.pdf" },
  { type: "ifu", title: "Irillic L nm: Instructions for Use", description: "Safety information, set-up, operation and maintenance for the laparoscopic system.", year: 2026, meta: "PDF · 4.1 MB", href: "/docs/irillic-l-nm-ifu.pdf" },
  { type: "ifu", title: "ICG Imaging Quick-Start Guide", description: "A one-page guide to imaging modes and first-case set-up for both systems.", year: 2025, meta: "PDF · 1.1 MB", href: "/docs/icg-quick-start-guide.pdf" },
  { type: "ifu", title: "Irillic L nm: Cleaning & Reprocessing Guide", description: "Validated cleaning, disinfection and sterilization steps for each component.", year: 2026, meta: "PDF · 1.6 MB", href: "/docs/irillic-l-nm-reprocessing-guide.pdf" },
  { type: "ifu", title: "Irillic nm: Product Spec Sheet", description: "Technical specifications and system configuration for Irillic nm.", year: 2026, meta: "PDF · 0.8 MB", href: "/docs/irillic-nm-spec-sheet.pdf" },
  { type: "ifu", title: "Irillic L nm: Product Spec Sheet", description: "Technical specifications and system configuration for Irillic L nm.", year: 2026, meta: "PDF · 0.9 MB", href: "/docs/irillic-l-nm-spec-sheet.pdf" },
  { type: "study", title: "Perfusion assessment in laparoscopic left-sided/anterior resection (PILLAR II): a multi-institutional study", description: "Jafari MD, Wexner SD, Martz JE, et al. J Am Coll Surg.", year: 2015, meta: "Journal article" },
  { type: "study", title: "A comparison of sentinel lymph node biopsy to lymphadenectomy for endometrial cancer staging (FIRES trial)", description: "Rossi EC, Kowalski LD, Scalici J, et al. Lancet Oncol.", year: 2017, meta: "Journal article" },
  { type: "study", title: "Fluorescent cholangiography illuminating the biliary tree during laparoscopic cholecystectomy", description: "Ishizawa T, Bandai Y, Ijichi M, et al. Br J Surg.", year: 2010, meta: "Journal article" },
  { type: "study", title: "Intraoperative perfusion techniques can accurately predict mastectomy skin flap necrosis in breast reconstruction", description: "Phillips BT, Lanier ST, Conkling N, et al. Plast Reconstr Surg.", year: 2012, meta: "Journal article" },
  { type: "study", title: "Fluorescence navigation with indocyanine green for detecting sentinel lymph nodes in breast cancer", description: "Kitai T, Inomoto T, Miwa M, Shikayama T. Breast Cancer.", year: 2005, meta: "Journal article" },
  { type: "study", title: "A review of indocyanine green fluorescent imaging in surgery", description: "Alander JT, Kaartinen I, Laakso A, et al. Int J Biomed Imaging.", year: 2012, meta: "Review article" },
  { type: "paper", title: "ICG Fluorescence Imaging: Principles for Surgical Teams", description: "How near-infrared fluorescence works, and what it means for everyday surgical practice.", year: 2025, meta: "PDF · 2.3 MB", href: "/docs/whitepaper-icg-principles.pdf" },
  { type: "paper", title: "Building a Fluorescence-Guided Surgery Programme", description: "A practical framework for hospitals introducing ICG imaging across specialties.", year: 2026, meta: "PDF · 1.8 MB", href: "/docs/whitepaper-fgs-programme.pdf" },
  { type: "paper", title: "Radiation-Free Sentinel Node Mapping: Workflow Guide", description: "Step-by-step workflow for ICG-guided sentinel node mapping in surgical oncology.", year: 2025, meta: "PDF · 1.5 MB", href: "/docs/whitepaper-sln-workflow.pdf" },
  { type: "video", title: "Setting Up Irillic L nm in the OR", description: "Connecting the system to your laparoscopy stack and preparing for the first case.", year: 2026, meta: "Video · 6 min", href: "/docs/video-l-nm-setup.mp4" },
  { type: "video", title: "Irillic nm: Sentinel Node Mapping Workflow", description: "A walkthrough of ICG-guided sentinel node mapping with the open-surgery system.", year: 2025, meta: "Video · 8 min", href: "/docs/video-nm-sln-workflow.mp4" },
  { type: "video", title: "Switching Imaging Modes", description: "Using white light, NIR overlay and monochrome NIR views effectively.", year: 2026, meta: "Video · 3 min", href: "/docs/video-imaging-modes.mp4" },
];
