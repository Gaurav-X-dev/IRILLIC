import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { authorizeAdminApi } from "@/lib/admin-api";
import { apiError, clientIp } from "@/lib/api";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(255),
  email: z.string().trim().toLowerCase().email().max(255),
});

export async function GET() {
  try {
    const auth = await authorizeAdminApi({ permission: "profile:manage" });
    if (auth.response || !auth.session) return auth.response;
    const [profile] = await db
      .select({
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, auth.session.userId))
      .limit(1);
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return apiError(error, "Profile could not be loaded");
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await authorizeAdminApi({ permission: "profile:manage" });
    if (auth.response || !auth.session) return auth.response;
    const form = await request.formData();
    const input = profileSchema.parse({
      name: form.get("name"),
      email: form.get("email"),
    });
    const file = form.get("avatar");
    let avatar: string | undefined;

    if (file instanceof File && file.size > 0) {
      if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type))
        return NextResponse.json(
          { success: false, error: "Use a JPEG, PNG or WebP profile image" },
          { status: 415 },
        );
      if (file.size > 5 * 1024 * 1024)
        return NextResponse.json(
          { success: false, error: "Profile image must be 5 MB or smaller" },
          { status: 413 },
        );
      const output = await sharp(Buffer.from(await file.arrayBuffer()), {
        limitInputPixels: 25_000_000,
      })
        .rotate()
        .resize(512, 512, { fit: "cover", position: "attention" })
        .webp({ quality: 86, effort: 5 })
        .toBuffer();
      const directory = path.join(
        process.cwd(),
        "public",
        "uploads",
        "avatars",
      );
      await mkdir(directory, { recursive: true });
      const filename = `${randomUUID()}.webp`;
      await writeFile(path.join(directory, filename), output, { flag: "wx" });
      avatar = `/uploads/avatars/${filename}`;
    }

    const [updated] = await db
      .update(users)
      .set({ ...input, ...(avatar ? { avatar } : {}), updatedAt: new Date() })
      .where(eq(users.id, auth.session.userId))
      .returning({
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        role: users.role,
      });
    await db.insert(auditLogs).values({
      userId: auth.session.userId,
      action: "update_profile",
      entityType: "user",
      entityId: auth.session.userId,
      changes: {
        name: updated.name,
        email: updated.email,
        avatarChanged: !!avatar,
      },
      ipAddress: clientIp(request),
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return apiError(error, "Profile could not be updated");
  }
}
