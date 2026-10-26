import { and, eq } from "drizzle-orm";
import { db, pool } from "../src/db";
import { contentEntries, pageSections } from "../src/db/schema";

function labelFor(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/-/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

async function main() {
  try {
    const pages = await db
      .select()
      .from(contentEntries)
      .where(eq(contentEntries.type, "page"));
    for (const page of pages) {
      let sortOrder = 0;
      for (const [sectionKey, data] of Object.entries(page.content)) {
        if (
          sectionKey === "sections" &&
          data &&
          typeof data === "object" &&
          !Array.isArray(data)
        ) {
          for (const [nestedKey, nestedData] of Object.entries(
            data as Record<string, unknown>,
          )) {
            await db
              .insert(pageSections)
              .values({
                pageId: page.id,
                sectionKey: `sections__${nestedKey}`,
                label: labelFor(nestedKey),
                data: nestedData,
                sortOrder,
                isEnabled: true,
              })
              .onConflictDoNothing({
                target: [pageSections.pageId, pageSections.sectionKey],
              });
            sortOrder += 1;
          }
          await db
            .delete(pageSections)
            .where(
              and(
                eq(pageSections.pageId, page.id),
                eq(pageSections.sectionKey, "sections"),
              ),
            );
          continue;
        }
        await db
          .insert(pageSections)
          .values({
            pageId: page.id,
            sectionKey,
            label: labelFor(sectionKey),
            data,
            sortOrder,
            isEnabled: true,
          })
          .onConflictDoNothing({
            target: [pageSections.pageId, pageSections.sectionKey],
          });
        sortOrder += 1;
      }
    }
    console.log(`Structured sections are ready for ${pages.length} pages.`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
