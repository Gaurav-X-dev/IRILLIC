import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { and, count, eq, gte, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { passwordResetTokens, securityEvents, users } from "@/db/schema";
import { apiError, clientIp } from "@/lib/api";
import { sendMail } from "@/services/mail.service";

export async function POST(request: Request) {
  const generic = {
    success: true,
    message: "If the account exists, a reset link has been sent.",
  };
  try {
    const ipAddress = clientIp(request);
    const recent = await db
      .select({ value: count() })
      .from(securityEvents)
      .where(
        and(
          eq(securityEvents.event, "password_reset_requested"),
          eq(securityEvents.ipAddress, ipAddress),
          gte(securityEvents.createdAt, new Date(Date.now() - 60 * 60 * 1000)),
        ),
      );
    if ((recent[0]?.value ?? 0) >= 5) return NextResponse.json(generic);
    const body = await request.json();
    const emailResult = z
      .string()
      .trim()
      .email()
      .max(255)
      .safeParse(body.email);
    const email = emailResult.success ? emailResult.data.toLowerCase() : "";
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    await db.insert(securityEvents).values({
      event: "password_reset_requested",
      email,
      ipAddress,
      userAgent: request.headers.get("user-agent"),
      success: Boolean(user),
    });
    if (!user) return NextResponse.json(generic);
    await db
      .delete(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.userId, user.id),
          isNull(passwordResetTokens.usedAt),
        ),
      );
    const token = randomBytes(32).toString("base64url");
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });
    const base = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const link = `${base}/reset-password?token=${encodeURIComponent(token)}`;
    try {
      await sendMail({
        to: user.email,
        subject: "Reset your IRILLIC admin password",
        text: `Open this link within 30 minutes: ${link}`,
        html: `<p>A password reset was requested for the IRILLIC admin portal.</p><p><a href="${link}">Reset password</a></p><p>This link expires in 30 minutes.</p>`,
      });
    } catch (mailError) {
      console.error("Password reset email could not be sent", mailError);
    }
    return NextResponse.json(generic);
  } catch (error) {
    return apiError(error, "Password recovery is not configured yet");
  }
}
