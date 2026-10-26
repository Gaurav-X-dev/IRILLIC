export const HOME_CONTENT = {
  contactForm: {
    submitLabel: "Send enquiry",
    successMessage:
      "Your enquiry has been received. A member of the Irillic team will respond within one business day.",
    resetLabel: "Send another enquiry",
    nameLabel: "Full name",
    organisationLabel: "Organisation",
    emailLabel: "Email",
    topicLabel: "Enquiry type",
    topicPlaceholder: "Select",
    topics: [
      "OR demonstration",
      "Partnership & distribution",
      "Service & support",
      "Media enquiry",
      "Other",
    ],
    messageLabel: "Message",
    messageError: "Please add a short message (at least 10 characters).",
    consentText:
      "I agree that Irillic may use my details to respond to this enquiry, as described in the Privacy Policy.",
    consentError: "Please confirm consent so we can respond.",
  },
  sections: {
    endorsement: {
      ariaLabel: "Group affiliation",
      label: "An enterprise of Motherson Health & Medical",
      text: "Irillic brings the engineering depth, quality culture and global reach of the Motherson Group to surgical imaging.",
      image: "/images/motherson/PTBPO_Motherson.png",
      imageAlt: "Proud to be part of motherson",
      linkLabel: "Motherson Health & Medical",
    },
    pillars: {
      label: "What defines us",
      title: "Four pillars of surgical imaging leadership",
    },
    performance: {
      label: "Performance at a glance",
      title: "Measured in outcomes",
      text: "Every figure represents a surgical team that saw more, and a patient who benefited from it.",
      link: { label: "Corporate brochure", href: "#media" },
      certification: {
        label: "Quality certified",
        prefix: "ISO",
        value: 13485,
        unit: ":2016",
        text: "Certified quality management system for the design and manufacture of medical devices.",
      },
    },
    divisions: {
      label: "Strategic divisions",
      title: "Four divisions. One purpose: to see more in surgery",
      link: { label: "Request an OR demonstration", href: "#contact" },
      itemLinkLabel: "Explore division",
    },
    clinical: {
      label: "Clinical impact",
      title: "Evidence from the operating room",
      itemLinkLabel: "Read case study",
      itemLinkHref: "#contact",
    },
    media: {
      label: "Investors & Media",
      title: "Company updates & literature",
      link: { label: "More downloads", href: "/clinical-resources" },
      documentHref: "/clinical-resources#ifu",
    },
    global: {
      label: "Global presence",
      title: "Headquartered in Bengaluru. Connected through Motherson",
      image: "/images/theme/global-network.svg",
      imageAlt: "Abstract map with connections radiating from Bengaluru",
      link: { label: "Partner with us", href: "#contact" },
      addressTitle: "Looking for a specific Irillic contact?",
      addressText: "Find our corporate office, sales and service details.",
    },
    contact: {
      label: "Contact",
      title: "Let's talk surgical imaging",
      text: "For OR demonstrations, partnerships, media or service enquiries, our team will route your message to the right specialist.",
    },
  },
  caseStudies: [
    {
      wide: true,
      image: "/images/theme/case-sentinel-node.svg",
      alt: "Fluorescence image of lymphatic channels draining to a sentinel lymph node",
      label: "Surgical Oncology · Case study",
      title: "Radiation-free sentinel node mapping in early breast cancer",
      text: "ICG fluorescence visualises lymphatic channels and sentinel nodes in real time, without radioisotopes or a nuclear medicine slot.",
    },
    {
      wide: false,
      image: "/images/theme/case-perfusion.svg",
      alt: "Fluorescence perfusion image of a bowel segment with a demarcation line",
      label: "Gastrointestinal",
      title: "Perfusion assessment before colorectal anastomosis",
    },
    {
      wide: false,
      image: "/images/theme/case-laparoscopic.svg",
      alt: "Laparoscopic view with fluorescence overlay",
      label: "Minimally Invasive",
      title: "Fluorescence overlay in laparoscopic surgery",
    },
  ],
  mediaPanels: [
    {
      image: "/images/theme/panel-sustainability.svg",
      title: "Our ESG ambition",
      tag: "Sustainability",
      href: "/about-us#quality",
      external: false,
    },
    {
      image: "/images/theme/panel-people.svg",
      title: "The Irillic Way",
      tag: "Join us",
      href: "careers",
      external: true,
    },
  ],
  globalFacts: [
    { label: "Corporate headquarters", value: "Bengaluru, India" },
    { label: "Quality system", value: "ISO 13485:2016" },
    { label: "Group network", value: "Motherson Health & Medical" },
  ],
  slides: [
    {
      kicker: "Optical surgical imaging. Designed and made in India.",
      title: "A Global Pioneer in Optical Surgical Imaging",
      text: "Irillic gives surgeons real-time sight of perfusion, vessels and lymphatics through ICG fluorescence and laparoscopic imaging systems, engineered in Bengaluru.",
      cta: { label: "Explore our systems", href: "#divisions" },
      image: "/images/theme/hero-1-operating-room.svg",
      tab: "01 Pioneer",
      tabLabel: "Slide 1: Global pioneer",
    },
    {
      kicker: "ICG fluorescence imaging",
      title: "Seeing the unseen. In real time",
      text: "Radiation-free guidance for sentinel lymph node mapping and tissue perfusion assessment, overlaid live on the surgical view.",
      cta: { label: "See clinical impact", href: "#clinical-impact" },
      image: "/images/theme/hero-2-fluorescence.svg",
      tab: "02 Fluorescence",
      tabLabel: "Slide 2: Fluorescence",
    },
    {
      kicker: "Precision optics",
      title: "Engineered in India. Built for every operating room",
      text: "In-house optics, imaging and software, made under an ISO 13485:2016 certified quality management system.",
      cta: { label: "Our pillars", href: "#company" },
      image: "/images/theme/hero-3-precision-optics.svg",
      tab: "03 Optics",
      tabLabel: "Slide 3: Precision optics",
    },
  ],
  pillars: [
    {
      num: "01",
      icon: "aperture",
      title: "Precision Optics",
      text: "Near-infrared optics, sensors and image processing developed in-house for ultra-sensitive, real-time fluorescence detection.",
      link: { label: "Our technology", href: "#divisions" },
    },
    {
      num: "02",
      icon: "shield",
      title: "Patient Safety",
      text: "Radiation-free ICG guidance with no radioisotopes or nuclear medicine logistics. It's safer for patients and OR teams alike.",
      link: { label: "Clinical impact", href: "#clinical-impact" },
    },
    {
      num: "03",
      icon: "factory",
      title: "Make in India",
      text: "Indigenously engineered and manufactured in Bengaluru with BIRAC support, making advanced surgical imaging accessible.",
      link: { label: "Our presence", href: "#global" },
    },
    {
      num: "04",
      icon: "globe",
      title: "Global Regulatory Compliance",
      text: "An ISO 13485:2016 certified quality management system governing design, manufacture and post-market support.",
      link: { label: "Quality & policies", href: "#media" },
    },
  ],
  figures: [
    {
      label: "Procedures supported",
      value: 5000,
      unit: "+",
      text: "Open and minimally invasive procedures performed with Irillic fluorescence imaging.",
    },
    {
      label: "Surgical centres",
      value: 300,
      unit: "+",
      text: "Hospitals and surgical centres equipped with Irillic systems and trained teams.",
    },
  ],
  divisions: [
    {
      label: "Division 01 · Open Surgery",
      title: "Irillic nm Fluorescence Imaging System",
      text: "Handheld open-surgery imaging with a real-time NIR camera and ultra-sensitive ICG detection.",
      image: "/images/theme/division-open-surgery.svg",
      size: [600, 450],
      light: true,
      href: "#contact",
    },
    {
      label: "Division 02 · Minimally Invasive",
      title: "Irillic L nm Laparoscopic Imaging System",
      text: "Full HD fluorescence overlay integrated into the endoscopic surgical workflow.",
      image: "/images/theme/division-minimally-invasive.svg",
      size: [600, 450],
      light: true,
      href: "#contact",
    },
    {
      label: "Division 03 · Education",
      title: "Clinical Education & Training",
      text: "Structured programmes that help surgical teams build confident, repeatable ICG workflows.",
      image: "/images/theme/division-training.svg",
      size: [800, 500],
      light: false,
      href: "#clinical-impact",
    },
    {
      label: "Division 04 · Service",
      title: "Service & Lifecycle Support",
      text: "Installation, preventive maintenance and on-site support that keep systems OR-ready.",
      image: "/images/theme/division-service.svg",
      size: [800, 500],
      light: false,
      href: "#global",
    },
  ],
  specialtyLinks: [
    "Surgical Oncology",
    "Plastic & Reconstructive",
    "Gastrointestinal",
    "Urology & Gynaecology",
  ],
  documents: [
    {
      cat: "Product literature",
      title: "Irillic nm: Instructions for Use",
      format: "PDF",
    },
    {
      cat: "Product literature",
      title: "Irillic L nm: Instructions for Use",
      format: "PDF",
    },
    { cat: "Corporate", title: "Irillic Corporate Brochure", format: "PDF" },
    { cat: "Media", title: "Media Kit & Brand Assets", format: "ZIP" },
  ],
};

