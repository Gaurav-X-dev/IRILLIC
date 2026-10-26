import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { and, count, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { securityEvents, users } from "@/db/schema";
import { apiError, clientIp } from "@/lib/api";
import { createAdminSession } from "@/lib/auth";
import { loginSchema } from "@/validations/user.validation";
import { isAdminRole } from "@/lib/rbac";

export async function POST(request: Request) {
  const ipAddress = clientIp(request);
  const userAgent = request.headers.get("user-agent");
  try {
    const recent = await db
      .select({ value: count() })
      .from(securityEvents)
      .where(
        and(
          eq(securityEvents.event, "login_failed"),
          eq(securityEvents.ipAddress, ipAddress),
          gte(securityEvents.createdAt, new Date(Date.now() - 15 * 60 * 1000)),
        ),
      );
    if ((recent[0]?.value ?? 0) >= 5)
      return NextResponse.json(
        {
          success: false,
          error: "Too many attempts. Try again in 15 minutes.",
        },
        { status: 429 },
      );
    const body = loginSchema.parse(await request.json());
    const email = body.email.trim().toLowerCase();
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.isActive, true)))
      .limit(1);
    const valid = user
      ? await bcrypt.compare(body.password, user.password)
      : await bcrypt.compare(
          body.password,
          "$2a$12$W9vXR3/pzJLwUG8WMNBPpu2JzowEocp.RN7ykmqGFcEAIuxQVjYoy",
        );
    await db.insert(securityEvents).values({
      event: valid && user ? "login_success" : "login_failed",
      email,
      ipAddress,
      userAgent,
      success: Boolean(valid && user),
    });
    if (!user || !valid || !isAdminRole(user.role))
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 },
      );
    await createAdminSession(user.id, body.remember);
    return NextResponse.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    return apiError(
      error,
      "Login service is not configured. Check the database connection.",
    );
  }
}
