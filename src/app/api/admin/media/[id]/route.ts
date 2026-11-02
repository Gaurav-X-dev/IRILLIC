import { unlink } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  auditLogs,
  contentEntries,
  mediaAssets,
  pageSections,
  siteSettings,
} from "@/db/schema";
import { authorizeAdminApi } from "@/lib/admin-api";
import { apiError, clientIp } from "@/lib/api";

export const runtime = "nodejs";

interface Context {
  params: Promise<{ id: string }>;
}

const idSchema = z.string().uuid("Invalid media identifier");

/**
 * Everywhere the website could be pointing at this file.
 *
 * Deleting an asset that a page or a logo still refers to does not fail
 * loudly — it leaves a broken image on the live site that nobody notices
 * until a visitor does. The stored JSON is small enough to read and search
 * directly, which also catches a path typed by hand into a section field
 * rather than chosen from the library.
 */
async function referencesTo(url: string): Promise<string[]> {
  const [settings, entries, sections] = await Promise.all([
    db
      .select({ key: siteSettings.key, value: siteSettings.value })
      .from(siteSettings),
    db
      .select({
        title: contentEntries.title,
        content: contentEntries.content,
        seo: contentEntries.seo,
      })
      .from(contentEntries),
    db
      .select({ label: pageSections.label, data: pageSections.data })
      .from(pageSections),
  ]);

  const used: string[] = [];
  for (const setting of settings)
    if (JSON.stringify(setting.value ?? "").includes(url))
      used.push(`the "${setting.key}" setting`);
  for (const entry of entries)
    if (JSON.stringify([entry.content, entry.seo]).includes(url))
      used.push(`the "${entry.title}" entry`);
  for (const section of sections)
    if (JSON.stringify(section.data ?? "").includes(url))
      used.push(`the "${section.label}" section`);
  return used;
}

/** The file on disk, refusing any URL that climbs out of the uploads folder. */
function storedPath(url: string): string | null {
  const uploads = path.join(process.cwd(), "public", "uploads");
  const resolved = path.resolve(
    path.join(process.cwd(), "public", url.replace(/^\/+/, "")),
  );
  return resolved.startsWith(uploads + path.sep) ? resolved : null;
}

export async function DELETE(request: Request, context: Context) {
  try {
    const auth = await authorizeAdminApi({ permission: "media:write" });
    if (auth.response || !auth.session) return auth.response;
    const id = idSchema.parse((await context.params).id);
    const [asset] = await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, id))
      .limit(1);
    if (!asset)
      return NextResponse.json(
        { success: false, error: "This file is no longer in the library." },
        { status: 404 },
      );

    const used = await referencesTo(asset.url);
    if (used.length)
      return NextResponse.json(
        {
          success: false,
          error:
            `${asset.name} is still used by ${used.slice(0, 3).join(", ")}` +
            `${used.length > 3 ? ` and ${used.length - 3} more` : ""}. ` +
            "Replace it there first, then delete it.",
          references: used,
        },
        { status: 409 },
      );

    // The row goes first: a file left on disk is wasted space, but a row
    // pointing at a file that is gone is a broken image on the website.
    await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
    const file = storedPath(asset.url);
    if (file)
      await unlink(file).catch((cause: NodeJS.ErrnoException) => {
        if (cause.code !== "ENOENT") throw cause;
      });
    await db.insert(auditLogs).values({
      userId: auth.session.userId,
      action: "delete",
      entityType: "media",
      entityId: id,
      changes: { name: asset.name, url: asset.url },
      ipAddress: clientIp(request),
    });
    return NextResponse.json({
      success: true,
      message: `${asset.name} was deleted.`,
    });
  } catch (error) {
    return apiError(error, "The file could not be deleted");
  }
}
