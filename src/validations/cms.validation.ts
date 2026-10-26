import { z } from "zod";

export const contentInputSchema = z.object({
  type: z.enum(["page", "product", "application", "resource"]),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(180)
    .regex(
      /^[a-z0-9]+(?:[/-][a-z0-9]+)*$/,
      "Use lowercase letters, numbers, slashes and hyphens",
    ),
  title: z.string().trim().min(2).max(255),
  summary: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  content: z.record(z.string(), z.unknown()).default({}),
  seo: z.record(z.string(), z.unknown()).default({}),
  sortOrder: z.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
});

export const contentUpdateSchema = z.object({
  type: z.enum(["page", "product", "application", "resource"]).optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(180)
    .regex(
      /^[a-z0-9]+(?:[/-][a-z0-9]+)*$/,
      "Use lowercase letters, numbers, slashes and hyphens",
    )
    .optional(),
  title: z.string().trim().min(2).max(255).optional(),
  summary: z.string().trim().max(2000).nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  seo: z.record(z.string(), z.unknown()).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
});

export const enquiryInputSchema = z.object({
  kind: z.string().trim().max(60).default("contact"),
  name: z.string().trim().min(2).max(180),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional(),
  organisation: z.string().trim().max(255).optional(),
  subject: z.string().trim().min(2).max(255),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(255).optional(),
  metadata: z.record(z.string(), z.string().max(500)).optional().default({}),
});

export const ENQUIRY_STATUSES = [
  "new",
  "in-progress",
  "responded",
  "closed",
  "spam",
] as const;

export const enquiryUpdateSchema = z.object({
  status: z.enum(ENQUIRY_STATUSES),
});

export const settingInputSchema = z.object({
  group: z.enum(["general", "smtp", "seo", "contact"]),
  values: z.record(
    z.string(),
    z.union([z.string().max(5000), z.number(), z.boolean(), z.null()]),
  ),
});
