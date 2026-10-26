import { NextResponse } from "next/server";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { authorizeAdminApi } from "@/lib/admin-api";
import { apiError } from "@/lib/api";
import { paginationFromUrl, paginationMeta } from "@/lib/pagination";

export async function GET(request: Request) {
  try {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;
    const { params, page, limit, offset } = paginationFromUrl(request);
    const search = params.get("search")?.trim();
    const status = params.get("status")?.trim();
    const kind = params.get("kind")?.trim();
    const conditions = [
      status ? eq(enquiries.status, status) : undefined,
      kind ? eq(enquiries.kind, kind) : undefined,
      search
        ? or(
            ilike(enquiries.name, `%${search}%`),
            ilike(enquiries.email, `%${search}%`),
            ilike(enquiries.subject, `%${search}%`),
            ilike(enquiries.organisation, `%${search}%`),
          )
        : undefined,
    ].filter(Boolean);
    const where = conditions.length ? and(...conditions) : undefined;
    const [rows, totalRows] = await Promise.all([
      db
        .select()
        .from(enquiries)
        .where(where)
        .orderBy(desc(enquiries.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(enquiries).where(where),
    ]);
    const total = totalRows[0]?.value ?? 0;
    return NextResponse.json({
      success: true,
      data: rows,
      pagination: paginationMeta(page, limit, total),
    });
  } catch (error) {
    return apiError(error, "Enquiries could not be loaded");
  }
}
