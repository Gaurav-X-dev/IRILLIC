import { z } from "zod";
import { isSafePublicUrl } from "@/lib/safe-url";

const safeUrl = z
  .string()
  .refine(
    isSafePublicUrl,
    "Use a safe relative, HTTP(S), email or telephone URL",
  );
const link = z.object({ label: z.string(), href: safeUrl });

export const homeContentSchema = z.object({
  contactForm: z.object({
    submitLabel: z.string(),
    successMessage: z.string(),
    resetLabel: z.string(),
    nameLabel: z.string(),
    organisationLabel: z.string(),
    emailLabel: z.string(),
    topicLabel: z.string(),
    topicPlaceholder: z.string(),
    topics: z.array(z.string()),
    messageLabel: z.string(),
    messageError: z.string(),
    consentText: z.string(),
    consentError: z.string(),
  }),
  sections: z.object({
    endorsement: z.object({
      ariaLabel: z.string(),
      label: z.string(),
      text: z.string(),
      image: z.string(),
      imageAlt: z.string(),
      linkLabel: z.string(),
    }),
    pillars: z.object({ label: z.string(), title: z.string() }),
    performance: z.object({
      label: z.string(),
      title: z.string(),
      text: z.string(),
      link,
      certification: z.object({
        label: z.string(),
        prefix: z.string(),
        value: z.number(),
        unit: z.string(),
        text: z.string(),
      }),
    }),
    divisions: z.object({
      label: z.string(),
      title: z.string(),
      link,
      itemLinkLabel: z.string(),
    }),
    clinical: z.object({
      label: z.string(),
      title: z.string(),
      itemLinkLabel: z.string(),
      itemLinkHref: z.string(),
    }),
    media: z.object({
      label: z.string(),
      title: z.string(),
      link,
      documentHref: z.string(),
    }),
    global: z.object({
      label: z.string(),
      title: z.string(),
      image: z.string(),
      imageAlt: z.string(),
      link,
      addressTitle: z.string(),
      addressText: z.string(),
    }),
    contact: z.object({
      label: z.string(),
      title: z.string(),
      text: z.string(),
    }),
  }),
  caseStudies: z.array(
    z.object({
      wide: z.boolean(),
      image: z.string(),
      alt: z.string(),
      label: z.string(),
      title: z.string(),
      text: z.string().optional(),
    }),
  ),
  mediaPanels: z.array(
    z.object({
      image: z.string(),
      title: z.string(),
      tag: z.string(),
      href: z.string(),
      external: z.boolean(),
    }),
  ),
  globalFacts: z.array(z.object({ label: z.string(), value: z.string() })),
  slides: z
    .array(
      z.object({
        kicker: z.string(),
        title: z.string(),
        text: z.string(),
        cta: link,
        image: z.string(),
        tab: z.string(),
        tabLabel: z.string(),
      }),
    )
    .min(1),
  pillars: z
    .array(
      z.object({
        num: z.string(),
        icon: z.enum(["aperture", "shield", "factory", "globe"]),
        title: z.string(),
        text: z.string(),
        link,
      }),
    )
    .min(1),
  figures: z
    .array(
      z.object({
        label: z.string(),
        value: z.number().nonnegative(),
        unit: z.string(),
        text: z.string(),
      }),
    )
    .min(1),
  divisions: z
    .array(
      z.object({
        label: z.string(),
        title: z.string(),
        text: z.string(),
        image: z.string(),
        size: z.tuple([z.number().positive(), z.number().positive()]),
        light: z.boolean(),
        href: z.string(),
      }),
    )
    .min(1),
  specialtyLinks: z.array(z.string()),
  documents: z.array(
    z.object({ cat: z.string(), title: z.string(), format: z.string() }),
  ),
});

const textCard = z.object({ title: z.string(), text: z.string() });
export const aboutContentSchema = z.object({
  mothersonHealthUrl: z.string().url(),
  hero: z.object({
    tag: z.string(),
    title: z.string(),
    summary: z.string(),
    image: z.string(),
    imageAlt: z.string(),
  }),
  navigation: z.array(z.object({ id: z.string(), label: z.string() })),
  story: z.object({
    label: z.string(),
    title: z.string(),
    paragraphs: z.array(z.string()).min(2),
  }),
  identity: z.object({
    label: z.string(),
    title: z.string(),
    text: z.string(),
    logo: z.string(),
    logoAlt: z.string(),
    caption: z.string(),
  }),
  synergyIntro: z.object({
    label: z.string(),
    title: z.string(),
    text: z.string(),
    image: z.string(),
    imageAlt: z.string(),
    linkLabel: z.string(),
  }),
  leadershipIntro: z.object({
    label: z.string(),
    title: z.string(),
    text: z.string(),
  }),
  qualityIntro: z.object({
    label: z.string(),
    title: z.string(),
    text: z.string(),
    linkLabel: z.string(),
    linkHref: z.string(),
  }),
  cta: z.object({
    title: z.string(),
    text: z.string(),
    primary: link,
    secondary: link,
  }),
  milestones: z.array(textCard),
  identityPoints: z.array(textCard),
  synergy: z.array(
    textCard.extend({ icon: z.enum(["cpu", "factory", "globe", "award"]) }),
  ),
  certifications: z.array(
    textCard.extend({
      icon: z.enum(["shield", "check", "cpu", "flag"]),
      label: z.string(),
    }),
  ),
  leaders: z.array(
    z.object({
      mono: z.string(),
      group: z.enum(["Leadership", "Scientific Advisory Board"]),
      role: z.string(),
      focusLine: z.string(),
      bio: z.string(),
      focus: z.array(z.string()),
      image: z.string().optional(),
      alt: z.string().optional(),
    }),
  ),
});

