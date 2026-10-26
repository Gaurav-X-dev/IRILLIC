import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/lib/admin-api";
import { apiError } from "@/lib/api";
import { paginationFromUrl, paginationMeta } from "@/lib/pagination";
import { listSessions, sessionSummary } from "@/services/security.service";
import { parseUserAgent } from "@/lib/user-agent";

export async function GET(request: Request) {
  try {
    const auth = await authorizeAdminApi({ permission: "users:manage" });
    if (auth.response) return auth.response;
    const { params, page, limit } = paginationFromUrl(request);
    const status = params.get("status");

    const [result, summary] = await Promise.all([
      listSessions({
        page,
        pageSize: limit,
        search: params.get("search") ?? undefined,
        status: status === "active" || status === "ended" ? status : undefined,
      }),
      sessionSummary(),
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows.map((row) => ({
        ...row,
        device: parseUserAgent(row.userAgent),
      })),
      summary,
      pagination: paginationMeta(page, limit, result.total),
    });
  } catch (error) {
    return apiError(error);
  }
}
