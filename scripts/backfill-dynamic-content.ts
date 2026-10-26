import { eq, and } from "drizzle-orm";
import { db, pool } from "../src/db";
import { contentEntries } from "../src/db/schema";
import {
  CLINICAL_APPLICATIONS_PAGE_CONTENT,
  CLINICAL_RESOURCES_PAGE_CONTENT,
  CONTACT_CONTENT,
  HOME_CONTENT,
} from "../src/db/seed-data";

function mergeMissing(current: unknown, defaults: unknown): unknown {
  if (Array.isArray(current)) return current;
  if (
    !current ||
    typeof current !== "object" ||
    !defaults ||
    typeof defaults !== "object" ||
    Array.isArray(defaults)
  )
    return current ?? defaults;
  const result = { ...(current as Record<string, unknown>) };
  for (const [key, value] of Object.entries(
    defaults as Record<string, unknown>,
  ))
    result[key] = key in result ? mergeMissing(result[key], value) : value;
  return result;
}

const pages = [
  ["home", HOME_CONTENT],
  ["contact", CONTACT_CONTENT],
  ["clinical-applications", CLINICAL_APPLICATIONS_PAGE_CONTENT],
  ["clinical-resources", CLINICAL_RESOURCES_PAGE_CONTENT],
] as const;

async function main() {
  try {
    for (const [slug, defaults] of pages) {
      const [entry] = await db
        .select({ id: contentEntries.id, content: contentEntries.content })
        .from(contentEntries)
        .where(
          and(eq(contentEntries.type, "page"), eq(contentEntries.slug, slug)),
        )
        .limit(1);
      if (!entry) throw new Error(`Required CMS page is missing: ${slug}`);
      await db
        .update(contentEntries)
        .set({
          content: mergeMissing(entry.content, defaults) as Record<
            string,
            unknown
          >,
          updatedAt: new Date(),
        })
        .where(eq(contentEntries.id, entry.id));
    }
    console.log(
      "Missing dynamic content fields were added without overwriting CMS edits.",
    );
  } finally {
    await pool.end();
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