export const productCardContentSchema = z.object({
  anchor: z.string(),
  approach: z.string(),
  image: z.string(),
  imageAlt: z.string(),
  chips: z.array(z.string()),
  features: z.array(z.string()),
  primary: link,
  secondary: link.extend({ icon: z.enum(["download", "arrow"]) }),
});

export const contactContentSchema = z.object({
  pageCopy: z.object({
    hero: z.object({ tag: z.string(), title: z.string(), summary: z.string() }),
    breadcrumbs: z.array(
      z.object({ label: z.string(), href: safeUrl.optional() }),
    ),
    requiredIntro: z.string(),
    requiredSuffix: z.string(),
    formFields: z.record(z.string(), z.string()),
    systemOptions: z.array(z.object({ value: z.string(), label: z.string() })),
    sectionAriaLabel: z.string(),
    headquartersLabel: z.string(),
    headquartersTitle: z.string(),
    network: z.object({
      label: z.string(),
      title: z.string(),
      text: z.string(),
      image: z.string(),
      imageAlt: z.string(),
    }),
    form: z.object({
      submitLabel: z.string(),
      successMessage: z.string(),
      resetLabel: z.string(),
      label: z.string(),
      title: z.string(),
    }),
    enquiries: z.object({ label: z.string(), title: z.string() }),
  }),
  headquarters: z.object({
    company: z.string(),
    address: z.string(),
    email: z.string().email(),
    phone: z.string(),
    phoneHref: z.string(),
  }),
  network: z.array(
    z.object({
      icon: z.enum(["globe", "users", "link"]),
      label: z.string(),
      href: z.string().url(),
    }),
  ),
  enquiries: z.array(
    textCard.extend({
      icon: z.enum(["sliders", "users", "book"]),
      subject: z.string(),
    }),
  ),
  departments: z.array(z.string()),
});

const iconTextCard = textCard.extend({ icon: z.string() });
export const lnmDetailContentSchema = productCardContentSchema.extend({
  pageCopy: z.object({
    breadcrumbs: z.array(
      z.object({ label: z.string(), href: z.string().optional() }),
    ),
    certificationsLabel: z.string(),
    primary: link,
    secondary: link,
    navigation: z.array(z.object({ id: z.string(), label: z.string() })),
    specs: z.object({
      label: z.string(),
      title: z.string(),
      tabsLabel: z.string(),
    }),
    workflow: z.object({ label: z.string(), title: z.string() }),
    compatibility: z.object({
      label: z.string(),
      title: z.string(),
      text: z.string(),
      link,
    }),
    downloads: z.object({ label: z.string(), title: z.string(), link }),
    cta: z.object({
      title: z.string(),
      text: z.string(),
      primary: link,
      secondary: link,
    }),
  }),
  hero: z.object({
    tag: z.string(),
    title: z.string(),
    summary: z.string(),
    views: z.array(
      z.object({
        src: z.string(),
        alt: z.string(),
        label: z.string(),
        width: z.number().positive(),
        height: z.number().positive(),
      }),
    ),
    badges: z.array(z.string()),
    keySpecs: z.array(z.object({ label: z.string(), value: z.string() })),
  }),
  specificationTabs: z.array(
    z.object({
      id: z.string(),
      icon: z.enum(["aperture", "eye", "sliders", "droplet"]),
      label: z.string(),
      title: z.string(),
      intro: z.string(),
      notice: z.string().optional(),
      rows: z.array(z.tuple([z.string(), z.string()])),
    }),
  ),
  workflow: z.array(
    iconTextCard.extend({ icon: z.enum(["droplet", "zap", "eye"]) }),
  ),
  compatibility: z.array(
    iconTextCard.extend({
      icon: z.enum(["monitor", "layers", "video", "users"]),
    }),
  ),
  downloads: z.array(
    z.object({
      cat: z.string(),
      title: z.string(),
      meta: z.string(),
      href: z.string(),
    }),
  ),
});