export const ABOUT_CONTENT = {
  mothersonHealthUrl: "https://healthandmedical.motherson.com/",
  hero: {
    tag: "Company",
    title: "Pioneering Optical Precision in Surgical Care",
    summary:
      "Irillic designs and manufactures ICG fluorescence and laparoscopic imaging systems that let surgeons see perfusion, vessels and lymphatics in real time. As an enterprise of Motherson Health & Medical, we pair Indian engineering with the scale and quality culture of a global group.",
    image: "/images/theme/hero-3-precision-optics.svg",
    imageAlt: "Close-up of a precision optical lens",
  },
  navigation: [
    { id: "story", label: "Our Story" },
    { id: "identity", label: "Our Identity" },
    { id: "synergy", label: "Motherson Synergy" },
    { id: "leadership", label: "Leadership" },
    { id: "quality", label: "Quality & Certifications" },
  ],
  story: {
    label: "Our story",
    title: "From an idea in Bengaluru to operating rooms across India",
    paragraphs: [
      "Irillic began with a simple conviction: every surgeon in India should be able to see what fluorescence imaging reveals, without the cost and complexity that kept it out of reach.",
      "Our engineers built near-infrared optics, imaging sensors and software in-house, then worked side by side with surgeons to turn them into systems that fit naturally into real operating rooms. Today Irillic supports open and minimally invasive surgery across oncology, reconstruction, gastrointestinal, urological and gynaecological procedures.",
    ],
  },
  identity: {
    label: "Our identity",
    title: "A Vaastu-compliant identity built on human values",
    text: "Our refreshed logo was designed to be Vaastu compliant while keeping everything that made Irillic recognisable, and to say more about how we care for patients and surgeons.",
    logo: "/images/logo/irillic-logo-blue.png",
    logoAlt:
      "The Irillic logo: bold capital letters with rounded corners and a dot at the top right",
    caption: "Irillic Blue · #0091D0 · RGB 0 145 208 · CMYK 80 30 0 0",
  },
  synergyIntro: {
    label: "The Motherson synergy",
    title: "The reach of a global group. The focus of a specialist",
    text: "Being part of Samvardhana Motherson Group gives Irillic access to world-class engineering, precision manufacturing and global supply chains, so our surgical systems are built with the rigour expected of a global industrial leader.",
    image: "/images/theme/global-network.svg",
    imageAlt: "Abstract map with connections radiating from Bengaluru",
    linkLabel: "Motherson Health & Medical",
  },
  leadershipIntro: {
    label: "Leadership",
    title: "Leadership & Scientific Advisory Board",
    text: "Engineers, clinicians and quality specialists who guide how Irillic designs, validates and supports every system.",
  },
  qualityIntro: {
    label: "Quality & certifications",
    title: "Built to medical-device standards",
    text: "Quality is designed into every Irillic system, from component sourcing to post-market support.",
    linkLabel: "Technical documentation",
    linkHref: "/clinical-resources#ifu",
  },
  cta: {
    title: "Partner with Irillic",
    text: "Whether you are a hospital, distributor or research institution, our team would like to hear from you.",
    primary: { label: "Contact our team", href: "/contact" },
    secondary: { label: "Clinical resources", href: "/clinical-resources" },
  },
  milestones: [
    {
      title: "The beginning",
      text: "An engineering team in Bengaluru sets out to make fluorescence-guided surgery accessible in India.",
    },
    {
      title: "Open-surgery imaging",
      text: "The Irillic nm system brings handheld, real-time NIR fluorescence to the operating table.",
    },
    {
      title: "Minimally invasive surgery",
      text: "The Irillic L nm system extends fluorescence guidance into laparoscopic workflows.",
    },
    {
      title: "Part of Motherson",
      text: "Irillic becomes an enterprise of Motherson Health & Medical, gaining global engineering and manufacturing depth.",
    },
    {
      title: "A new identity",
      text: "A bold, human-centric, Vaastu-compliant identity expresses who we are today.",
    },
  ],
  identityPoints: [
    {
      title: "Original blue, retained",
      text: "Continuity with the Irillic heritage surgeons already know and trust.",
    },
    {
      title: "Capital, bold letters",
      text: "A strong, confident visual impact that reads clearly in every setting.",
    },
    {
      title: "Rounded corners",
      text: "Softness, humility and care for human values, at the heart of patient care.",
    },
    {
      title: "The dot at the top right",
      text: "An optical sensor that establishes our relationship with imaging solutions.",
    },
  ],
  synergy: [
    {
      icon: "cpu",
      title: "World-class engineering",
      text: "Shared expertise in electronics, optics and precision mechanics across Motherson's engineering network.",
    },
    {
      icon: "factory",
      title: "Precision manufacturing",
      text: "Manufacturing discipline and process control that scale from prototype to volume production.",
    },
    {
      icon: "globe",
      title: "Global supply chains",
      text: "Resilient sourcing and logistics that keep systems, spares and consumables available.",
    },
    {
      icon: "award",
      title: "Quality culture",
      text: "A group-wide commitment to quality that reinforces our medical-device QMS.",
    },
  ],
  certifications: [
    {
      icon: "shield",
      label: "Quality management",
      title: "ISO 13485:2016",
      text: "Certified quality management system for the design and manufacture of medical devices.",
    },
    {
      icon: "check",
      label: "Regulatory",
      title: "CDSCO compliance",
      text: "Systems manufactured and supplied in line with India's Medical Devices Rules, overseen by CDSCO.",
    },
    {
      icon: "cpu",
      label: "Innovation support",
      title: "BIRAC",
      text: "Innovation supported by the Biotechnology Industry Research Assistance Council.",
    },
    {
      icon: "flag",
      label: "Indigenous design",
      title: "Make in India",
      text: "Designed, engineered and manufactured in Bengaluru for India and the world.",
    },
  ],
};

