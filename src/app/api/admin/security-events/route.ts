import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/lib/admin-api";
import { apiError } from "@/lib/api";
import { paginationFromUrl, paginationMeta } from "@/lib/pagination";
import {
  listSecurityEvents,
  securityEventNames,
} from "@/services/security.service";
import { parseUserAgent } from "@/lib/user-agent";

export async function GET(request: Request) {
  try {
    const auth = await authorizeAdminApi({ permission: "users:manage" });
    if (auth.response) return auth.response;
    const { params, page, limit } = paginationFromUrl(request);
    const days = Number(params.get("days") || 0);

    const [result, events] = await Promise.all([
      listSecurityEvents({
        page,
        pageSize: limit,
        search: params.get("search") ?? undefined,
        filter: params.get("event") ?? undefined,
        days: Number.isFinite(days) ? days : 0,
      }),
      securityEventNames(),
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows.map((row) => ({
        ...row,
        device: parseUserAgent(row.userAgent),
      })),
      events,
      pagination: paginationMeta(page, limit, result.total),
    });
  } catch (error) {
    return apiError(error);
  }
}
