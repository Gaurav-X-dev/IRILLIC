import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { adminSessions, auditLogs } from "@/db/schema";
import { userService } from "@/services/user.service";
import type { ApiResponse } from "@/types/api.types";
import { authorizeAdminApi } from "@/lib/admin-api";
import { apiError, clientIp } from "@/lib/api";
import { updateContentReaderSchema } from "@/validations/user.validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}
const idSchema = z.string().uuid("Invalid user identifier");

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authorizeAdminApi({ permission: "users:manage" });
    if (auth.response) return auth.response;
    const user = await userService.getById(idSchema.parse((await params).id));
    if (!user)
      return NextResponse.json<ApiResponse>(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    return NextResponse.json<ApiResponse>({ success: true, data: user });
  } catch (error) {
    return apiError(error, "User could not be loaded");
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authorizeAdminApi({ permission: "users:manage" });
    if (auth.response || !auth.session) return auth.response;
    const id = idSchema.parse((await params).id);
    const current = await userService.getById(id);
    if (!current)
      return NextResponse.json<ApiResponse>(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    if (current.role !== "content_reader")
      return NextResponse.json<ApiResponse>(
        { success: false, error: "The administrator account is protected." },
        { status: 409 },
      );
    const input = updateContentReaderSchema.parse(await request.json());
    const user = await userService.updateContentReader(id, input);
    if (input.isActive === false || input.temporaryPassword)
      await db
        .update(adminSessions)
        .set({ revokedAt: new Date() })
        .where(eq(adminSessions.userId, id));
    await db.insert(auditLogs).values({
      userId: auth.session.userId,
      action: "update_content_reader",
      entityType: "user",
      entityId: id,
      changes: {
        ...input,
        ...(input.temporaryPassword ? { temporaryPassword: "[changed]" } : {}),
      },
      ipAddress: clientIp(request),
    });
    return NextResponse.json<ApiResponse>({
      success: true,
      data: user,
      message: "Content Reader updated successfully",
    });
  } catch (error) {
    return apiError(error, "Content Reader could not be updated");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authorizeAdminApi({ permission: "users:manage" });
    if (auth.response || !auth.session) return auth.response;
    const id = idSchema.parse((await params).id);
    const current = await userService.getById(id);
    if (!current)
      return NextResponse.json<ApiResponse>(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    if (current.role !== "content_reader")
      return NextResponse.json<ApiResponse>(
        { success: false, error: "The administrator account is protected." },
        { status: 409 },
      );
    await userService.delete(id);
    await db.insert(auditLogs).values({
      userId: auth.session.userId,
      action: "delete_content_reader",
      entityType: "user",
      entityId: id,
      changes: { email: current.email },
      ipAddress: clientIp(request),
    });
    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Content Reader deleted successfully",
    });
  } catch (error) {
    return apiError(error, "Content Reader could not be deleted");
  }
}