export const CONTACT_CONTENT = {
  pageCopy: {
    hero: {
      tag: "Contact",
      title: "Connect with Our Clinical Specialists",
      summary:
        "Request a surgical demonstration in your OR, or reach our Bangalore headquarters for partnerships, service and media. We respond to every enquiry within one business day.",
    },
    breadcrumbs: [{ label: "Home", href: "/" }, { label: "Contact" }],
    requiredIntro: "Fields marked",
    requiredSuffix: "with an asterisk are required.",
    formFields: {
      name: "Full name",
      hospital: "Hospital / Institution",
      department: "Department / Specialty",
      city: "City / State",
      email: "Work email",
      phone: "Phone",
      preferredDate: "Preferred date",
      alternativeDate: "Alternative date",
      system: "System of interest",
      message: "Your clinical challenge",
      select: "Select",
      unsure: "Not sure yet",
      messagePlaceholder:
        "e.g. We want objective perfusion assessment in colorectal cases.",
      consent:
        "I agree that Irillic may use my details to arrange this demonstration, as described in the Privacy Policy.",
    },
    systemOptions: [
      { value: "nm", label: "Irillic nm Fluorescence Imaging System" },
      { value: "lnm", label: "Irillic L nm Laparoscopic Imaging System" },
      { value: "both", label: "Both systems" },
    ],
    sectionAriaLabel: "Contact details and demonstration request",
    headquartersLabel: "Corporate headquarters",
    headquartersTitle: "Bangalore, India",
    network: {
      label: "Global network",
      title: "Motherson Health & Medical",
      text: "As an enterprise of Motherson Health & Medical, Irillic is connected to the Motherson Group's global engineering, manufacturing and supply network.",
      image: "/images/motherson/PTBPO_Motherson.png",
      imageAlt: "Proud to be part of motherson",
    },
    form: {
      submitLabel: "Request Demonstration",
      successMessage:
        "Your demonstration request has been received. A clinical specialist will contact you within one business day to confirm the date and set-up.",
      resetLabel: "Submit another request",
      label: "OR demonstration",
      title: "Request a Surgical Demonstration in Your OR",
    },
    enquiries: { label: "Other enquiries", title: "How can we help" },
  },
  headquarters: {
    company: "IRILLIC Private Limited",
    address: "Bengaluru, Karnataka, India",
    email: "info@irillic.com",
    phone: "+91 80 0000 0000",
    phoneHref: "tel:+918000000000",
  },
  network: [
    {
      icon: "globe",
      label: "Motherson Health & Medical",
      href: "https://healthandmedical.motherson.com/",
    },
    {
      icon: "users",
      label: "Careers at Motherson Health & Medical",
      href: "https://healthandmedical.motherson.com/careers/",
    },
    {
      icon: "link",
      label: "Motherson Group",
      href: "https://www.motherson.com/",
    },
  ],
  enquiries: [
    {
      icon: "sliders",
      title: "Service & support",
      text: "Installation, maintenance and technical support for installed systems.",
      subject: "Service & support enquiry",
    },
    {
      icon: "users",
      title: "Partnerships & distribution",
      text: "Distribution, institutional and research partnerships.",
      subject: "Partnership & distribution enquiry",
    },
    {
      icon: "book",
      title: "Media & communications",
      text: "Press, media kits and corporate communications.",
      subject: "Media enquiry",
    },
  ],
  departments: [
    "Surgical Oncology",
    "Plastic & Reconstructive Surgery",
    "Gastrointestinal Surgery",
    "Urology",
    "Gynaecology",
    "General & Laparoscopic Surgery",
    "Neurosurgery",
    "Other",
  ],
};

