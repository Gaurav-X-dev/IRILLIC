import { z } from "zod";

/**
 * Settings are typed by hand rather than by a generic string rule, because a
 * value that reaches the public website unchecked — a phone number with a
 * tester's keyboard mashing on the end, a logo path pointing nowhere — is
 * visible to every visitor until somebody notices.
 */

/** Digits, with the punctuation a written phone number is allowed to carry. */
export const phoneSchema = z
  .string()
  .trim()
  .max(24, "Phone number must be 24 characters or fewer")
  // Characters first, then how many digits they add up to, so each failure
  // reports the thing the editor actually got wrong.
  .refine(
    (value) => value === "" || /^\+?[\d\s()./-]*$/.test(value),
    "Phone number may contain digits, spaces and + ( ) - . only",
  )
  .refine((value) => {
    if (value === "") return true;
    const digits = value.match(/\d/g)?.length ?? 0;
    // E.164 allows at most 15 digits worldwide; fewer than 7 is not dialable.
    return digits >= 7 && digits <= 15;
  }, "Phone number must have between 7 and 15 digits");

export const emailSchema = z
  .string()
  .trim()
  .max(255)
  .pipe(z.email("Enter a valid email address"));

/** An uploaded path such as /uploads/general/x.webp, or an absolute URL. */
export const assetPathSchema = z
  .string()
  .trim()
  .min(1, "Choose or paste a file path")
  .max(500, "File path must be 500 characters or fewer")
  .refine(
    (value) => value.startsWith("/") || /^https?:\/\//.test(value),
    "File path must start with / or be a full https:// address",
  );

export const hexColourSchema = z
  .string()
  .trim()
  .regex(
    /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
    "Enter a hex colour such as #0091d0",
  );

const text = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be ${max} characters or fewer`);

/**
 * Per-setting rules, by group and key. A key with no rule falls back to plain
 * text, so adding a field to the panel never blocks saving it.
 */
export const SETTING_RULES: Record<string, Record<string, z.ZodType>> = {
  general: {
    siteName: text("Website name", 2, 120),
    legalName: text("Legal name", 2, 160),
    tagline: text("Tagline", 2, 200),
    brandDescription: text("Brand description", 10, 600),
    seoTitle: text("SEO title", 5, 200),
    seoDescription: text("SEO description", 20, 320),
    seoKeywords: text("SEO keywords", 3, 500),
    supportEmail: emailSchema,
    phone: phoneSchema,
    logo: assetPathSchema,
    logoWhite: assetPathSchema,
    logoFooter: assetPathSchema,
    favicon: assetPathSchema,
    themeColor: hexColourSchema,
  },
  smtp: {
    host: text("SMTP host", 3, 255),
    port: z.coerce
      .number()
      .int("Port must be a whole number")
      .min(1, "Port must be between 1 and 65535")
      .max(65535, "Port must be between 1 and 65535"),
    username: z.string().trim().max(255),
    fromName: text("From name", 2, 120),
    fromEmail: emailSchema,
    notificationEmail: emailSchema,
  },
};

/** Turns a key such as "supportEmail" into "Support email" for messages. */
export function settingLabel(key: string) {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Applies the rules for one group, naming the offending field so an editor
 * knows which box to go back to.
 */
export function validateSettingValues(
  group: string,
  values: Record<string, string | number | boolean | null>,
) {
  const rules = SETTING_RULES[group];
  if (!rules) return values;
  const checked: Record<string, string | number | boolean | null> = {
    ...values,
  };
  for (const [key, raw] of Object.entries(values)) {
    const rule = rules[key];
    if (!rule) continue;
    // A secret left untouched arrives masked; it is not being changed.
    if (raw === "••••••••") continue;
    const result = rule.safeParse(raw);
    if (!result.success)
      throw new SettingValidationError(
        key,
        result.error.issues[0]?.message ?? "This value is not valid",
      );
    checked[key] = result.data as string | number | boolean | null;
  }
  return checked;
}

export class SettingValidationError extends Error {
  constructor(
    readonly field: string,
    reason: string,
  ) {
    super(`${settingLabel(field)}: ${reason}`);
    this.name = "SettingValidationError";
  }
}
