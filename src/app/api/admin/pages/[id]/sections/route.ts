import { and, eq, max } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, contentEntries, pageSections } from "@/db/schema";
import { authorizeAdminApi } from "@/lib/admin-api";
import { apiError, clientIp } from "@/lib/api";
import { assertSafeSectionData } from "@/lib/page-sections";

const idSchema = z.string().uuid();
const createSchema = z.object({
  sectionKey: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z][a-z0-9-]*$/),
  label: z.string().trim().min(1).max(255),
  data: z.unknown().default({}),
  isEnabled: z.boolean().default(true),
});
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const auth = await authorizeAdminApi({ permission: "content:read" });
    if (auth.response) return auth.response;
    const pageId = idSchema.parse((await context.params).id);
    const rows = await db
      .select()
      .from(pageSections)
      .where(eq(pageSections.pageId, pageId))
      .orderBy(pageSections.sortOrder, pageSections.createdAt);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const auth = await authorizeAdminApi();
    if (auth.response || !auth.session) return auth.response;
    const pageId = idSchema.parse((await context.params).id);
    const input = createSchema.parse(await request.json());
    assertSafeSectionData(input.data);
    const [page] = await db
      .select({ id: contentEntries.id })
      .from(contentEntries)
      .where(
        and(eq(contentEntries.id, pageId), eq(contentEntries.type, "page")),
      )
      .limit(1);
    if (!page)
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 },
      );
    const [position] = await db
      .select({ value: max(pageSections.sortOrder) })
      .from(pageSections)
      .where(eq(pageSections.pageId, pageId));
    const [created] = await db
      .insert(pageSections)
      .values({ pageId, ...input, sortOrder: (position?.value ?? -1) + 1 })
      .returning();
    await db.insert(auditLogs).values({
      userId: auth.session.userId,
      action: "section_create",
      entityType: "page_section",
      entityId: created.id,
      changes: { pageId, sectionKey: input.sectionKey },
      ipAddress: clientIp(request),
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return apiError(error, "Section could not be created.");
  }
}
