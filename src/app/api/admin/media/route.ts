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
/** One stored file, or the reason it could not be stored. */
type Stored =
  | { ok: true; asset: typeof mediaAssets.$inferSelect }
  | { ok: false; name: string; error: string };

async function storeFile(
  file: File,
  meta: { folder: string; name: string; altText: string },
): Promise<Stored> {
  const fail = (error: string): Stored => ({ ok: false, name: file.name, error });
  let extension = allowed.get(file.type);
  if (!extension) return fail("Unsupported file type");
  if (file.size > 10 * 1024 * 1024) return fail("File must be 10 MB or smaller");
  const source = Buffer.from(await file.arrayBuffer());
  const isImage = file.type.startsWith("image/");
  if (!isImage && !hasExpectedFileSignature(file.type, source))
    return fail("File content does not match its declared type");
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
    return fail("Image is corrupt or exceeds the 40 megapixel limit");
  }
  if (isImage) extension = "webp";
  const filename = `${randomUUID()}.${extension}`;
  const directory = path.join(process.cwd(), "public", "uploads", meta.folder);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), output, { flag: "wx" });
  const [asset] = await db
    .insert(mediaAssets)
    .values({
      name: (meta.name || file.name).slice(0, 255),
      url: `/uploads/${meta.folder}/${filename}`,
      mimeType: isImage ? "image/webp" : file.type,
      size: output.length,
      altText: meta.altText.slice(0, 500),
      folder: meta.folder,
    })
    .returning();
  return { ok: true, asset };
}

export async function POST(request: Request) {
  try {
    const auth = await authorizeAdminApi({ permission: "media:write" });
    if (auth.response || !auth.session) return auth.response;
    const form = await request.formData();
    const files = form
      .getAll("file")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);
    if (!files.length)
      return NextResponse.json(
        { success: false, error: "Choose at least one file" },
        { status: 400 },
      );
    const folder = String(form.get("folder") || "general")
      .replace(/[^a-z0-9-]/gi, "-")
      .toLowerCase();
    // A display name belongs to one file. Uploading several keeps each file's
    // own name, since one name cannot describe all of them.
    const single = files.length === 1;
    const name = single ? String(form.get("name") || "") : "";
    const altText = single ? String(form.get("altText") || "") : "";

    const results: Stored[] = [];
    for (const file of files)
      results.push(await storeFile(file, { folder, name, altText }));

    const stored = results.filter((r) => r.ok).map((r) => r.asset);
    const failed = results
      .filter((r): r is Extract<Stored, { ok: false }> => !r.ok)
      .map(({ name: fileName, error }) => ({ name: fileName, error }));

    for (const asset of stored)
      await db.insert(auditLogs).values({
        userId: auth.session.userId,
        action: "upload",
        entityType: "media",
        entityId: asset.id,
        changes: { name: asset.name, url: asset.url },
        ipAddress: clientIp(request),
      });

    if (!stored.length)
      return NextResponse.json(
        { success: false, error: failed[0]?.error ?? "Upload failed", failed },
        { status: 415 },
      );
    return NextResponse.json(
      { success: true, data: single ? stored[0] : stored, stored: stored.length, failed },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error, "File could not be uploaded");
  }
}
