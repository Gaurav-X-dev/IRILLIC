import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const contentEntries = pgTable(
  "content_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: varchar("type", { length: 50 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    summary: text("summary"),
    status: varchar("status", { length: 20 }).default("draft").notNull(),
    content: jsonb("content")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    seo: jsonb("seo").$type<Record<string, unknown>>().default({}).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    contentTypeSlugUnique: uniqueIndex("content_type_slug_unique").on(
      table.type,
      table.slug,
    ),
    contentTypeStatusIdx: index("content_type_status_idx").on(
      table.type,
      table.status,
      table.sortOrder,
    ),
  }),
);

export const pageSections = pgTable(
  "page_sections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => contentEntries.id, { onDelete: "cascade" }),
    sectionKey: varchar("section_key", { length: 120 }).notNull(),
    label: varchar("label", { length: 255 }).notNull(),
    data: jsonb("data").$type<unknown>().default({}).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isEnabled: boolean("is_enabled").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pageSectionUnique: uniqueIndex("page_section_unique").on(
      table.pageId,
      table.sectionKey,
    ),
    pageSectionOrderIdx: index("page_section_order_idx").on(
      table.pageId,
      table.sortOrder,
    ),
  }),
);

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    url: text("url").notNull(),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    size: integer("size").default(0).notNull(),
    altText: varchar("alt_text", { length: 500 }),
    folder: varchar("folder", { length: 120 }).default("general").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    mediaUpdatedIdx: index("media_updated_idx").on(table.updatedAt),
  }),
);

export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kind: varchar("kind", { length: 60 }).default("contact").notNull(),
    name: varchar("name", { length: 180 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    organisation: varchar("organisation", { length: 255 }),
    subject: varchar("subject", { length: 255 }).notNull(),
    message: text("message").notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    status: varchar("status", { length: 30 }).default("new").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    enquiryStatusCreatedIdx: index("enquiry_status_created_idx").on(
      table.status,
      table.createdAt,
    ),
    enquiryCreatedIdx: index("enquiry_created_idx").on(table.createdAt),
  }),
);

export const siteSettings = pgTable(
  "site_settings",
  {
    key: varchar("key", { length: 120 }).primaryKey(),
    group: varchar("group", { length: 60 }).default("general").notNull(),
    value: jsonb("value").$type<unknown>().notNull(),
    isSecret: boolean("is_secret").default(false).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    settingsGroupIdx: index("settings_group_idx").on(table.group),
  }),
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: text("user_agent"),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    adminSessionsUserIdx: index("admin_sessions_user_idx").on(table.userId),
    adminSessionsTokenIdx: index("admin_sessions_token_idx").on(
      table.tokenHash,
    ),
    adminSessionsExpiryIdx: index("admin_sessions_expiry_idx").on(
      table.expiresAt,
      table.revokedAt,
    ),
  }),
);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const securityEvents = pgTable(
  "security_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    event: varchar("event", { length: 80 }).notNull(),
    email: varchar("email", { length: 255 }),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: text("user_agent"),
    success: boolean("success").default(false).notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    securityEventLookupIdx: index("security_event_lookup_idx").on(
      table.event,
      table.ipAddress,
      table.createdAt,
    ),
  }),
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 80 }).notNull(),
    entityType: varchar("entity_type", { length: 60 }).notNull(),
    entityId: varchar("entity_id", { length: 180 }),
    changes: jsonb("changes")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    ipAddress: varchar("ip_address", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    auditEntityIdx: index("audit_entity_idx").on(
      table.entityType,
      table.entityId,
    ),
    auditCreatedIdx: index("audit_created_idx").on(table.createdAt),
  }),
);

export type ContentEntry = InferSelectModel<typeof contentEntries>;
export type NewContentEntry = InferInsertModel<typeof contentEntries>;
export type PageSection = InferSelectModel<typeof pageSections>;
export type Enquiry = InferSelectModel<typeof enquiries>;
