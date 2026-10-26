import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { contentEntries, enquiries, mediaAssets } from "@/db/schema";
import { users } from "@/db/schema/users";
import { authorizeAdminApi } from "@/lib/admin-api";
import { createAdminExport, type ExportFormat } from "@/lib/admin-export";
import { apiError } from "@/lib/api";
import { CMS_TYPES } from "@/services/cms.service";
import {
  listAuditLogs,
  listSecurityEvents,
  listSessions,
} from "@/services/security.service";
import { parseUserAgent } from "@/lib/user-agent";

/** Security exports are capped so one request cannot pull the whole trail. */
const SECURITY_EXPORT_LIMIT = 5000;

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const dataset = params.get("dataset");
    const securityDatasets = new Set([
      "audit",
      "sessions",
      "security-events",
      "users",
    ]);
    const permission = securityDatasets.has(dataset ?? "")
      ? "users:manage"
      : dataset === "enquiries"
        ? "enquiries:manage"
        : dataset === "media"
          ? "media:read"
          : "content:read";
    const auth = await authorizeAdminApi({ permission });
    if (auth.response) return auth.response;
    const format = params.get("format") as ExportFormat;
    if (!new Set(["csv", "excel", "pdf"]).has(format))
      return NextResponse.json(
        { success: false, error: "Invalid export format" },
        { status: 400 },
      );

    let report: ReturnType<typeof createAdminExport>;
    if (dataset === "content") {
      const type = params.get("type");
      if (!type || !CMS_TYPES.includes(type as (typeof CMS_TYPES)[number]))
        return NextResponse.json(
          { success: false, error: "Invalid content type" },
          { status: 400 },
        );
      const rows = await db
        .select()
        .from(contentEntries)
        .where(eq(contentEntries.type, type))
        .orderBy(desc(contentEntries.updatedAt));
      report = createAdminExport(
        format,
        `${type} content`,
        [
          "Title",
          "Slug",
          "Summary",
          "Status",
          "Featured",
          "Content",
          "SEO",
          "Updated",
        ],
        rows.map((row) => [
          row.title,
          row.slug,
          row.summary,
          row.status,
          row.isFeatured,
          JSON.stringify(row.content),
          JSON.stringify(row.seo),
          row.updatedAt,
        ]),
      );
    } else if (dataset === "enquiries") {
      const rows = await db
        .select()
        .from(enquiries)
        .orderBy(desc(enquiries.createdAt));
      report = createAdminExport(
        format,
        "website enquiries",
        [
          "Name",
          "Email",
          "Phone",
          "Organisation",
          "Subject",
          "Message",
          "Status",
          "Received",
        ],
        rows.map((row) => [
          row.name,
          row.email,
          row.phone,
          row.organisation,
          row.subject,
          row.message,
          row.status,
          row.createdAt,
        ]),
      );
    } else if (dataset === "media") {
      const rows = await db
        .select()
        .from(mediaAssets)
        .orderBy(desc(mediaAssets.updatedAt));
      report = createAdminExport(
        format,
        "media library",
        ["Name", "Type", "Folder", "URL", "Alt text", "Bytes", "Updated"],
        rows.map((row) => [
          row.name,
          row.mimeType,
          row.folder,
          row.url,
          row.altText,
          row.size,
          row.updatedAt,
        ]),
      );
    } else if (dataset === "users") {
      const rows = await db
        .select({
          name: users.name,
          email: users.email,
          role: users.role,
          isActive: users.isActive,
          mustChangePassword: users.mustChangePassword,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt));
      report = createAdminExport(
        format,
        "administrator accounts",
        ["Name", "Email", "Role", "Status", "Must change password", "Created"],
        rows.map((row) => [
          row.name,
          row.email,
          row.role,
          row.isActive ? "Active" : "Disabled",
          row.mustChangePassword ? "Yes" : "No",
          row.createdAt,
        ]),
      );
    } else if (dataset === "audit") {
      const { rows } = await listAuditLogs({
        page: 1,
        pageSize: SECURITY_EXPORT_LIMIT,
      });
      report = createAdminExport(
        format,
        "audit trail",
        [
          "When",
          "Administrator",
          "Email",
          "Action",
          "Record type",
          "Record",
          "IP address",
          "Details",
        ],
        rows.map((row) => [
          row.createdAt,
          row.userName,
          row.userEmail,
          row.action,
          row.entityType,
          row.entityId,
          row.ipAddress,
          JSON.stringify(row.changes),
        ]),
      );
    } else if (dataset === "sessions") {
      const { rows } = await listSessions({
        page: 1,
        pageSize: SECURITY_EXPORT_LIMIT,
      });
      report = createAdminExport(
        format,
        "sign-in sessions",
        [
          "Account",
          "Email",
          "Role",
          "Device",
          "Browser",
          "Operating system",
          "IP address",
          "Signed in",
          "Last seen",
          "Expires",
          "Revoked",
        ],
        rows.map((row) => {
          const device = parseUserAgent(row.userAgent);
          return [
            row.userName,
            row.userEmail,
            row.userRole,
            device.type,
            device.browser,
            device.os,
            row.ipAddress,
            row.createdAt,
            row.lastSeenAt,
            row.expiresAt,
            row.revokedAt,
          ];
        }),
      );
    } else if (dataset === "security-events") {
      const { rows } = await listSecurityEvents({
        page: 1,
        pageSize: SECURITY_EXPORT_LIMIT,
      });
      report = createAdminExport(
        format,
        "security events",
        [
          "When",
          "Event",
          "Outcome",
          "Email",
          "IP address",
          "Device",
          "Browser",
          "Operating system",
        ],
        rows.map((row) => {
          const device = parseUserAgent(row.userAgent);
          return [
            row.createdAt,
            row.event,
            row.success ? "Success" : "Failed",
            row.email,
            row.ipAddress,
            device.type,
            device.browser,
            device.os,
          ];
        }),
      );
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid export dataset" },
        { status: 400 },
      );
    }
    return new NextResponse(new Uint8Array(report.body), {
      headers: {
        "Content-Type": report.contentType,
        "Content-Disposition": `attachment; filename="${report.filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return apiError(error, "Export could not be generated");
  }
}
