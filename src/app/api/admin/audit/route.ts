import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/lib/admin-api";
import { apiError } from "@/lib/api";
import { paginationFromUrl, paginationMeta } from "@/lib/pagination";
import { auditActions, listAuditLogs } from "@/services/security.service";

/** The audit trail is security data, so only a full administrator may read it. */
export async function GET(request: Request) {
  try {
    const auth = await authorizeAdminApi({ permission: "users:manage" });
    if (auth.response) return auth.response;
    const { params, page, limit } = paginationFromUrl(request);
    const days = Number(params.get("days") || 0);

    const [result, actions] = await Promise.all([
      listAuditLogs({
        page,
        pageSize: limit,
        search: params.get("search") ?? undefined,
        filter: params.get("action") ?? undefined,
        days: Number.isFinite(days) ? days : 0,
      }),
      auditActions(),
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows,
      actions,
      pagination: paginationMeta(page, limit, result.total),
    });
  } catch (error) {
    return apiError(error);
  }
}
