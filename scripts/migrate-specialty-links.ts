import { eq } from "drizzle-orm";
import { db, pool } from "../src/db";
import { contentEntries, pageSections } from "../src/db/schema";

/**
 * Gives the home page's links and documents somewhere to go.
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
 *
 * The document cards in the same page had the same shape of problem: they
 * stored a title, a category and a format, and every one of them led to the
 * resource library, so four separate downloads arrived at the same page and
 * none of them downloaded anything. Each now carries a `file`, added empty
 * here because the documents themselves are not in the repository -- an
 * editor attaches them from the media library.
 *
 * The performance figures gained an optional `prefix` for the same reason:
 * a number sometimes needs qualifying -- "<97%", "up to 150" -- and there
 * was nowhere to say so.
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

/**
 * Adds a field to every object in a list, or null when they all have it.
 *
 * The panel renders the keys the stored data holds, so a field added to the
 * schema is invisible until it is in the row -- an editor cannot fill in a
 * box that is not drawn.
 */
function withField(
  value: unknown,
  key: string,
  fallback: unknown,
): Record<string, unknown>[] | null {
  if (!Array.isArray(value)) return null;
  const items = value.filter(
    (item): item is Record<string, unknown> =>
      Boolean(item) && typeof item === "object" && !Array.isArray(item),
  );
  if (items.length !== value.length) return null;
  if (items.every((item) => key in item)) return null;
  return items.map((item) => ({ [key]: fallback, ...item }));
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

    // Each list that gained a field, and what the field is called in it.
    const additions: [string, string, unknown, string][] = [
      ["documents", "file", "", "document cards can now name a file"],
      ["figures", "prefix", "", "figures can now carry a prefix"],
    ];
    for (const [sectionKey, field, fallback, description] of additions) {
      const rows = await db
        .select()
        .from(pageSections)
        .where(eq(pageSections.sectionKey, sectionKey));
      for (const section of rows) {
        const next = withField(section.data, field, fallback);
        if (!next) continue;
        await db
          .update(pageSections)
          .set({ data: next })
          .where(eq(pageSections.id, section.id));
        changed += 1;
        console.log(`  ${next.length} ${description}`);
      }
    }

    // The sections table is what the panel edits, but the page's own content
    // column is what a fresh render falls back to, so both are brought over.
    const pages = await db
      .select()
      .from(contentEntries)
      .where(eq(contentEntries.type, "page"));
    for (const page of pages) {
      const content = page.content as Record<string, unknown>;
      const links = upgrade(content.specialtyLinks);
      const documents = withField(content.documents, "file", "");
      const figures = withField(content.figures, "prefix", "");
      if (!links && !documents && !figures) continue;
      await db
        .update(contentEntries)
        .set({
          content: {
            ...content,
            ...(links ? { specialtyLinks: links } : {}),
            ...(documents ? { documents } : {}),
            ...(figures ? { figures } : {}),
          },
        })
        .where(eq(contentEntries.id, page.id));
      changed += 1;
    }

    console.log(
      changed
        ? `Updated ${changed} record${changed === 1 ? "" : "s"}.`
        : "Nothing to do: the links and documents already carry an address.",
    );
  } finally {
    await pool.end();
  }
}

void main();
