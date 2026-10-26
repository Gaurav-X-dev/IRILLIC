import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { userService } from "@/services/user.service";
import type { ApiResponse } from "@/types/api.types";
import { authorizeAdminApi } from "@/lib/admin-api";
import { apiError, clientIp } from "@/lib/api";
import { createContentReaderSchema } from "@/validations/user.validation";

export async function GET() {
  try {
    const auth = await authorizeAdminApi({ permission: "users:manage" });
    if (auth.response) return auth.response;
    return NextResponse.json<ApiResponse>({
      success: true,
      data: await userService.getAll(),
      message: "Users fetched successfully",
    });
  } catch (error) {
    return apiError(error, "Users could not be loaded");
  }
}

/** Additional accounts are deliberately fixed to the Content Reader role. */
export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeAdminApi({ permission: "users:manage" });
    if (auth.response || !auth.session) return auth.response;
    const input = createContentReaderSchema.parse(await request.json());
    const created = await userService.createContentReader(input);
    await db.insert(auditLogs).values({
      userId: auth.session.userId,
      action: "create_content_reader",
      entityType: "user",
      entityId: created.id,
      changes: { email: created.email, role: created.role },
      ipAddress: clientIp(request),
    });
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: created,
        message: "Content Reader created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error, "Content Reader could not be created");
  }
}