export const LNM_DETAIL_CONTENT = {
  pageCopy: {
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Innovations & Systems", href: "/products" },
      { label: "Products", href: "/products" },
      { label: "Irillic L nm" },
    ],
    certificationsLabel: "Certifications",
    primary: {
      label: "Request In-Hospital Demo",
      href: "/contact?system=lnm#form",
    },
    secondary: {
      label: "Download Product Spec Sheet",
      href: "/clinical-resources#ifu",
    },
    navigation: [
      { id: "specs", label: "Specifications" },
      { id: "workflow", label: "Clinical Workflow" },
      { id: "compatibility", label: "OR Compatibility" },
      { id: "downloads", label: "Downloads" },
    ],
    specs: {
      label: "Specifications",
      title: "Engineered for clarity in every mode",
      tabsLabel: "Specification categories",
    },
    workflow: {
      label: "Clinical workflow",
      title: "Three steps to fluorescence-guided surgery",
    },
    compatibility: {
      label: "OR compatibility",
      title: "Works with the OR you already have",
      text: "Irillic L nm is designed to integrate with standard laparoscopy stacks and surgical booms. Your team keeps its familiar set-up and gains fluorescence guidance on top.",
      link: {
        label: "Check compatibility for your OR",
        href: "/contact?system=lnm#form",
      },
    },
    downloads: {
      label: "Downloads",
      title: "Irillic L nm documentation",
      link: { label: "Resource library", href: "/clinical-resources" },
    },
    cta: {
      title: "Bring Irillic L nm to your hospital",
      text: "Book an in-hospital demonstration on your own laparoscopic cases.",
      primary: {
        label: "Request In-Hospital Demo",
        href: "/contact?system=lnm#form",
      },
      secondary: { label: "Compare systems", href: "/products#matrix" },
    },
  },
  hero: {
    tag: "Minimally invasive · Laparoscopic",
    title: "Irillic L nm Laparoscopic Imaging System",
    summary:
      "4K NIR fluorescence for minimally invasive surgery, with dual-mode white-light and ICG overlay on the laparoscopic view. Designed to slot into the laparoscopy stack your team already uses.",
    views: [
      {
        src: "/images/theme/division-minimally-invasive.svg",
        alt: "Irillic L nm laparoscopic imaging tower with NIR laparoscope",
        label: "System",
        width: 600,
        height: 450,
      },
      {
        src: "/images/theme/case-laparoscopic.svg",
        alt: "Laparoscopic view with live ICG fluorescence overlay",
        label: "NIR overlay",
        width: 800,
        height: 500,
      },
      {
        src: "/images/theme/case-perfusion.svg",
        alt: "Perfusion assessment of a bowel segment under NIR fluorescence",
        label: "Perfusion",
        width: 800,
        height: 500,
      },
    ],
    badges: [
      "CE Marked",
      "ISO 13485:2016 QMS",
      "CDSCO Compliant",
      "Make in India",
    ],
    keySpecs: [
      { label: "Imaging", value: "4K + NIR" },
      { label: "Overlay", value: "Real-time" },
      { label: "View modes", value: "3" },
      { label: "OR stack", value: "Standard" },
    ],
  },
  specificationTabs: [
    {
      id: "optical",
      icon: "aperture",
      label: "Optical Performance",
      title: "Optical Performance",
      intro:
        "4K white-light imaging with a dedicated near-infrared channel delivers a crisp laparoscopic view and a clear fluorescence signal.",
      rows: [
        ["White-light imaging", "4K UHD"],
        ["Fluorescence channel", "Near-infrared, optimised for ICG"],
        ["Excitation", "~800 nm NIR"],
        ["Detection", "~830 nm NIR emission band"],
        ["Display modes", "White light · NIR overlay (green) · Monochrome NIR"],
        ["Overlay", "Real-time, fused on the surgical view"],
      ],
    },
    {
      id: "camera",
      icon: "eye",
      label: "Camera & Light Source",
      title: "Camera & Light Source",
      intro:
        "A lightweight camera head and combined light source put fluorescence control in the surgeon's hand.",
      rows: [
        ["Camera head", "Ergonomic, lightweight, with on-head controls"],
        ["Mode switching", "From the camera head or console"],
        ["Light source", "Combined white-light LED and NIR excitation"],
        ["Laparoscope", "NIR-capable optics, per system configuration"],
        ["Video output", "Digital output to OR displays and recorders"],
        ["Capture", "Still image and video recording"],
      ],
    },
    {
      id: "ergonomics",
      icon: "sliders",
      label: "Ergonomics & OR Integration",
      title: "Ergonomics & OR Integration",
      intro:
        "Built to work with the equipment already in your theatre, with minimal set-up time for the team.",
      rows: [
        ["Configuration", "Tower with camera control unit and light source"],
        ["Stack compatibility", "Standard laparoscopy towers and monitors"],
        ["Mounting", "Surgical booms and pendants"],
        ["Set-up", "Plug-and-play connection to existing displays"],
        ["Footprint", "Compact, fits standard OR layouts"],
        ["Training", "On-site onboarding for surgeons and OR staff"],
      ],
    },
    {
      id: "sterilization",
      icon: "droplet",
      label: "Sterilization Guidelines",
      title: "Sterilization Guidelines",
      intro:
        "Reprocess every component only with the methods validated in the Irillic L nm Instructions for Use.",
      notice:
        "Always follow the current Instructions for Use for validated cleaning, disinfection and sterilization methods.",
      rows: [
        ["Laparoscope", "Validated sterilization methods as listed in the IFU"],
        [
          "Camera head & cable",
          "Validated low-temperature reprocessing, as listed in the IFU",
        ],
        ["Light cable", "Cleaning and sterilization per IFU"],
        [
          "Console & light source",
          "Non-sterile; surface cleaning and disinfection",
        ],
        ["Inspection", "Check optics and cables before every procedure"],
        ["Documentation", "Reprocessing records per hospital protocol"],
      ],
    },
  ],
  workflow: [
    {
      icon: "droplet",
      title: "ICG administration",
      text: "A small dose of ICG is given intravenously for perfusion and vascular imaging, or injected locally for lymphatic mapping, according to the specialty protocol.",
    },
    {
      icon: "zap",
      title: "Real-time NIR excitation",
      text: "The light source excites ICG with near-infrared light. It is invisible to the eye, so the surgical view stays natural under white light.",
    },
    {
      icon: "eye",
      title: "High-definition perfusion assessment",
      text: "Fluorescence is captured and overlaid in real time, so the team can assess perfusion, vessels and anatomy before key surgical decisions.",
    },
  ],
  compatibility: [
    {
      icon: "monitor",
      title: "Standard laparoscopy stacks",
      text: "Connects to existing towers and surgical monitors",
    },
    {
      icon: "layers",
      title: "Surgical booms & pendants",
      text: "Mounts alongside your current OR equipment",
    },
    {
      icon: "video",
      title: "Recording & integration",
      text: "Digital video output to OR recording systems",
    },
    {
      icon: "users",
      title: "Team onboarding",
      text: "On-site training for surgeons, nurses and biomedical teams",
    },
  ],
  downloads: [
    {
      cat: "Instructions for Use",
      title: "Irillic L nm: Instructions for Use",
      meta: "PDF · 4.1 MB",
      href: "/docs/irillic-l-nm-ifu.pdf",
    },
    {
      cat: "Specification",
      title: "Irillic L nm: Product Spec Sheet",
      meta: "PDF · 0.9 MB",
      href: "/docs/irillic-l-nm-spec-sheet.pdf",
    },
    {
      cat: "Reprocessing",
      title: "Cleaning & Reprocessing Guide",
      meta: "PDF · 1.6 MB",
      href: "/docs/irillic-l-nm-reprocessing-guide.pdf",
    },
    {
      cat: "Quick start",
      title: "ICG Imaging Quick-Start Guide",
      meta: "PDF · 1.1 MB",
      href: "/docs/icg-quick-start-guide.pdf",
    },
  ],
};

