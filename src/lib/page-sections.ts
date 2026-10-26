import type { PageSection } from "@/db/schema";

export function assertSafeSectionData(value: unknown) {
  const serialized = JSON.stringify(value);
  if (!serialized || serialized.length > 250_000)
    throw new Error("Section content must be valid JSON smaller than 250 KB.");
  function visit(node: unknown, depth: number) {
    if (depth > 12) throw new Error("Section content is nested too deeply.");
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node))
      return node.forEach((item) => visit(item, depth + 1));
    for (const [key, item] of Object.entries(node as Record<string, unknown>)) {
      if (["__proto__", "prototype", "constructor"].includes(key))
        throw new Error("Unsafe field name in section content.");
      visit(item, depth + 1);
    }
  }
  visit(value, 0);
  return value;
}

export function assemblePageContent(
  sections: Pick<
    PageSection,
    "sectionKey" | "data" | "isEnabled" | "sortOrder"
  >[],
) {
  const content: Record<string, unknown> = {};
  for (const section of sections
    .filter((item) => item.isEnabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)) {
    const path = section.sectionKey.split("__");
    let target = content;
    for (const key of path.slice(0, -1)) {
      const current = target[key];
      target[key] =
        current && typeof current === "object" && !Array.isArray(current)
          ? current
          : {};
      target = target[key] as Record<string, unknown>;
    }
    target[path.at(-1)!] = section.data;
  }
  return content;
}
