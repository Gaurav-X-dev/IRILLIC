import "server-only";
import { cache } from "react";
import { getSettingGroup } from "@/services/settings.service";
import type { Branding } from "@/lib/branding-defaults";

export type { Branding };

/**
 * Contact details are global settings, not page copy. Applying them after the
 * page schema is parsed keeps every public contact surface on one source of
 * truth while the remaining address/company copy stays page-editable.
 */
export function applyGlobalContact<
  T extends { email: string; phone: string; phoneHref: string },
>(contact: T, branding: Branding): T {
  const phone = branding.phone.trim();
  const dialable = phone.replace(/[^\d+]/g, "");
  return {
    ...contact,
    email: branding.supportEmail,
    phone,
    phoneHref: dialable ? `tel:${dialable}` : "",
  };
}

function requiredText(settings: Record<string, unknown>, key: string): string {
  const value = settings[key];
  if (typeof value !== "string" || !value.trim())
    throw new Error(`Required general setting "${key}" is missing.`);
  return value.trim();
}

function optionalText(settings: Record<string, unknown>, key: string): string {
  const value = settings[key];
  if (value == null || value === "") return "";
  if (typeof value !== "string")
    throw new Error(`General setting "${key}" must be text.`);
  return value.trim();
}

/**
 * Branding is runtime CMS data. Missing configuration fails explicitly so the
 * public site never silently renders committed placeholder content.
 */
export const getBranding = cache(async (): Promise<Branding> => {
  const stored = await getSettingGroup("general");
  const seoKeywords = requiredText(stored, "seoKeywords")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
  if (!seoKeywords.length)
    throw new Error('Required general setting "seoKeywords" is empty.');
  return {
    siteName: requiredText(stored, "siteName"),
    legalName: requiredText(stored, "legalName"),
    tagline: requiredText(stored, "tagline"),
    brandDescription: requiredText(stored, "brandDescription"),
    seoTitle: requiredText(stored, "seoTitle"),
    seoDescription: requiredText(stored, "seoDescription"),
    seoKeywords,
    supportEmail: requiredText(stored, "supportEmail"),
    phone: optionalText(stored, "phone"),
    logo: requiredText(stored, "logo"),
    logoWhite: requiredText(stored, "logoWhite"),
    logoFooter: requiredText(stored, "logoFooter"),
    favicon: requiredText(stored, "favicon"),
    themeColor: requiredText(stored, "themeColor"),
  };
});
