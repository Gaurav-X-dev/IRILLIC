import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, contentEntries } from "@/db/schema";
import { authorizeAdminApi } from "@/lib/admin-api";
import { apiError, clientIp } from "@/lib/api";
import { contentUpdateSchema } from "@/validations/cms.validation";
import { validateKnownCmsContent } from "@/validations/public-content.validation";
import { z } from "zod";

const REQUIRED_PAGES = new Set([
  "site-chrome",
  "home",
  "about-us",
  "products",
  "clinical-applications",
  "clinical-resources",
  "contact",
]);

type Context = { params: Promise<{ id: string }> };
const contentIdSchema = z.string().uuid("Invalid content identifier");
export async function PATCH(request: Request, context: Context) {
  try {
    const auth = await authorizeAdminApi();
    if (auth.response || !auth.session) return auth.response;
    const { id: rawId } = await context.params;
    const id = contentIdSchema.parse(rawId);
    const input = contentUpdateSchema.parse(await request.json());
    const [current] = await db
      .select()
      .from(contentEntries)
      .where(eq(contentEntries.id, id))
      .limit(1);
    if (!current)
      return NextResponse.json(
        { success: false, error: "Content not found" },
        { status: 404 },
      );
    if (
      current.type === "page" &&
      REQUIRED_PAGES.has(current.slug) &&
      ((input.slug && input.slug !== current.slug) ||
        (input.type && input.type !== "page") ||
        (input.status && input.status !== "published"))
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Core website pages must keep their slug, page type and published status.",
        },
        { status: 409 },
      );
    }
    validateKnownCmsContent(
      input.type ?? current.type,
      input.slug ?? current.slug,
      input.content ?? current.content,
    );
    const [updated] = await db
      .update(contentEntries)
      .set({
        ...input,
        ...(input.status === "published" ? { publishedAt: new Date() } : {}),
        updatedAt: new Date(),
      })
      .where(eq(contentEntries.id, id))
      .returning();
    if (!updated)
      return NextResponse.json(
        { success: false, error: "Content not found" },
        { status: 404 },
      );
    await db.insert(auditLogs).values({
      userId: auth.session.userId,
      action: "update",
      entityType: updated.type,
      entityId: id,
      changes: input,
      ipAddress: clientIp(request),
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return apiError(error);
  }
}
export async function DELETE(request: Request, context: Context) {
  try {
    const auth = await authorizeAdminApi();
    if (auth.response || !auth.session) return auth.response;
    const { id: rawId } = await context.params;
    const id = contentIdSchema.parse(rawId);
    const [current] = await db
      .select()
      .from(contentEntries)
      .where(eq(contentEntries.id, id))
      .limit(1);
    if (current?.type === "page" && REQUIRED_PAGES.has(current.slug))
      return NextResponse.json(
        {
          success: false,
          error:
            "This page is required by the public website and cannot be deleted.",
        },
        { status: 409 },
      );
    const [deleted] = await db
      .delete(contentEntries)
      .where(eq(contentEntries.id, id))
      .returning();
    if (!deleted)
      return NextResponse.json(
        { success: false, error: "Content not found" },
        { status: 404 },
      );
    await db.insert(auditLogs).values({
      userId: auth.session.userId,
      action: "delete",
      entityType: deleted.type,
      entityId: id,
      changes: { title: deleted.title },
      ipAddress: clientIp(request),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
