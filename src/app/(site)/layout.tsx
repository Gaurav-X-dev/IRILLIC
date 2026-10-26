import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SiteChrome } from "@/components/layout/site-chrome";
import { cmsService } from "@/services/cms.service";
import { applyGlobalContact, getBranding } from "@/lib/branding";
import { siteChromeContentSchema } from "@/validations/public-content.validation";
import "@/app/site.css";

export const dynamic = "force-dynamic";

/**
 * The public website's shell.
 *
 * Header, footer and the Theme 1 stylesheet live here rather than in the root
 * layout, so the administration panel neither downloads the marketing styles
 * nor pays for the navigation query on every page it renders.
 */
export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [chromeEntry, branding] = await Promise.all([
    cmsService.publishedBySlug("page", "site-chrome"),
    getBranding(),
  ]);
  if (!chromeEntry)
    throw new Error("Published global navigation content is missing.");
  const chrome = siteChromeContentSchema.parse(chromeEntry.content);

  return (
    <SiteChrome
      header={
        <Header
          branding={branding}
          megaMenu={chrome.megaMenu}
          megaDownloads={chrome.megaDownloads}
          searchChips={chrome.searchChips}
          searchIndex={chrome.searchIndex}
        />
      }
      footer={
        <Footer
          branding={branding}
          footerColumns={chrome.footerColumns}
          legalLinks={chrome.legalLinks}
          contact={applyGlobalContact(chrome.contact, branding)}
        />
      }
    >
      {children}
    </SiteChrome>
  );
}
