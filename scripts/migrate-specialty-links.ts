import { eq } from "drizzle-orm";
import { db, pool } from "../src/db";
import { contentEntries, pageSections } from "../src/db/schema";

/**
 * Gives the home page's specialty links a destination.
 *
 * They were stored as plain text and every one of them pointed at the section
 * it sat in, so all four looked like links and none of them went anywhere.
 * The stored shape is now { linkLabel, href }, and the panel offers an address
 * field per item -- but a page saved before this change still holds the old
 * strings, and the editor cannot fill in a field that is not in the data.
 *
 * Each known specialty is matched to its section on the clinical applications
 * page. Anything unrecognised is kept with an empty address rather than guessed
 * at: the page renders it as text, and the panel shows an editor the gap.
 */

const DESTINATIONS: [RegExp, string][] = [
  [/oncolog/i, "/clinical-applications#oncology"],
  [/plastic|reconstruct/i, "/clinical-applications#reconstructive"],
  [/gastro/i, "/clinical-applications#gastro"],
  [/urolog|gynaec|gynec/i, "/clinical-applications#urology"],
];

function destinationFor(label: string): string {
  return DESTINATIONS.find(([pattern]) => pattern.test(label))?.[1] ?? "";
}

/** Null when the value is already migrated or is not a list of labels. */
function upgrade(value: unknown): { linkLabel: string; href: string }[] | null {
  if (!Array.isArray(value)) return null;
  if (!value.every((item) => typeof item === "string")) return null;
  return (value as string[]).map((linkLabel) => ({
    linkLabel,
    href: destinationFor(linkLabel),
  }));
}

async function main() {
  try {
    let changed = 0;

    const sections = await db
      .select()
      .from(pageSections)
      .where(eq(pageSections.sectionKey, "specialtyLinks"));
    for (const section of sections) {
      const next = upgrade(section.data);
      if (!next) continue;
      await db
        .update(pageSections)
        .set({ data: next })
        .where(eq(pageSections.id, section.id));
      changed += 1;
      for (const link of next)
        console.log(`  ${link.linkLabel} -> ${link.href || "(no address)"}`);
    }

    // The sections table is what the panel edits, but the page's own content
    // column is what a fresh render falls back to, so both are brought over.
    const pages = await db
      .select()
      .from(contentEntries)
      .where(eq(contentEntries.type, "page"));
    for (const page of pages) {
      const content = page.content as Record<string, unknown>;
      const next = upgrade(content.specialtyLinks);
      if (!next) continue;
      await db
        .update(contentEntries)
        .set({ content: { ...content, specialtyLinks: next } })
        .where(eq(contentEntries.id, page.id));
      changed += 1;
    }

    console.log(
      changed
        ? `Updated ${changed} record${changed === 1 ? "" : "s"}.`
        : "Nothing to do: the specialty links already carry an address.",
    );
  } finally {
    await pool.end();
  }
}

void main();
