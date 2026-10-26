import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, contentEntries, pageSections } from "@/db/schema";
import { authorizeAdminApi } from "@/lib/admin-api";
import { apiError, clientIp } from "@/lib/api";
import {
  assemblePageContent,
  assertSafeSectionData,
} from "@/lib/page-sections";
import { validateKnownCmsContent } from "@/validations/public-content.validation";

const idSchema = z.string().uuid();
const updateSchema = z.object({
  label: z.string().trim().min(1).max(255).optional(),
  data: z.unknown().optional(),
  isEnabled: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(10000).optional(),
});
type Context = { params: Promise<{ id: string }> };

async function contextFor(sectionId: string) {
  const [section] = await db
    .select()
    .from(pageSections)
    .where(eq(pageSections.id, sectionId))
    .limit(1);
  if (!section) return null;
  const [page] = await db
    .select()
    .from(contentEntries)
    .where(eq(contentEntries.id, section.pageId))
    .limit(1);
  const sections = await db
    .select()
    .from(pageSections)
    .where(eq(pageSections.pageId, section.pageId));
  return page ? { section, page, sections } : null;
}

export async function PATCH(request: Request, routeContext: Context) {
  try {
    const auth = await authorizeAdminApi();
    if (auth.response || !auth.session) return auth.response;
    const id = idSchema.parse((await routeContext.params).id);
    const input = updateSchema.parse(await request.json());
    if (input.data !== undefined) assertSafeSectionData(input.data);
    const current = await contextFor(id);
    if (!current)
      return NextResponse.json(
        { success: false, error: "Section not found" },
        { status: 404 },
      );
    const candidate = current.sections.map((section) =>
      section.id === id ? { ...section, ...input } : section,
    );
    validateKnownCmsContent(
      "page",
      current.page.slug,
      assemblePageContent(candidate),
    );
    const [updated] = await db
      .update(pageSections)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(pageSections.id, id))
      .returning();
    await db
      .update(contentEntries)
      .set({ content: assemblePageContent(candidate), updatedAt: new Date() })
      .where(eq(contentEntries.id, current.page.id));
    await db.insert(auditLogs).values({
      userId: auth.session.userId,
      action: "section_update",
      entityType: "page_section",
      entityId: id,
      changes: { fields: Object.keys(input) },
      ipAddress: clientIp(request),
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return apiError(error, "Section could not be updated.");
  }
}

export async function DELETE(request: Request, routeContext: Context) {
  try {
    const auth = await authorizeAdminApi();
    if (auth.response || !auth.session) return auth.response;
    const id = idSchema.parse((await routeContext.params).id);
    const current = await contextFor(id);
    if (!current)
      return NextResponse.json(
        { success: false, error: "Section not found" },
        { status: 404 },
      );
    const candidate = current.sections.filter((section) => section.id !== id);
    try {
      validateKnownCmsContent(
        "page",
        current.page.slug,
        assemblePageContent(candidate),
      );
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "This section is required by the current page design and cannot be deleted. Its fields can still be edited.",
        },
        { status: 409 },
      );
    }
    await db.transaction(async (tx) => {
      await tx.delete(pageSections).where(eq(pageSections.id, id));
      await tx
        .update(contentEntries)
        .set({ content: assemblePageContent(candidate), updatedAt: new Date() })
        .where(eq(contentEntries.id, current.page.id));
      await tx.insert(auditLogs).values({
        userId: auth.session.userId,
        action: "section_delete",
        entityType: "page_section",
        entityId: id,
        changes: { sectionKey: current.section.sectionKey },
        ipAddress: clientIp(request),
      });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, "Section could not be deleted.");
  }
}
