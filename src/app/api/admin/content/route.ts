import { NextResponse } from "next/server";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, contentEntries } from "@/db/schema";
import { authorizeAdminApi } from "@/lib/admin-api";
import { apiError, clientIp } from "@/lib/api";
import { contentInputSchema } from "@/validations/cms.validation";
import { validateKnownCmsContent } from "@/validations/public-content.validation";
import { CMS_TYPES } from "@/services/cms.service";
import { paginationFromUrl, paginationMeta } from "@/lib/pagination";

export async function GET(request: Request) {
  try {
    const auth = await authorizeAdminApi({ permission: "content:read" });
    if (auth.response) return auth.response;
    const { params, page, limit, offset } = paginationFromUrl(request);
    const type = params.get("type");
    if (type && !CMS_TYPES.includes(type as (typeof CMS_TYPES)[number]))
      return NextResponse.json(
        { success: false, error: "Invalid content type" },
        { status: 400 },
      );
    const search = params.get("search")?.trim();
    const status = params.get("status")?.trim();
    const sort = params.get("sort")?.trim();
    const summary = params.get("summary") === "true";
    if (sort && sort !== "updated")
      return NextResponse.json(
        { success: false, error: "Invalid content sort" },
        { status: 400 },
      );
    const conditions = [
      type ? eq(contentEntries.type, type) : undefined,
      status ? eq(contentEntries.status, status) : undefined,
      search
        ? or(
            ilike(contentEntries.title, `%${search}%`),
            ilike(contentEntries.slug, `%${search}%`),
            ilike(contentEntries.summary, `%${search}%`),
          )
        : undefined,
    ].filter(Boolean);
    const where = conditions.length ? and(...conditions) : undefined;
    const order =
      sort === "updated"
        ? [desc(contentEntries.updatedAt), contentEntries.sortOrder]
        : [contentEntries.sortOrder, desc(contentEntries.updatedAt)];
    const rowsQuery = summary
      ? db
          .select({
            id: contentEntries.id,
            title: contentEntries.title,
            slug: contentEntries.slug,
            type: contentEntries.type,
            status: contentEntries.status,
            updatedAt: contentEntries.updatedAt,
          })
          .from(contentEntries)
          .where(where)
          .orderBy(...order)
          .limit(limit)
          .offset(offset)
      : db
          .select()
          .from(contentEntries)
          .where(where)
          .orderBy(...order)
          .limit(limit)
          .offset(offset);
    const [rows, totalRows] = await Promise.all([
      rowsQuery,
      db.select({ value: count() }).from(contentEntries).where(where),
    ]);
    const total = totalRows[0]?.value ?? 0;
    return NextResponse.json({
      success: true,
      data: rows,
      pagination: paginationMeta(page, limit, total),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorizeAdminApi();
    if (auth.response || !auth.session) return auth.response;
    const input = contentInputSchema.parse(await request.json());
    validateKnownCmsContent(input.type, input.slug, input.content);
    const [created] = await db
      .insert(contentEntries)
      .values({
        ...input,
        publishedAt: input.status === "published" ? new Date() : null,
      })
      .returning();
    await db.insert(auditLogs).values({
      userId: auth.session.userId,
      action: "create",
      entityType: input.type,
      entityId: created.id,
      changes: { title: input.title, slug: input.slug },
      ipAddress: clientIp(request),
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
