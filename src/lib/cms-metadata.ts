import type { Metadata } from "next";

export function cmsMetadata(
  entry: {
    title: string;
    summary: string | null;
    seo: Record<string, unknown>;
  } | null,
): Metadata {
  if (!entry) throw new Error("Published CMS metadata is missing.");
  const seoTitle =
    typeof entry.seo.title === "string" && entry.seo.title.trim()
      ? entry.seo.title.trim()
      : entry.title;
  const seoDescription =
    typeof entry.seo.description === "string" && entry.seo.description.trim()
      ? entry.seo.description.trim()
      : entry.summary || undefined;
  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: { title: seoTitle, description: seoDescription },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
    },
  };
}
