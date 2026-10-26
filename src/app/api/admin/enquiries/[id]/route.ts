import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, enquiries } from "@/db/schema";
import { authorizeAdminApi } from "@/lib/admin-api";
import { apiError, clientIp } from "@/lib/api";
import { enquiryUpdateSchema } from "@/validations/cms.validation";

type Context = { params: Promise<{ id: string }> };
const enquiryIdSchema = z.string().uuid("Invalid enquiry identifier");

export async function PATCH(request: Request, context: Context) {
  try {
    const auth = await authorizeAdminApi();
    if (auth.response || !auth.session) return auth.response;
    const { id: rawId } = await context.params;
    const id = enquiryIdSchema.parse(rawId);
    const input = enquiryUpdateSchema.parse(await request.json());
    const [updated] = await db
      .update(enquiries)
      .set({ status: input.status, updatedAt: new Date() })
      .where(eq(enquiries.id, id))
      .returning();
    if (!updated)
      return NextResponse.json(
        { success: false, error: "Enquiry not found" },
        { status: 404 },
      );
    await db.insert(auditLogs).values({
      userId: auth.session.userId,
      action: "update",
      entityType: "enquiry",
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
    const id = enquiryIdSchema.parse(rawId);
    const [deleted] = await db
      .delete(enquiries)
      .where(eq(enquiries.id, id))
      .returning({ id: enquiries.id, subject: enquiries.subject });
    if (!deleted)
      return NextResponse.json(
        { success: false, error: "Enquiry not found" },
        { status: 404 },
      );
    await db.insert(auditLogs).values({
      userId: auth.session.userId,
      action: "delete",
      entityType: "enquiry",
      entityId: id,
      changes: { subject: deleted.subject },
      ipAddress: clientIp(request),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
