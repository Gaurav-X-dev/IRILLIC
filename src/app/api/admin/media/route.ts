import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, mediaAssets } from "@/db/schema";
import { authorizeAdminApi } from "@/lib/admin-api";
import { apiError, clientIp } from "@/lib/api";
import { hasExpectedFileSignature } from "@/lib/file-signature";
import { paginationFromUrl, paginationMeta } from "@/lib/pagination";

export const runtime = "nodejs";
const allowed = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["application/pdf", "pdf"],
  ["video/mp4", "mp4"],
]);

export async function GET(request: Request) {
  try {
    const auth = await authorizeAdminApi({ permission: "media:read" });
    if (auth.response) return auth.response;
    const { params, page, limit, offset } = paginationFromUrl(request);
    const search = params.get("search")?.trim();
    const folder = params.get("folder")?.trim();
    const conditions = [
      folder ? eq(mediaAssets.folder, folder) : undefined,
      search
        ? or(
            ilike(mediaAssets.name, `%${search}%`),
            ilike(mediaAssets.mimeType, `%${search}%`),
            ilike(mediaAssets.folder, `%${search}%`),
          )
        : undefined,
    ].filter(Boolean);
    const where = conditions.length ? and(...conditions) : undefined;
    const [rows, totalRows] = await Promise.all([
      db
        .select()
        .from(mediaAssets)
        .where(where)
        .orderBy(desc(mediaAssets.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(mediaAssets).where(where),
    ]);
    const total = totalRows[0]?.value ?? 0;
    return NextResponse.json({
      success: true,
      data: rows,
      pagination: paginationMeta(page, limit, total),
    });
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request) {
  try {
    const auth = await authorizeAdminApi();
    if (auth.response || !auth.session) return auth.response;
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File))
      return NextResponse.json(
        { success: false, error: "Choose a file" },
        { status: 400 },
      );
    let extension = allowed.get(file.type);
    if (!extension)
      return NextResponse.json(
        { success: false, error: "Unsupported file type" },
        { status: 415 },
      );
    if (file.size > 10 * 1024 * 1024)
      return NextResponse.json(
        { success: false, error: "File must be 10 MB or smaller" },
        { status: 413 },
      );
    const source = Buffer.from(await file.arrayBuffer());
    const isImage = file.type.startsWith("image/");
    if (!isImage && !hasExpectedFileSignature(file.type, source))
      return NextResponse.json(
        {
          success: false,
          error: "File content does not match its declared type",
        },
        { status: 400 },
      );
    let output: Buffer;
    try {
      output = isImage
        ? await sharp(source, { limitInputPixels: 40_000_000 })
            .rotate()
            .webp({
              quality: 84,
              alphaQuality: 90,
              smartSubsample: true,
              effort: 5,
            })
            .toBuffer()
        : source;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Image is corrupt or exceeds the 40 megapixel limit",
        },
        { status: 400 },
      );
    }
    if (isImage) extension = "webp";
    const folder = String(form.get("folder") || "general")
      .replace(/[^a-z0-9-]/gi, "-")
      .toLowerCase();
    const filename = `${randomUUID()}.${extension}`;
    const directory = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), output, { flag: "wx" });
    const [asset] = await db
      .insert(mediaAssets)
      .values({
        name: String(form.get("name") || file.name).slice(0, 255),
        url: `/uploads/${folder}/${filename}`,
        mimeType: isImage ? "image/webp" : file.type,
        size: output.length,
        altText: String(form.get("altText") || "").slice(0, 500),
        folder,
      })
      .returning();
    await db.insert(auditLogs).values({
      userId: auth.session.userId,
      action: "upload",
      entityType: "media",
      entityId: asset.id,
      changes: { name: asset.name, url: asset.url },
      ipAddress: clientIp(request),
    });
    return NextResponse.json({ success: true, data: asset }, { status: 201 });
  } catch (error) {
    return apiError(error, "File could not be uploaded");
  }
}