export const productsPageContentSchema = z.object({
  hero: z.object({ tag: z.string(), title: z.string(), summary: z.string() }),
  portfolio: z.object({ label: z.string(), title: z.string() }),
  comparison: z.object({
    label: z.string(),
    title: z.string(),
    text: z.string(),
    caption: z.string(),
    featureLabel: z.string(),
    first: z.object({ title: z.string(), subtitle: z.string() }),
    second: z.object({ title: z.string(), subtitle: z.string() }),
    yesLabel: z.string(),
  }),
  quick: z.object({
    ariaLabel: z.string(),
    label: z.string(),
    format: z.string(),
    href: z.string(),
    allLabel: z.string(),
    allHref: z.string(),
  }),
  cta: z.object({
    title: z.string(),
    text: z.string(),
    primary: link,
    secondary: link,
  }),
  matrix: z.array(
    z.object({
      group: z.string(),
      rows: z.array(z.tuple([z.string(), z.string(), z.string()])),
    }),
  ),
  quickDownloads: z.array(z.string()),
});

const breadcrumbSchema = z.object({
  label: z.string(),
  href: safeUrl.optional(),
});
export const listingPageContentSchema = z.object({
  hero: z.object({ tag: z.string(), title: z.string(), summary: z.string() }),
  cta: z.object({
    title: z.string(),
    text: z.string(),
    primary: link,
    secondary: link,
  }),
  breadcrumbs: z.array(breadcrumbSchema),
  sectionTitle: z.string(),
  evidenceNote: z.string(),
  applications: z
    .object({
      figureCaption: z.string(),
      rationaleLabel: z.string(),
      benefitsLabel: z.string(),
      workflowLabel: z.string(),
      literatureLabel: z.string(),
      recommendedLabel: z.string(),
      defaultSystemLabel: z.string(),
      demoLabel: z.string(),
      demoHref: safeUrl,
      tabsLabel: z.string(),
      publicationLabel: z.string(),
      publicationNewTabLabel: z.string(),
    })
    .optional(),
  resources: z
    .object({
      searchLabel: z.string(),
      searchPlaceholder: z.string(),
      filterLabel: z.string(),
      showingTemplate: z.string(),
      sortLabel: z.string(),
      sortNewest: z.string(),
      sortOldest: z.string(),
      sortAz: z.string(),
      emptyTitle: z.string(),
      emptyText: z.string(),
      requestLabel: z.string(),
      requestHref: safeUrl,
      publicationAction: z.string(),
      videoAction: z.string(),
      downloadAction: z.string(),
      newTabLabel: z.string(),
      filters: z.array(
        z.object({
          type: z.enum(["all", "ifu", "study", "paper", "video"]),
          hash: z.string(),
          label: z.string(),
        }),
      ),
      typeLabels: z.object({
        ifu: z.string(),
        study: z.string(),
        paper: z.string(),
        video: z.string(),
      }),
    })
    .optional(),
});

const navLinkSchema = z.object({
  label: z.string(),
  href: safeUrl,
  external: z.boolean().optional(),
});
export const siteChromeContentSchema = z.object({
  megaMenu: z.array(
    z.object({
      key: z
        .string()
        .trim()
        .min(1)
        .max(60)
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Use a lowercase key such as technologies",
        ),
      label: z.string(),
      heading: z.string(),
      intro: z.string(),
      cta: navLinkSchema,
      columns: z.tuple([
        z.object({ title: z.string(), links: z.array(navLinkSchema) }),
        z.object({ title: z.string(), links: z.array(navLinkSchema) }),
      ]),
      feature: z.object({
        image: z.string(),
        href: z.string(),
        label: z.string(),
        title: z.string(),
        cta: z.string(),
      }),
      downloadsLabel: z.string(),
      match: z.array(z.string()),
    }),
  ),
  megaDownloads: z.array(navLinkSchema),
  searchChips: z.array(z.object({ label: z.string(), query: z.string() })),
  searchIndex: z.array(
    z.object({
      title: z.string(),
      section: z.string(),
      href: z.string(),
      keywords: z.string(),
    }),
  ),
  footerColumns: z.array(
    z.object({ title: z.string(), links: z.array(navLinkSchema) }),
  ),
  legalLinks: z.array(navLinkSchema),
  contact: z.object({
    company: z.string(),
    address: z.string(),
    email: z.string().email(),
    phone: z.string(),
    phoneHref: z.string(),
  }),
});
export type SiteChromeContent = z.infer<typeof siteChromeContentSchema>;

export function validateKnownCmsContent(
  type: string,
  slug: string,
  content: unknown,
) {
  if (type === "page") {
    const schemas: Record<string, z.ZodTypeAny> = {
      home: homeContentSchema,
      "about-us": aboutContentSchema,
      products: productsPageContentSchema,
      contact: contactContentSchema,
      "clinical-applications": listingPageContentSchema,
      "clinical-resources": listingPageContentSchema,
      "site-chrome": siteChromeContentSchema,
    };
    return schemas[slug]?.parse(content) ?? content;
  }
  if (type === "product")
    return (
      slug === "irillic-l-nm"
        ? lnmDetailContentSchema
        : productCardContentSchema
    ).parse(content);
  return content;
}
