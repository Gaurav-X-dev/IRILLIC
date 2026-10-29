import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { decryptSecret, encryptSecret } from "@/lib/secrets";

const SECRET_KEYS = new Set(["smtp.password"]);

export async function getSettingGroup(group: string, includeSecrets = false) {
  const rows = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.group, group));
  return Object.fromEntries(
    rows.map((row) => [
      row.key.replace(`${group}.`, ""),
      row.isSecret
        ? includeSecrets && typeof row.value === "string"
          ? decryptSecret(row.value)
          : "••••••••"
        : row.value,
    ]),
  );
}

export async function saveSettingGroup(
  group: string,
  values: Record<string, string | number | boolean | null>,
) {
  for (const [name, raw] of Object.entries(values)) {
    const settingKey = `${group}.${name}`;
    const isSecret = SECRET_KEYS.has(settingKey);
    if (isSecret && (raw === "" || raw === "••••••••")) continue;
    // Every setting but the SMTP port is text. A value that happens to read as
    // a number — a phone number, a postcode — must not be stored as one, or it
    // comes back from JSONB as a number and no longer matches its own type.
    const text = typeof raw === "number" && settingKey !== "smtp.port";
    const value = isSecret
      ? typeof raw === "string"
        ? encryptSecret(raw)
        : raw
      : text
        ? String(raw)
        : raw;
    await db
      .insert(siteSettings)
      .values({ key: settingKey, group, value, isSecret })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value, isSecret, updatedAt: new Date() },
      });
  }
}
