import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SiteChrome } from "@/components/layout/site-chrome";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

/* Theme 1 typeface (falls back to Graphik when installed locally) */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "IRILLIC | A Global Pioneer in Optical Surgical Imaging",
    template: "%s | IRILLIC",
  },
  description:
    "Irillic designs and manufactures ICG fluorescence and laparoscopic imaging systems in India, as an enterprise of Motherson Health & Medical.",
  keywords: [
    "IRILLIC",
    "ICG fluorescence imaging",
    "laparoscopic imaging",
    "NIR surgical imaging",
    "Motherson Health & Medical",
  ],
  icons: { icon: "/images/logo/irillic-logo-blue.png" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

/* Enables Theme 1 scroll reveals only when JavaScript runs (no hidden content without JS) */
const enableJsClass = "document.documentElement.classList.add('js');";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: enableJsClass }} />
      </head>
      <body className={`${inter.variable} ${jakarta.variable} font-sans antialiased`}>
        <SiteChrome header={<Header />} footer={<Footer />}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
