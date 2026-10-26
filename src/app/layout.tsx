import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SiteChrome } from "@/components/layout/site-chrome";
import { cmsService } from "@/services/cms.service";
import { applyGlobalContact, getBranding } from "@/lib/branding";
import { siteChromeContentSchema } from "@/validations/public-content.validation";
import "@/app/globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBranding();
  return {
    title: {
      default: branding.seoTitle,
      template: `%s | ${branding.siteName}`,
    },
    description: branding.seoDescription,
    keywords: branding.seoKeywords,
    icons: { icon: branding.favicon },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const { themeColor } = await getBranding();
  return { themeColor };
}

/* Enables Theme 1 scroll reveals only when JavaScript runs (no hidden content without JS) */
const enableJsClass = "document.documentElement.classList.add('js');";

export default async function RootLayout({
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: enableJsClass }} />
      </head>
      <body className="font-sans antialiased">
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
      </body>
    </html>
  );
}
