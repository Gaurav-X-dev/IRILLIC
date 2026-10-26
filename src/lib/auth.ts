import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { adminSessions, users } from "@/db/schema";

export const SESSION_COOKIE = "irillic_admin_session";
const SESSION_HOURS = 8;
const REMEMBER_SESSION_HOURS = 30 * 24;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function requestIdentity() {
  const requestHeaders = await headers();
  return {
    ip:
      requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      requestHeaders.get("x-real-ip") ||
      null,
    userAgent: requestHeaders.get("user-agent") || null,
  };
}

export async function createAdminSession(userId: string, remember = false) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() +
      (remember ? REMEMBER_SESSION_HOURS : SESSION_HOURS) * 60 * 60 * 1000,
  );
  const identity = await requestIdentity();
  await db.insert(adminSessions).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
    ipAddress: identity.ip,
    userAgent: identity.userAgent,
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
  return expiresAt;
}

export async function getAdminSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length < 32) return null;
  const tokenHash = hashToken(token);
  const rows = await db
    .select({
      sessionId: adminSessions.id,
      tokenHash: adminSessions.tokenHash,
      expiresAt: adminSessions.expiresAt,
      userId: users.id,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
      role: users.role,
      isActive: users.isActive,
      mustChangePassword: users.mustChangePassword,
    })
    .from(adminSessions)
    .innerJoin(users, eq(users.id, adminSessions.userId))
    .where(
      and(
        eq(adminSessions.tokenHash, tokenHash),
        isNull(adminSessions.revokedAt),
        gt(adminSessions.expiresAt, new Date()),
        eq(users.isActive, true),
      ),
    )
    .limit(1);
  const session = rows[0];
  if (!session || !safeEqual(session.tokenHash, tokenHash)) return null;
  return session;
}

export async function requireAdmin() {
  try {
    const session = await getAdminSession();
    if (session) return session;
  } catch {
    // Database configuration errors are handled by the login screen/API.
  }
  redirect("/login?reason=session");
}

export async function revokeAdminSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token)
    await db
      .update(adminSessions)
      .set({ revokedAt: new Date() })
      .where(eq(adminSessions.tokenHash, hashToken(token)));
  store.delete(SESSION_COOKIE);
}
