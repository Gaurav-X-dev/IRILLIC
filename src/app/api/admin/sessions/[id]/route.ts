import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { authorizeAdminApi } from "@/lib/admin-api";
import { apiError, clientIp } from "@/lib/api";
import { revokeSession } from "@/services/security.service";

type Context = { params: Promise<{ id: string }> };
const sessionIdSchema = z.string().uuid("Invalid session identifier");

/** Signs a session out immediately, wherever it is being used. */
export async function DELETE(request: Request, context: Context) {
  try {
    const auth = await authorizeAdminApi({ permission: "users:manage" });
    if (auth.response || !auth.session) return auth.response;
    const { id: rawId } = await context.params;
    const id = sessionIdSchema.parse(rawId);

    const revoked = await revokeSession(id);
    if (!revoked)
      return NextResponse.json(
        { success: false, error: "That session is already closed." },
        { status: 404 },
      );

    await db.insert(auditLogs).values({
      userId: auth.session.userId,
      action: "revoke",
      entityType: "session",
      entityId: id,
      changes: { revokedUserId: revoked.userId },
      ipAddress: clientIp(request),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