export const PRODUCTS_PAGE_CONTENT = {
  hero: {
    tag: "Surgical systems",
    title: "Advanced Optical Systems for Open & Minimally Invasive Surgery",
    summary:
      "Two Irillic platforms bring real-time ICG fluorescence to every surgical approach, from the open field to the laparoscopic view. Both share one imaging philosophy, one training path and one service network.",
  },
  portfolio: {
    label: "System portfolio",
    title: "Choose the right system for your OR",
  },
  comparison: {
    label: "Feature matrix",
    title: "Side-by-side comparison",
    text: "Key technical characteristics of both systems. Full specifications are available in each system's spec sheet.",
    caption: "Comparison of Irillic nm and Irillic L nm",
    featureLabel: "Feature",
    first: { title: "Irillic nm", subtitle: "Open surgery" },
    second: { title: "Irillic L nm", subtitle: "Minimally invasive" },
    yesLabel: "Yes",
  },
  quick: {
    ariaLabel: "Quick downloads",
    label: "IFU & spec sheets",
    format: "PDF",
    href: "/clinical-resources#ifu",
    allLabel: "All resources",
    allHref: "/clinical-resources",
  },
  cta: {
    title: "See both systems in your OR",
    text: "Our clinical specialists will demonstrate Irillic nm and Irillic L nm on your own cases.",
    primary: { label: "Request a demonstration", href: "/contact#form" },
    secondary: {
      label: "Clinical applications",
      href: "/clinical-applications",
    },
  },
  matrix: [
    {
      group: "Optics & imaging",
      rows: [
        [
          "Optical sensor",
          "NIR-sensitive imaging sensor with dedicated fluorescence channel",
          "Endoscopic camera with combined white-light and NIR channels",
        ],
        [
          "Excitation wavelength",
          "Near-infrared, optimised for ICG absorption (~800 nm)",
          "Near-infrared, optimised for ICG absorption (~800 nm)",
        ],
        [
          "Fluorescence detection",
          "NIR emission band (~830 nm)",
          "NIR emission band (~830 nm)",
        ],
        ["Imaging resolution", "High-definition", "Full HD / 4K"],
      ],
    },
    {
      group: "Display & workflow",
      rows: [
        [
          "Display modes",
          "White light · NIR overlay · Monochrome NIR",
          "White light · NIR overlay · Monochrome NIR",
        ],
        ["Real-time overlay", "__yes__", "__yes__"],
        [
          "Form factor",
          "Handheld camera head, portable cart",
          "Laparoscopic tower with camera control unit",
        ],
        [
          "OR integration",
          "Stand-alone, moves between rooms",
          "Standard laparoscopy stacks and surgical booms",
        ],
      ],
    },
    {
      group: "Compliance & support",
      rows: [
        [
          "Certifications",
          "ISO 13485:2016 QMS · CDSCO",
          "ISO 13485:2016 QMS · CDSCO · CE",
        ],
        [
          "Training & service",
          "On-site clinical training, preventive maintenance",
          "On-site clinical training, preventive maintenance",
        ],
      ],
    },
  ],
  quickDownloads: [
    "Irillic nm IFU",
    "Irillic L nm IFU",
    "Irillic nm spec sheet",
    "Irillic L nm spec sheet",
  ],
};

