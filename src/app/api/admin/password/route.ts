import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { adminSessions, auditLogs, users } from "@/db/schema";
import { authorizeAdminApi } from "@/lib/admin-api";
import { apiError, clientIp } from "@/lib/api";
import { createAdminSession, revokeAdminSession } from "@/lib/auth";
import { strongPasswordSchema } from "@/validations/user.validation";

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: strongPasswordSchema,
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    path: ["newPassword"],
    message: "Choose a different password",
  });

export async function POST(request: Request) {
  try {
    const auth = await authorizeAdminApi({
      allowPasswordChange: true,
      permission: "profile:manage",
    });
    if (auth.response || !auth.session) return auth.response;
    const input = passwordChangeSchema.parse(await request.json());
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, auth.session.userId))
      .limit(1);
    if (!user || !(await bcrypt.compare(input.currentPassword, user.password)))
      return NextResponse.json(
        { success: false, error: "Current password is incorrect." },
        { status: 400 },
      );
    const password = await bcrypt.hash(input.newPassword, 12);
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ password, mustChangePassword: false, updatedAt: new Date() })
        .where(eq(users.id, user.id));
      await tx
        .update(adminSessions)
        .set({ revokedAt: new Date() })
        .where(eq(adminSessions.userId, user.id));
      await tx.insert(auditLogs).values({
        userId: user.id,
        action: "password_change",
        entityType: "security",
        entityId: user.id,
        changes: {},
        ipAddress: clientIp(request),
      });
    });
    await revokeAdminSession();
    await createAdminSession(user.id, false);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, "Password could not be changed.");
  }
}
