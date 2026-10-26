import "server-only";
import { cache } from "react";

import { and, count, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { assemblePageContent } from "@/lib/page-sections";
import {
  auditLogs,
  contentEntries,
  enquiries,
  mediaAssets,
  pageSections,
  siteSettings,
} from "@/db/schema";

export const CMS_TYPES = [
  "page",
  "product",
  "application",
  "resource",
] as const;
export type CmsType = (typeof CMS_TYPES)[number];

export const cmsService = {
  async adminTopbar() {
    const [newEnquiries, recentEnquiries] = await Promise.all([
      db
        .select({ value: count() })
        .from(enquiries)
        .where(eq(enquiries.status, "new")),
      db
        .select({
          id: enquiries.id,
          name: enquiries.name,
          subject: enquiries.subject,
          createdAt: enquiries.createdAt,
        })
        .from(enquiries)
        .where(eq(enquiries.status, "new"))
        .orderBy(desc(enquiries.createdAt))
        .limit(5),
    ]);
    return { enquiryCount: newEnquiries[0]?.value ?? 0, recentEnquiries };
  },

  async dashboard() {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(Date.now() - 7 * 86400000);
    const previousWeekStart = new Date(Date.now() - 14 * 86400000);
    const [
      pages,
      products,
      applications,
      resources,
      media,
      newEnquiries,
      recent,
      activity,
      contentStatus,
      enquiryStatus,
      auditActions,
      enquiriesThisWeek,
      enquiriesLastWeek,
      changesThisWeek,
      changesLastWeek,
    ] = await Promise.all([
      db
        .select({ value: count() })
        .from(contentEntries)
        .where(
          and(
            eq(contentEntries.type, "page"),
            eq(contentEntries.status, "published"),
          ),
        ),
      db
        .select({ value: count() })
        .from(contentEntries)
        .where(eq(contentEntries.type, "product")),
      db
        .select({ value: count() })
        .from(contentEntries)
        .where(eq(contentEntries.type, "application")),
      db
        .select({ value: count() })
        .from(contentEntries)
        .where(eq(contentEntries.type, "resource")),
      db.select({ value: count() }).from(mediaAssets),
      db
        .select({ value: count() })
        .from(enquiries)
        .where(eq(enquiries.status, "new")),
      db
        .select({
          id: contentEntries.id,
          title: contentEntries.title,
          slug: contentEntries.slug,
          status: contentEntries.status,
          type: contentEntries.type,
          updatedAt: contentEntries.updatedAt,
        })
        .from(contentEntries)
        .orderBy(desc(contentEntries.updatedAt))
        .limit(6),
      db
        .select({
          day: sql<string>`to_char(${auditLogs.createdAt}, 'YYYY-MM-DD')`,
          value: count(),
        })
        .from(auditLogs)
        .where(gte(auditLogs.createdAt, new Date(Date.now() - 7 * 86400000)))
        .groupBy(sql`to_char(${auditLogs.createdAt}, 'YYYY-MM-DD')`)
        .orderBy(sql`to_char(${auditLogs.createdAt}, 'YYYY-MM-DD')`),
      db
        .select({ label: contentEntries.status, value: count() })
        .from(contentEntries)
        .groupBy(contentEntries.status),
      db
        .select({ label: enquiries.status, value: count() })
        .from(enquiries)
        .groupBy(enquiries.status),
      db
        .select({ label: auditLogs.action, value: count() })
        .from(auditLogs)
        .groupBy(auditLogs.action)
        .orderBy(desc(count())),
      // Week-over-week movement, so the overview can show a real trend rather
      // than a decorative one.
      db
        .select({ value: count() })
        .from(enquiries)
        .where(gte(enquiries.createdAt, weekStart)),
      db
        .select({ value: count() })
        .from(enquiries)
        .where(
          and(
            gte(enquiries.createdAt, previousWeekStart),
            lt(enquiries.createdAt, weekStart),
          ),
        ),
      db
        .select({ value: count() })
        .from(auditLogs)
        .where(gte(auditLogs.createdAt, weekStart)),
      db
        .select({ value: count() })
        .from(auditLogs)
        .where(
          and(
            gte(auditLogs.createdAt, previousWeekStart),
            lt(auditLogs.createdAt, weekStart),
          ),
        ),
    ]);
    return {
      counts: {
        pages: pages[0]?.value ?? 0,
        products: products[0]?.value ?? 0,
        applications: applications[0]?.value ?? 0,
        resources: resources[0]?.value ?? 0,
        media: media[0]?.value ?? 0,
        enquiries: newEnquiries[0]?.value ?? 0,
      },
      recent,
      activity,
      contentStatus,
      enquiryStatus,
      auditActions,
      trends: {
        enquiries: {
          current: enquiriesThisWeek[0]?.value ?? 0,
          previous: enquiriesLastWeek[0]?.value ?? 0,
        },
        changes: {
          current: changesThisWeek[0]?.value ?? 0,
          previous: changesLastWeek[0]?.value ?? 0,
        },
      },
      monthStart,
    };
  },

  async list(type: CmsType) {
    return db
      .select()
      .from(contentEntries)
      .where(eq(contentEntries.type, type))
      .orderBy(contentEntries.sortOrder, desc(contentEntries.updatedAt));
  },

  async published(type: CmsType) {
    return db
      .select()
      .from(contentEntries)
      .where(
        and(
          eq(contentEntries.type, type),
          eq(contentEntries.status, "published"),
        ),
      )
      .orderBy(contentEntries.sortOrder, contentEntries.title);
  },
  async publishedBySlug(type: CmsType, slug: string) {
    const [entry] = await db
      .select()
      .from(contentEntries)
      .where(
        and(
          eq(contentEntries.type, type),
          eq(contentEntries.slug, slug),
          eq(contentEntries.status, "published"),
        ),
      )
      .limit(1);
    if (!entry) return null;
    if (type !== "page") return entry;
    const sections = await db
      .select()
      .from(pageSections)
      .where(
        and(
          eq(pageSections.pageId, entry.id),
          eq(pageSections.isEnabled, true),
        ),
      )
      .orderBy(pageSections.sortOrder, pageSections.createdAt);
    if (!sections.length) return entry;
    return {
      ...entry,
      content: assemblePageContent(sections),
    };
  },

  async pageSections(pageId: string) {
    return db
      .select()
      .from(pageSections)
      .where(eq(pageSections.pageId, pageId))
      .orderBy(pageSections.sortOrder, pageSections.createdAt);
  },

  async listEnquiries() {
    return db
      .select()
      .from(enquiries)
      .orderBy(desc(enquiries.createdAt))
      .limit(100);
  },
  async listMedia() {
    return db
      .select()
      .from(mediaAssets)
      .orderBy(desc(mediaAssets.updatedAt))
      .limit(100);
  },
  async settings(group: string) {
    return db.select().from(siteSettings).where(eq(siteSettings.group, group));
  },
};

export const getPublishedEntry = cache((type: CmsType, slug: string) =>
  cmsService.publishedBySlug(type, slug),
);
