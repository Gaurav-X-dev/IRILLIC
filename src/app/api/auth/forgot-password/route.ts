import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { and, count, eq, gte, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { passwordResetTokens, securityEvents, users } from "@/db/schema";
import { apiError, clientIp } from "@/lib/api";
import { sendMail } from "@/services/mail.service";
import { renderEmail } from "@/services/email-template";

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
    const [found] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    // A disabled account cannot sign in, so it cannot recover a password
    // either: issuing a link would let a revoked reader set a new password and
    // leave a usable credential behind the moment the account is re-enabled.
    const user = found?.isActive ? found : undefined;
    await db.insert(securityEvents).values({
      event: "password_reset_requested",
      email,
      ipAddress,
      userAgent: request.headers.get("user-agent"),
      success: Boolean(user),
      metadata:
        found && !found.isActive ? { refused: "account_disabled" } : undefined,
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
      const message = await renderEmail(
        "Reset your administration password",
        {
          eyebrow: "Account recovery",
          heading: "Reset your password",
          paragraphs: [
            `Hello ${user.name},`,
            "A password reset was requested for your administration account. Choose a new password using the button below.",
            "If you did not request this, you can ignore this message — your current password stays active and nothing has changed.",
          ],
          button: { label: "Reset password", href: link },
          note: "For your security this link expires 30 minutes after it was requested and can only be used once.",
        },
        new URL(request.url).origin,
      );
      await sendMail({ to: user.email, ...message });
    } catch (mailError) {
      console.error("Password reset email could not be sent", mailError);
    }
    return NextResponse.json(generic);
  } catch (error) {
    return apiError(error, "Password recovery is not configured yet");
  }
}