export const CLINICAL_APPLICATIONS_PAGE_CONTENT = {
  hero: {
    tag: "Clinical applications",
    title: "Precision Guidance Across Multi-Disciplinary Surgeries",
    summary:
      "Real-time ICG fluorescence gives surgeons objective information about perfusion, lymphatic drainage and critical anatomy. Explore how it supports decisions in each specialty, with references to the published literature.",
  },
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Clinical Impact", href: "/clinical-applications" },
    { label: "Clinical Applications" },
  ],
  sectionTitle: "Specialties",
  evidenceNote:
    "References are independent, peer-reviewed publications on ICG fluorescence imaging, provided for clinical education. They are not studies of Irillic systems unless stated. Links open a PubMed search for each title.",
  applications: {
    figureCaption: "NIR fluorescence · Illustrative imaging",
    rationaleLabel: "Clinical rationale",
    benefitsLabel: "Key benefits",
    workflowLabel: "Representative case workflow",
    literatureLabel: "Published clinical literature",
    recommendedLabel: "Recommended system",
    defaultSystemLabel: "View systems",
    demoLabel: "Request a demo",
    demoHref: "/contact#form",
    tabsLabel: "Filter by specialty",
    publicationLabel: "View publication",
    publicationNewTabLabel: "opens PubMed in a new tab",
  },
  cta: {
    title: "Discuss your specialty with our clinical team",
    text: "We'll share specialty-specific protocols and arrange a demonstration on your cases.",
    primary: { label: "Request a demonstration", href: "/contact#form" },
    secondary: {
      label: "Clinical studies",
      href: "/clinical-resources#studies",
    },
  },
};
export const CLINICAL_RESOURCES_PAGE_CONTENT = {
  hero: {
    tag: "Resource library",
    title: "Clinical Evidence, Research & Regulatory Documentation",
    summary:
      "Find instructions for use, specification sheets, whitepapers, video guides and key published studies in one place. Filter by type or search by keyword to find what you need.",
  },
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Clinical Impact", href: "/clinical-applications" },
    { label: "Clinical Resources" },
  ],
  sectionTitle: "Resource library",
  evidenceNote:
    "Clinical studies are independent, peer-reviewed publications on ICG fluorescence imaging, linked through PubMed. IFUs and spec sheets refer to the current product revision.",
  resources: {
    searchLabel: "Search resources",
    searchPlaceholder: "Search papers, IFUs and guides",
    filterLabel: "Filter by type",
    showingTemplate: "Showing {shown} of {total} resources",
    sortLabel: "Sort",
    sortNewest: "Newest first",
    sortOldest: "Oldest first",
    sortAz: "Title A–Z",
    emptyTitle: "No resources match your search.",
    emptyText:
      "Try another keyword, or ask our team for the document you need.",
    requestLabel: "Request a document",
    requestHref: "/contact#form",
    publicationAction: "View Publication",
    videoAction: "Watch Video",
    downloadAction: "Download Document",
    newTabLabel: "opens PubMed in a new tab",
    filters: [
      { type: "all", hash: "all", label: "All" },
      { type: "ifu", hash: "ifu", label: "IFUs" },
      { type: "study", hash: "studies", label: "Clinical studies" },
      { type: "paper", hash: "papers", label: "Whitepapers" },
      { type: "video", hash: "videos", label: "Videos" },
    ],
    typeLabels: {
      ifu: "Instructions for Use",
      study: "Clinical study",
      paper: "Whitepaper",
      video: "Video",
    },
  },
  cta: {
    title: "Can't find a document?",
    text: "Our clinical and regulatory team can share additional technical files on request.",
    primary: { label: "Contact our team", href: "/contact#form" },
    secondary: { label: "View systems", href: "/products" },
  },
};
