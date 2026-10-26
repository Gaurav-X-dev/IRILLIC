import { NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { authorizeAdminApi } from "@/lib/admin-api";
import { apiError, clientIp } from "@/lib/api";
import { getSettingGroup, saveSettingGroup } from "@/services/settings.service";
import { settingInputSchema } from "@/validations/cms.validation";

type Context = { params: Promise<{ group: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;
    const { group } = await context.params;
    return NextResponse.json({
      success: true,
      data: await getSettingGroup(group),
    });
  } catch (error) {
    return apiError(error);
  }
}
export async function PUT(request: Request, context: Context) {
  try {
    const auth = await authorizeAdminApi();
    if (auth.response || !auth.session) return auth.response;
    const { group } = await context.params;
    const input = settingInputSchema.parse({
      ...(await request.json()),
      group,
    });
    await saveSettingGroup(group, input.values);
    await db.insert(auditLogs).values({
      userId: auth.session.userId,
      action: "update",
      entityType: "settings",
      entityId: group,
      changes: { keys: Object.keys(input.values) },
      ipAddress: clientIp(request),
    });
    return NextResponse.json({
      success: true,
      data: await getSettingGroup(group),
    });
  } catch (error) {
    return apiError(error);
  }
}
