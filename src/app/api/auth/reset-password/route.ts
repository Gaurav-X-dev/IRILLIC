import { createHash } from "crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  adminSessions,
  passwordResetTokens,
  securityEvents,
  users,
} from "@/db/schema";
import { apiError, clientIp } from "@/lib/api";
import { strongPasswordSchema } from "@/validations/user.validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token : "";
    const passwordResult = strongPasswordSchema.safeParse(body.password);
    if (token.length < 32 || !passwordResult.success)
      return NextResponse.json(
        {
          success: false,
          error: passwordResult.success
            ? "This reset link is invalid."
            : passwordResult.error.issues[0]?.message,
        },
        { status: 400 },
      );
    const hash = createHash("sha256").update(token).digest("hex");
    const [reset] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, hash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);
    if (!reset)
      return NextResponse.json(
        { success: false, error: "This reset link is invalid or expired." },
        { status: 400 },
      );
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          password: await bcrypt.hash(passwordResult.data, 12),
          mustChangePassword: false,
          updatedAt: new Date(),
        })
        .where(eq(users.id, reset.userId));
      await tx
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(eq(passwordResetTokens.id, reset.id));
      await tx
        .update(adminSessions)
        .set({ revokedAt: new Date() })
        .where(eq(adminSessions.userId, reset.userId));
      await tx.insert(securityEvents).values({
        event: "password_reset_completed",
        ipAddress: clientIp(request),
        userAgent: request.headers.get("user-agent"),
        success: true,
      });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, "Password could not be reset");
  }
}
